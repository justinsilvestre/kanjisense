import { PrismaClient } from "@prisma/client";

import { simplifiedSoundMarks } from "~/lib/dic/simplifiedSoundMarks";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

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

    const componentsTrees = new Map(
      (
        await prisma.kanjisenseFigure.findMany({
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
    console.log("registering active sound marks...");
    await executeAndLogTime("registering active sound marks", () =>
      registerActiveSoundMarks(prisma, componentsTrees),
    );

    await registerSeeded(prisma, "KanjisenseActiveSoundMark");
  }

  console.log(`KanjisenseActiveSoundMark seeded. 🌱`);
}

async function registerActiveSoundMarks(
  prisma: PrismaClient,
  componentsTrees: Map<string, ComponentUse[]>,
) {
  const allVariantsToVariantGroupHead = Object.fromEntries(
    (await prisma.kanjisenseVariantGroup.findMany()).flatMap((g) =>
      g.variants.map((v) => [v, g.id]),
    ),
  );
  // eslint-disable-next-line no-inner-declarations
  function getPrimaryVariantId(id: string) {
    return allVariantsToVariantGroupHead[id] || id;
  }
  for (const [id, tree] of componentsTrees.entries()) {
    const derivation =
      (await prisma.kanjiDbCharacterDerivation.findUnique({
        where: {
          character: id,
        },
      })) ||
      (await prisma.kanjiDbCharacterDerivation.findUnique({
        where: {
          character: id.normalize(),
        },
      }));
    const soundMarkCandidates = tree.filter(({ component }) => {
      const componentPrimaryVariant = getPrimaryVariantId(component);

      const phoneticMatchInDerivationChain = derivation?.phoneticOrigins.find(
        (originCharacter) => {
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
      return phoneticMatchInDerivationChain;
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
