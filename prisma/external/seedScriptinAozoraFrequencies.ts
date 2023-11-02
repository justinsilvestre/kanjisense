import { Prisma, PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

export async function seedScriptinAozoraFrequencies(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.readyTables.findUnique({
    where: { id: "ScriptinAozoraFrequency" },
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
    if (
      !(await prisma.readyTables.findUnique({
        where: { id: "ScriptinAozoraFrequency" },
      }))
    )
      await prisma.readyTables.create({
        data: { id: "ScriptinAozoraFrequency" },
      });

    console.log(`scriptinAozoraFrequency seeded. 🌱`);
  }
}
