import { PrismaClient } from "@prisma/client";

import { executeAndLogTime } from "prisma/kanjisense/executeAndLogTime";
import { inBatchesOf } from "prisma/kanjisense/inBatchesOf";
import { getSeedInterface } from "prisma/SeedInterface";
import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { runSetupStep } from "../seedUtils";

export async function seedUnihan15(prisma: PrismaClient, force = false) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    step: "Unihan15",
    force,
    version: "KEYLESS STEP",
    async setup() {
      await prisma.unihan15.deleteMany({});

      const dbInput = new Map<string, Record<string, string>>();

      await executeAndLogTime("getting readings data", async () => {
        await forEachLine(files.unihanReadings15, async (line) => {
          if (!line || line.startsWith("#")) return;

          const { uCode, fieldName, body } =
            /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(
              line,
            )!.groups!;
          const head = String.fromCodePoint(parseInt(uCode, 16));
          const entry = dbInput.get(head) || {};
          entry[fieldName] = body;
          dbInput.set(head, entry);
        });
      });

      await executeAndLogTime("getting radical data", async () => {
        await forEachLine(files.unihanIrgSources15, async (line) => {
          if (!line || line.startsWith("#")) return;

          const { uCode, fieldName, body } =
            /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(
              line,
            )!.groups!;
          if (fieldName !== "kRSUnicode") return;

          const head = String.fromCodePoint(parseInt(uCode, 16));
          const entry = dbInput.get(head) || {};
          entry.kRSUnicode = body;
          dbInput.set(head, entry);
        });

        await forEachLine(files.unihanRadicals15, async (line) => {
          if (!line || line.startsWith("#")) return;

          const { uCode, body } =
            /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>kRSAdobe_Japan1_6)\s+(?<body>.+)/u.exec(
              line,
            )!.groups!;
          const head = String.fromCodePoint(parseInt(uCode, 16));

          const entry = dbInput.get(head) || {};
          entry.kRSAdobe_Japan1_6 = body;
          dbInput.set(head, entry);
        });
      });

      await inBatchesOf({
        batchSize: 500,
        collection: dbInput,
        getBatchItem: ([id, fields]) => ({
          id,
          kDefinition: fields.kDefinition || null,
          kCantonese: fields.kCantonese?.split(" ") || [],
          kHangul: fields.kHangul?.split(" ") || [],
          kHanyuPinlu: fields.kHanyuPinlu?.split(" ") || [],
          kHanyuPinyin: fields.kHanyuPinyin?.split(" ") || [],
          kJapaneseKun: fields.kJapaneseKun?.split(" ") || [],
          kJapaneseOn: fields.kJapaneseOn?.split(" ") || [],
          kKorean: fields.kKorean?.split(" ") || [],
          kMandarin: fields.kMandarin?.split(" ") || [],
          kTang: fields.kTang?.split(" ") || [],
          kTGHZ2013: fields.kTGHZ2013?.split(" ") || [],
          kVietnamese: fields.kVietnamese?.split(" ") || [],
          kXHC1983: fields.kXHC1983?.split(" ") || [],
          kRSAdobe_Japan1_6: fields.kRSAdobe_Japan1_6?.split(" ") || [],
          kRSUnicode: fields.kRSUnicode?.split(" ") || [],
        }),
        action: (data) => prisma.unihan15.createMany({ data }),
      });
    },
  });
}

export async function connectReadings(
  prisma: PrismaClient,
  version: number,
  dbInput: Map<string, Record<string, string>>,
  verbose: boolean,
) {
  await executeAndLogTime("connecting readings", async () => {
    const allReadings = await prisma.kanjisenseFigureReading
      .findMany({
        where: { version },
        select: { id: true },
      })
      .then((x) => x.map((x) => x.id));
    for (const readingId of allReadings) {
      const reading = dbInput.get(readingId);
      if (reading) {
        if (verbose && reading.kRSUnicode.includes(" "))
          console.log(
            `Found more than one radical for ${readingId}: ${reading.kRSUnicode}`,
          );
        await prisma.kanjisenseFigureReading.update({
          where: {
            id: readingId,
          },
          data: {
            unihan15Id: reading.key,
          },
        });
      }
    }
  });
}

export function getRadicalNumber(character: string, adobeJapanRsText?: string) {
  if (!adobeJapanRsText) return null;
  // U+4E97	kRSAdobe_Japan1_6	C+21081+7.2.3 C+21081+46.3.2
  // [CV]\+[0-9]{1,5}\+[1-9][0-9]{0,2}\.[1-9][0-9]?\.[0-9]{1,2}
  if (adobeJapanRsText.includes(" ")) {
    return null;
  }

  const [, , radicalAndStrokes] = adobeJapanRsText.split("+");
  const [radicalNumberText, ,] = radicalAndStrokes.split(".");
  return +radicalNumberText;
}
