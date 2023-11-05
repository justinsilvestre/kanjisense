import { Prisma, PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

import { registerSeeded } from "../seedUtils";

export async function seedScriptinAozoraFrequencies(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "ScriptinAozoraFrequency" },
  });
  if (seeded && !force)
    console.log(`scriptinAozoraFrequency already seeded. 🌱`);
  else {
    console.log(`seeding scriptinAozoraFrequency...`);

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

    await registerSeeded(prisma, "ScriptinAozoraFrequency");
    console.log(`scriptinAozoraFrequency seeded. 🌱`);
  }
}
