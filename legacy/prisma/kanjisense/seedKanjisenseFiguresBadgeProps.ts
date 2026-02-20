import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";

import { runSetupStep } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

export async function seedKanjisenseFigureBadgeProps({
  prisma,
  version,
  force = false,
  shouldUpdateSoundMarkField = false,
}: {
  prisma: PrismaClient;
  version: number;
  force?: boolean;
  shouldUpdateSoundMarkField?: boolean;
}) {
  await runSetupStep({
    version,
    force,
    seedInterface: getSeedInterface(prisma),
    step: "KanjisenseFigureBadgeProps",
    async setup() {
      console.log("Seeding figures badge props...");

      await executeAndLogTime(
        "updating isStandaloneCharacter and variant group hasStandaloneCharacter field",
        async () => {
          const variantGroups = await prisma.kanjisenseVariantGroup.findMany({
            where: { version },
          });
          const variantGroupHeadsIds = new Set(variantGroups.map((g) => g.id));
          const standaloneCharacters = await prisma.kanjisenseFigure.findMany({
            select: { id: true },
            where: {
              version,
              OR: [
                { listsAsCharacter: { isEmpty: false } },
                {
                  firstClassUses: {
                    none: {
                      parent: {
                        isPriority: true,
                      },
                    },
                  },
                },
                {
                  shinjitaiInBaseKanji: { not: null },
                },
              ],
            },
          });

          await prisma.kanjisenseFigure.updateMany({
            where: {
              id: { in: standaloneCharacters.map((c) => c.id) },
            },
            data: {
              isStandaloneCharacter: true,
            },
          });

          for (const standaloneCharacter of standaloneCharacters) {
            if (variantGroupHeadsIds.has(standaloneCharacter.id))
              await prisma.kanjisenseVariantGroup.update({
                where: { id: standaloneCharacter.id },
                data: { hasStandaloneCharacter: true },
              });
          }
        },
      );

      await executeAndLogTime(
        "updating isPriorityComponent field",
        async () => {
          const figures = await prisma.kanjisenseFigure.findMany({
            where: {
              version,
              OR: [
                { listsAsComponent: { isEmpty: false } },
                {
                  firstClassUses: {
                    some: {
                      parent: {
                        isPriority: true,
                      },
                    },
                  },
                },
              ],
            },
          });

          await prisma.kanjisenseFigure.updateMany({
            where: {
              version,
              id: { in: figures.map((c) => c.id) },
            },
            data: {
              isPriorityComponent: true,
            },
          });
        },
      );

      if (shouldUpdateSoundMarkField)
        await updateIsPrioritySoundMarkField(prisma, version);

      console.log(`figures seeded. 🌱`);
    },
  });
}

export async function updateIsPrioritySoundMarkField(
  prisma: PrismaClient,
  version: number,
) {
  await executeAndLogTime("updating isPrioritySoundMark field", async () => {
    const figures = await prisma.kanjisenseFigure
      .findMany({
        select: { id: true },
        where: {
          version,
          asComponent: {
            soundMarkUses: {
              some: {
                isPriority: true,
              },
            },
          },
          OR: [
            { listsAsComponent: { isEmpty: false } },
            {
              firstClassUses: {
                some: {
                  parent: {
                    isPriority: true,
                  },
                },
              },
            },
          ],
        },
      })
      .then((fs) => fs.map((f) => f.id));
    console.log(`updating ${figures.length} figures...`, figures.join(""));
    await prisma.kanjisenseFigure.updateMany({
      where: {
        id: { in: figures },
      },
      data: {
        isPrioritySoundMark: true,
      },
    });
  });
}
