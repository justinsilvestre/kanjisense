import { PrismaClient } from "@prisma/client";

import { soundMarksToSimplifications } from "~/lib/dic/simplifiedSoundMarks";
import { FigureKey, getFigureId } from "~/models/figure";

import { ComponentUse } from "../../app/features/dictionary/ComponentUse";
import { runSetupStep } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

const SUPPRESSED_SOUND_MARKS = new Set(["丿", "丶"]);

export async function seedKanjisenseActiveSoundMarks(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    version,
    force,
    prisma,
    step: "KanjisenseActiveSoundMark",
    async setup() {
      console.log(`seeding KanjisenseActiveSoundMark...`);

      const componentsTrees = new Map(
        (
          await prisma.kanjisenseFigure.findMany({
            where: { version },
            select: {
              key: true,
              componentsTree: true,
            },
          })
        ).map(({ key, componentsTree }) => [
          key,
          (componentsTree as ReturnType<ComponentUse["toJSON"]>[]).map(
            ([p, c]) => new ComponentUse(p, c),
          ),
        ]),
      );

      await executeAndLogTime("registering active sound marks", () =>
        registerActiveSoundMarks(prisma, version, componentsTrees),
      );
    },
  });
}

export async function registerActiveSoundMarks(
  prisma: PrismaClient,
  version: number,
  componentsTrees: Map<FigureKey, ComponentUse[]>,
) {
  const allVariantsToVariantGroupHead = Object.fromEntries(
    (
      await prisma.kanjisenseVariantGroup.findMany({
        where: { version },
      })
    ).flatMap((g) => g.variants.map((v) => [v, g.key])),
  );
  // eslint-disable-next-line no-inner-declarations
  function getPrimaryVariantKey(key: string) {
    return allVariantsToVariantGroupHead[key] || key;
  }
  let visitedCount = 0;
  for (const [key, tree] of componentsTrees) {
    visitedCount++;
    if (visitedCount % 500 === 0 || visitedCount === componentsTrees.size) {
      console.log(`|| processed ${visitedCount} / ${componentsTrees.size}`);
    }
    const derivation =
      (await prisma.kanjiDbCharacterDerivation.findUnique({
        where: {
          character: key,
        },
      })) ||
      (await prisma.kanjiDbCharacterDerivation.findUnique({
        where: {
          character: key.normalize(),
        },
      }));
    const soundMarkCandidates = derivation
      ? tree.filter(({ component }) => {
          const componentPrimaryVariant = getPrimaryVariantKey(component);

          const phoneticMatchInDerivationChain =
            derivation.phoneticOrigins.find((originCharacter) => {
              const exactMatch =
                getPrimaryVariantKey(originCharacter) ===
                componentPrimaryVariant;
              if (exactMatch) return true;

              const simplifiedOriginCharacterVariants =
                soundMarksToSimplifications[
                  originCharacter as keyof typeof soundMarksToSimplifications
                ];

              return (
                simplifiedOriginCharacterVariants?.some(
                  (simplifiedSoundMark) =>
                    getPrimaryVariantKey(simplifiedSoundMark) ===
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
        where: { id: getFigureId(version, key) },
        data: {
          activeSoundMark: {
            connect: {
              id: getFigureId(version, activeSoundMark.component),
            },
          },
        },
      });
    }
  }
}
