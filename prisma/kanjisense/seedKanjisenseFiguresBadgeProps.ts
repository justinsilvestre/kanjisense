import { PrismaClient } from "@prisma/client";

import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

export async function seedKanjisenseFigureBadgeProps(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigureBadgeProps" },
  });
  if (seeded && !force) console.log(`figures badge props already seeded. 🌱`);
  else {
    console.log("Seeding figures badge props...");

    await executeAndLogTime(
      "updating isStandaloneCharacter and variant group hasStandaloneCharacter field",
      async () => {
        const variantGroups = await prisma.kanjisenseVariantGroup.findMany();
        const variantGroupHeadsIds = new Set(variantGroups.map((g) => g.id));
        const standaloneCharacters = await prisma.kanjisenseFigure.findMany({
          select: { id: true },
          where: {
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

    await executeAndLogTime("updating isPriorityComponent field", async () => {
      const figures = await prisma.kanjisenseFigure.findMany({
        where: {
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
          id: { in: figures.map((c) => c.id) },
        },
        data: {
          isPriorityComponent: true,
        },
      });
    });

    await executeAndLogTime("updating isPrioritySoundMark field", async () => {
      const figures = await prisma.kanjisenseFigure.findMany({
        where: {
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
      });

      await prisma.kanjisenseFigure.updateMany({
        where: {
          id: { in: figures.map((c) => c.id) },
        },
        data: {
          isPrioritySoundMark: true,
        },
      });
    });

    await registerSeeded(prisma, "KanjisenseFigureBadgeProps");
    console.log(`figures seeded. 🌱`);
  }
}
