import { PrismaClient } from "@prisma/client";

import { simplifiedSoundMarks } from "~/lib/dic/simplifiedSoundMarks";

import { registerSeeded } from "../seedUtils";

import { ComponentUse } from "./ComponentUse";

export async function seedKanjisenseActiveSoundMarks(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseActiveSoundMark" },
  });
  if (seeded && !force)
    console.log(`KanjisenseActiveSoundMark already seeded. 🌱`);
  else {
    console.log(`seeding KanjisenseActiveSoundMark...`);

    const componentsTreesOfFiguresWithActiveSoundMarks = new Map(
      (
        await prisma.kanjisenseFigure.findMany({
          where: {
            activeSoundMark: {
              isNot: null,
            },
          },
          select: {
            id: true,
            componentsTree: true,
          },
        })
      ).map(({ id, componentsTree }) => [
        id,
        (componentsTree as ReturnType<ComponentUse["toJSON"]>[]).map(
          ([p, c]) => new ComponentUse(p, c),
        ),
      ]),
    );

    await registerActiveSoundMarks(
      prisma,
      componentsTreesOfFiguresWithActiveSoundMarks,
    );

    await registerSeeded(prisma, "KanjisenseActiveSoundMark");
  }

  console.log(`KanjisenseActiveSoundMark seeded. 🌱`);
}

async function registerActiveSoundMarks(
  prisma: PrismaClient,
  componentsTreesInput: Map<string, ComponentUse[]>,
) {
  const allVariantsToVariantGroupHead = Object.fromEntries(
    (await prisma.kanjisenseVariantGroup.findMany()).map((g) =>
      g.variants.flatMap((v) => [v, g.id]),
    ),
  );
  // eslint-disable-next-line no-inner-declarations
  function getPrimaryVariantId(id: string) {
    return allVariantsToVariantGroupHead[id] || id;
  }
  for (const [id, tree] of componentsTreesInput.entries()) {
    const soundMarkChain =
      (await prisma.kanjisenseSoundMarkChain.findUnique({
        where: {
          character: id,
        },
      })) ||
      (await prisma.kanjisenseSoundMarkChain.findUnique({
        where: {
          character: id.normalize(),
        },
      }));
    const originsChain = (soundMarkChain?.chain || []) as [
      characterOrComponent: string,
      originCharacter: string,
      tag: "p" | "s",
    ];
    const soundMarkCandidates = tree.filter(({ component }) => {
      const componentPrimaryVariant = getPrimaryVariantId(component);
      const originCharacterMatchingComponent = originsChain.find(
        ([, originCharacter]) => {
          const exactMatch =
            getPrimaryVariantId(originCharacter) === componentPrimaryVariant;
          if (exactMatch) return true;
          const simplifiedOriginCharacterVariants =
            simplifiedSoundMarks[
              originCharacter as keyof typeof simplifiedSoundMarks
            ];
          return (
            simplifiedOriginCharacterVariants?.some(
              (variant) =>
                getPrimaryVariantId(variant) === componentPrimaryVariant,
            ) ?? false
          );
        },
      );
      return originCharacterMatchingComponent;
    });
    const activeSoundMark = soundMarkCandidates[0];
    if (activeSoundMark) {
      await prisma.kanjisenseFigure.update({
        where: { id },
        data: {
          activeSoundMark: {
            connect: {
              id: activeSoundMark.component,
            },
          },
        },
      });
    }
  }
}
