import { PrismaClient } from "@prisma/client";

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
    }));
    const x = await prisma.unihan15.createMany({
      data,
    });
    console.log(`${x.count} created.`);

    await registerSeeded(prisma, "Unihan15");
    console.log(`unihan15 seeded. 🌱`);
  }
}
