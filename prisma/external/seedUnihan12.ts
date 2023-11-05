import { PrismaClient } from "@prisma/client";

import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { registerSeeded } from "../seedUtils";

export async function seedUnihan12(prisma: PrismaClient, force = false) {
  const unihan14Seeded = await prisma.setup.findUnique({
    where: { step: "Unihan14" },
  });
  if (!unihan14Seeded)
    throw new Error("Unihan14 must be seeded before Unihan12.");
  const seeded = await prisma.setup.findUnique({
    where: { step: "Unihan12" },
  });
  if (seeded && !force) console.log(`Unihan12 already seeded. 🌱`);
  else {
    const unihan14ZVariants = await prisma.unihan14.findMany({
      where: { kZVariant: { isEmpty: false } },
    });

    console.log(`seeding Unihan12...`);
    await prisma.unihan12.deleteMany({});

    const dbInput: Record<
      string,
      { id: string; fields: Record<string, string[]> }
    > = {};
    await forEachLine(files.unihanVariants12, async (line) => {
      if (!line || line.startsWith("#")) return;

      const { uCode, fieldName, body } =
        /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(line)!
          .groups!;
      const head = String.fromCodePoint(parseInt(uCode, 16));

      if (
        fieldName == "kZVariant" &&
        !unihan14ZVariants.some(
          ({ id, kZVariant }) => id === head && kZVariant.includes(body),
        )
      ) {
        dbInput[head] ||= {
          id: head,
          fields: {},
        };

        const variants = body.split(" ").flatMap((entry) => {
          const match = entry.match(/U\+([A-Z0-9]{4,9})<?/u)!;
          if (!match) throw new Error(line + "\n" + entry);
          const code = match[1];
          return charFromUCode(code);
        });
        for (const variant of variants) {
          dbInput[head].fields[fieldName] ||= [];
          dbInput[head].fields[fieldName].push(variant);
        }
      }
    });

    await prisma.unihan12.createMany({
      data: Object.values(dbInput).map(({ id, fields }) => ({
        id,
        kZVariant: fields.kZVariant || [],
      })),
    });

    await registerSeeded(prisma, "Unihan12");
    console.log(`Unihan12 seeded. 🌱`);
  }
}

function charFromUCode(uCode: string) {
  return String.fromCodePoint(parseInt(uCode, 16));
}
