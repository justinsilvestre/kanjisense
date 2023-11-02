import { PrismaClient } from "@prisma/client";

import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

export async function seedUnihan15(prisma: PrismaClient, force = false) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "Unihan15" },
  });
  if (seeded && !force) console.log(`unihan15 already seeded. 🌱`);
  else {
    console.log(`seeding unihan15...`);

    await prisma.unihan15.deleteMany({});

    const dbInput: Record<
      string,
      { id: string; fields: Record<string, string[]> }
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
      dbInput[head].fields[fieldName] ||= [];
      dbInput[head].fields[fieldName].push(body);
    });

    const data = Object.values(dbInput).map(({ id, fields }) => ({
      id,
      kCantonese: fields.kCantonese || [],
      kDefinition: fields.kDefinition || [],
      kHangul: fields.kHangul || [],
      kHanyuPinlu: fields.kHanyuPinlu || [],
      kHanyuPinyin: fields.kHanyuPinyin || [],
      kJapaneseKun: fields.kJapaneseKun || [],
      kJapaneseOn: fields.kJapaneseOn || [],
      kKorean: fields.kKorean || [],
      kMandarin: fields.kMandarin || [],
      kTang: fields.kTang || [],
      kTGHZ2013: fields.kTGHZ2013 || [],
      kVietnamese: fields.kVietnamese || [],
      kXHC1983: fields.kXHC1983 || [],
    }));
    const x = await prisma.unihan15.createMany({
      data,
    });
    console.log(`${x.count} created.`);
    if (!(await prisma.readyTables.findUnique({ where: { id: "Unihan15" } })))
      await prisma.readyTables.create({ data: { id: "Unihan15" } });

    console.log(`unihan15 seeded. 🌱`);
  }
}
