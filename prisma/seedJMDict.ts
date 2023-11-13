import { createReadStream } from "fs";

import { PrismaClient } from "@prisma/client";

import { files } from "~/lib/files.server";

import { executeAndLogTime } from "./kanjisense/executeAndLogTime";
import { parseXmlChunks } from "./kanjisense/parseXmlChunks";
import { registerSeeded } from "./seedUtils";

export async function seedJMDict(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "JMDictEntry" },
  });
  if (seeded && !force) console.log(`JMDict already seeded. 🌱`);
  else {
    console.log(`seeding JMDict...`);

    await prisma.jmDictEntry.deleteMany({});
    await executeAndLogTime("parsing xml", () => parseXml(prisma));

    await registerSeeded(prisma, "JMDictEntry");
  }

  console.log(`JMDict seeded. 🌱`);
}

async function parseXml(prisma: PrismaClient, entriesBatchSize = 10000) {
  const createdKeys = new Set<number>();

  const stream = createReadStream(files.jmdictXml);
  stream.setEncoding("utf-8");

  let entriesBatch: Entry[] = [];

  const currentTags: string[] = [];
  function currentTagIs(name: string) {
    const lastTag = currentTags[currentTags.length - 1];
    return lastTag === name;
  }
  function currentEntry(): Entry | null {
    return entriesBatch[entriesBatch.length - 1] || null;
  }
  try {
    await parseXmlChunks(stream, {
      async onOpenTag({ name }) {
        currentTags.push(name);

        if (name === "entry") entriesBatch.push(new Entry(0, [], []));
      },
      async onCloseTag({ name }) {
        currentTags.pop();
        if (name === "entry" && entriesBatch.length >= entriesBatchSize) {
          console.log("entries batch complete!");
          await createEntriesFromBatch(
            prisma,
            createdKeys,
            entriesBatch,
            () => {
              entriesBatch = [];
              console.log("starting new entries batch");
            },
          );
        }
      },
      async onText(text) {
        if (currentTagIs("ent_seq")) {
          currentEntry()!.id = +text;
        }
        if (currentTagIs("keb")) {
          currentEntry()?.heads.push(text);
        }
        if (currentTagIs("reb")) {
          currentEntry()?.readings.push(text);
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async onChunkParsed() {},
    });
  } catch (e) {
    console.error(e);
    throw new Error("Problem parsing XML");
  }

  console.log("Done parsing");
  createEntriesFromBatch(prisma, createdKeys, entriesBatch, () => {
    console.log("done");
  });

  console.log(await prisma.jmDictEntry.count({}));
}

async function createEntriesFromBatch(
  prisma: PrismaClient,
  createdKeys: Set<number>,
  entriesBatch: Entry[],
  onFinish: () => void,
) {
  const entriesInput = new Map<number, CreateEntryInput>();

  entriesBatch.forEach((entry) =>
    entry.heads.forEach((head) =>
      entry.readings.forEach((readingText) => {
        const key = getEntryKey(head, readingText);
        if (!createdKeys.has(key)) {
          createdKeys.add(key);
          entriesInput.set(key, new CreateEntryInput(head, readingText));
        }
      }),
    ),
  );
  console.log(
    `About to create ${entriesInput.size} entries (from ${entriesBatch.length} in XML)`,
  );

  await prisma.jmDictEntry.createMany({
    data: Array.from(entriesInput.values()),
  });

  console.log(`${entriesInput.size} entries created!)`);

  onFinish();
}

class CreateEntryInput {
  head: string;
  readingText: string;
  constructor(head: string, readingText: string) {
    this.head = head;
    this.readingText = readingText;
  }
}

class Entry {
  id: number;
  heads: string[];
  readings: string[];
  constructor(id: number, heads: string[], readings: string[]) {
    this.id = id;
    this.heads = heads;
    this.readings = readings;
  }
}
function getEntryKey(head: string, readingText: string) {
  return hash(`${head}@${readingText}`);
}

function hash(string: string) {
  let hash = 0,
    i,
    chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
