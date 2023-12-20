import { PrismaClient } from "@prisma/client";

import { soundMarksToSimplifications } from "~/lib/dic/simplifiedSoundMarks";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

const SUPPRESSED_SOUND_MARKS = new Set(["丿", "丶"]);

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

    await executeAndLogTime("registering active sound marks", () =>
      registerActiveSoundMarks(prisma, componentsTrees),
    );

    await registerSeeded(prisma, "KanjisenseActiveSoundMark");
  }

  console.log(`KanjisenseActiveSoundMark seeded. 🌱`);
}

export async function registerActiveSoundMarks(
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
    const soundMarkCandidates = derivation
      ? tree.filter(({ component }) => {
          const componentPrimaryVariant = getPrimaryVariantId(component);

          const phoneticMatchInDerivationChain =
            derivation.phoneticOrigins.find((originCharacter) => {
              const exactMatch =
                getPrimaryVariantId(originCharacter) ===
                componentPrimaryVariant;
              if (exactMatch) return true;

              const simplifiedOriginCharacterVariants =
                soundMarksToSimplifications[
                  originCharacter as keyof typeof soundMarksToSimplifications
                ];

              return (
                simplifiedOriginCharacterVariants?.some(
                  (simplifiedSoundMark) =>
                    getPrimaryVariantId(simplifiedSoundMark) ===
                    componentPrimaryVariant,
                ) ?? false
              );
            });
          return phoneticMatchInDerivationChain;
        })
      : [];
    const activeSoundMark = soundMarkCandidates[0];
    if (
      activeSoundMark &&
      !SUPPRESSED_SOUND_MARKS.has(activeSoundMark.component)
    ) {
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
