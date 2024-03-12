import { Prisma, PrismaClient } from "@prisma/client";

import { runSetupStep } from "prisma/seedUtils";
import { files, readJsonSync } from "~/lib/files.server";

export async function seedScriptinAozoraFrequencies(
  prisma: PrismaClient,
  force = false,
) {
  await runSetupStep({
    prisma,
    step: "ScriptinAozoraFrequency",
    force,
    version: "KEYLESS STEP",
    async setup() {
      await prisma.scriptinAozoraFrequency.deleteMany({});

      const [, ...json] = readJsonSync<
        [id: string, appearances: number, fraction: number][]
      >(files.scriptinAozoraFrequenciesJson);

      const dbInput: Record<string, Prisma.ScriptinAozoraFrequencyCreateInput> =
        {};
      let rank = 0;
      for (const [character, appearances, fraction] of json) {
        rank += 1;
        dbInput[character] = {
          character,
          appearances,
          fraction,
          rank,
        };
      }

      await prisma.scriptinAozoraFrequency.createMany({
        data: Object.values(dbInput),
      });
    },
  });
}
