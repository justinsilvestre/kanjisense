import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { runSetupStep } from "../seedUtils";

export async function seedUnihan12(prisma: PrismaClient, force = false) {
  const unihan14Seeded = await prisma.setup.findFirst({
    where: { step: "Unihan14" },
  });
  if (!unihan14Seeded)
    throw new Error("Unihan14 must be seeded before Unihan12.");
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    step: "Unihan12",
    force,
    version: "KEYLESS STEP",
    async setup() {
      const unihan14ZVariants = await prisma.unihan14.findMany({
        where: { kZVariant: { isEmpty: false } },
      });

      const dbInput = new Map<string, Record<string, string[]>>();
      await forEachLine(files.unihanVariants12, async (line) => {
        if (!line || line.startsWith("#")) return;

        const { uCode, fieldName, body } =
          /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(
            line,
          )!.groups!;
        const head = String.fromCodePoint(parseInt(uCode, 16));

        if (
          fieldName == "kZVariant" &&
          !unihan14ZVariants.some(
            ({ id, kZVariant }) => id === head && kZVariant.includes(body),
          )
        ) {
          const entry = dbInput.get(head) || {};
          dbInput.set(head, entry);

          const variants = body.split(" ").flatMap((entry) => {
            const match = entry.match(/U\+([A-Z0-9]{4,9})<?/u)!;
            if (!match) throw new Error(line + "\n" + entry);
            const code = match[1];
            return charFromUCode(code);
          });
          for (const variant of variants) {
            entry[fieldName] ||= [];
            entry[fieldName].push(variant);
          }
        }
      });

      await prisma.unihan12.createMany({
        data: Array.from(dbInput, ([id, fields]) => ({
          id,
          kZVariant: fields.kZVariant || [],
        })),
      });
    },
  });
}

function charFromUCode(uCode: string) {
  return String.fromCodePoint(parseInt(uCode, 16));
}
