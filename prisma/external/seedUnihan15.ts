import { PrismaClient } from "@prisma/client";

import { executeAndLogTime } from "prisma/kanjisense/executeAndLogTime";
import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { registerSeeded } from "../seedUtils";

export async function seedUnihan15(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "Unihan15" },
  });
  if (seeded && !force) console.log(`unihan15 already seeded. 🌱`);
  else {
    console.log(`seeding unihan15...`);

    await prisma.unihan15.deleteMany({});

    const dbInput: Record<
      string,
      { id: string; fields: Record<string, string> }
    > = {};
    await forEachLine(files.unihanReadings15, async (line) => {
      if (!line || line.startsWith("#")) return;

      const { uCode, fieldName, body } =
        /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(line)!
          .groups!;
      const head = String.fromCodePoint(parseInt(uCode, 16));
      dbInput[head] = dbInput[head] || {
        id: head,
        fields: {},
      };
      dbInput[head].fields[fieldName] = body;
    });

    await forEachLine(files.unihanIrgSources15, async (line) => {
      if (!line || line.startsWith("#")) return;

      const { uCode, fieldName, body } =
        /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(line)!
          .groups!;
      if (fieldName !== "kRSUnicode") return;

      const head = String.fromCodePoint(parseInt(uCode, 16));
      dbInput[head] = dbInput[head] || {
        id: head,
        fields: {},
      };
      dbInput[head].fields.kRSUnicode = body;
    });

    await forEachLine(files.unihanRadicals15, async (line) => {
      if (!line || line.startsWith("#")) return;

      const { uCode, body } =
        /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>kRSAdobe_Japan1_6)\s+(?<body>.+)/u.exec(
          line,
        )!.groups!;
      const head = String.fromCodePoint(parseInt(uCode, 16));
      dbInput[head] = dbInput[head] || {
        id: head,
        fields: {},
      };
      dbInput[head].fields.kRSAdobe_Japan1_6 = body;
    });

    const data = Object.values(dbInput).map(({ id, fields }) => ({
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
    }));

    const x = await prisma.unihan15.createMany({
      data,
    });
    console.log(`${x.count} created.`);

    await executeAndLogTime("connecting readings", async () => {
      const allReadings = await prisma.kanjisenseFigureReading
        .findMany({ select: { id: true } })
        .then((x) => x.map((x) => x.id));
      for (const readingId of allReadings) {
        if (dbInput[readingId]) {
          if (dbInput[readingId].fields.kRSUnicode.includes(" "))
            console.log(
              `Found more than one radical for ${readingId}: ${dbInput[readingId].fields.kRSUnicode}`,
            );
          await prisma.kanjisenseFigureReading.update({
            where: {
              id: readingId,
            },
            data: {
              unihan15Id: readingId,
            },
          });
        }
      }
    });
    await registerSeeded(prisma, "Unihan15");
    console.log(`unihan15 seeded. 🌱`);
  }
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
