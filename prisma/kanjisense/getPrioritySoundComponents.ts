import { PrismaClient } from "@prisma/client";

import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";
import { FIGURES_VERSION } from "~/models/figure";

export type PrioritySoundComponents = ReturnType<
  Awaited<typeof getPrioritySoundComponents>
>;

export async function getPrioritySoundComponents(prisma: PrismaClient) {
  const soundComponentKeys = await prisma.kanjisenseFigure.findMany({
    where: {
      version: FIGURES_VERSION,
      isPriority: true,
      listsAsComponent: { isEmpty: false },
      asComponent: {
        soundMarkUses: {
          some: {
            isPriority: true,
          },
        },
      },
    },
    select: {
      key: true,
    },
  });
  const nonStandaloneSoundComponents = await prisma.kanjisenseFigure.findMany({
    where: {
      version: FIGURES_VERSION,
      key: {
        in: soundComponentKeys.map((f) => f.key),
      },
      isStandaloneCharacter: false,
    },
  });

  const images = await prisma.kanjisenseFigureImage
    .findMany({
      where: {
        version: FIGURES_VERSION,
        key: {
          in: nonStandaloneSoundComponents.map((f) => f.key),
        },
      },
    })
    .then((imagesArray) => {
      return imagesArray.reduce(
        (acc, image) => {
          acc[image.key] = image;
          return acc;
        },
        {} as Record<string, (typeof imagesArray)[number]>,
      );
    });

  const figures = await prisma.kanjisenseFigure.findMany({
    select: {
      ...badgeFigureSelect,
      image: false,

      asComponent: {
        ...badgeFigureSelect.asComponent,
        where: {
          soundMarkUses: {
            some: {
              isPriority: true,
            },
          },
        },
        select: {
          ...badgeFigureSelect.asComponent.select,
          soundMarkUses: {
            orderBy: {
              aozoraAppearances: "desc",
            },
            where: {
              isPriority: true,
            },
            select: {
              id: true,
              activeSoundMarkValue: true,
            },
          },
        },
      },
      reading: {
        select: {
          selectedOnReadings: true,
          sbgyXiaoyuns: {
            select: { sbgyXiaoyun: true },
          },
          kanjidicEntry: {
            select: {
              onReadings: true,
            },
          },
        },
      },
    },
    orderBy: {
      aozoraAppearances: "desc",
    },
    where: {
      key: {
        in: soundComponentKeys.map((f) => f.key),
      },
    },
  });

  return { figures, images };
}
