import { KanjiDbVariantType, PrismaClient } from "@prisma/client";

import { runSetupStep } from "prisma/seedUtils";
import { baseKanji, lists } from "~/lib/baseKanji";
import { kanjijumpSpecificVariants } from "~/lib/dic/kanjijumpSpecificVariants";
import { getFigureId } from "~/models/figure";

const oldFormAsStandard = [
  // joyo 2010 additions
  ["𠮟", "叱"],
  ["塡", "填"],
  ["剝", "剥"],
  ["頰", "頬"],
  // others
  ["俱", "倶"],
  ["吞", "呑"],
  ["噓", "嘘"],
  ["姸", "妍"],
  ["繫", "繋"],
];

export async function seedKanjisenseVariantGroups(
  prisma: PrismaClient,
  version: number,
  force = false,
) {
  await runSetupStep({
    version,
    force,
    prisma,
    step: "KanjisenseVariantGroup",
    async setup() {
      console.log(`seeding KanjisenseVariantGroup...`);

      const appearances = Object.fromEntries(
        (await prisma.scriptinAozoraFrequency.findMany()).map(
          ({ character, appearances }) => [character, appearances],
        ),
      );

      const baseKanjiAndVariants = new Set<string>();

      // build "base variant groups" by aggregating kdb-OLD-variants of base kanji
      let baseVariantGroups: string[][] = [];
      const oldVariants = (
        await prisma.kanjiDbVariant.findMany({
          where: {
            base: { in: [...baseKanji] },
            variantType: KanjiDbVariantType.OldStyle,
          },
        })
      ).reduce((baseToVariants, { base, variant }) => {
        const variants = baseToVariants.get(base) || [];
        variants.push(variant);
        baseToVariants.set(base, variants);
        return baseToVariants;
      }, new Map<string, string[]>());

      for (const [baseChar, variants] of oldVariants) {
        if (variants) {
          const variantGroup = [
            baseChar,
            ...variants
              .filter((variant) => variant !== baseChar)
              .map((variant) => variant),
          ];
          baseVariantGroups = mergeVariants(baseVariantGroups, [variantGroup]);
        }
      }
      for (const variantGroup of baseVariantGroups) {
        for (const variant of variantGroup) {
          baseKanjiAndVariants.add(variant);
        }
      }

      // incorporate variants with old form as standard, preserving the old form in "primary" position
      baseVariantGroups = mergeVariants(
        baseVariantGroups,
        oldFormAsStandard,
      ).map((g) => g.sort(byPriorityDescending));
      // incorporate kanjijump-specific variants
      baseVariantGroups = mergeVariants(
        baseVariantGroups,
        kanjijumpSpecificVariants,
      );

      const kanjidicKanji = (
        await prisma.kanjidicEntry.findMany({
          select: { id: true },
        })
      ).map(({ id }) => id);

      const kanjidicNewVariants = (
        await prisma.kanjiDbVariant.findMany({
          where: { variantType: KanjiDbVariantType.NewStyle },
        })
      ).reduce(
        (acc, { base, variant }) => {
          acc[base] ||= [];
          acc[base].push(variant);
          return acc;
        },
        {} as Record<string, string[]>,
      );
      const variantsOutsideKanjijump = kanjidicKanji.reduce(
        (allVariants, kanjidicChar) => {
          if (baseKanjiAndVariants.has(kanjidicChar)) return allVariants;

          const newVariants = kanjidicNewVariants[kanjidicChar]?.filter((v) =>
            kanjidicKanji.includes(v),
          );
          if (newVariants?.length) {
            return mergeVariants(allVariants, [[kanjidicChar, ...newVariants]]);
          }

          return allVariants;
        },
        [] as string[][],
      );
      const variants = mergeVariants(
        baseVariantGroups,
        variantsOutsideKanjijump,
      );

      await prisma.kanjisenseVariantGroup.deleteMany({
        where: { version },
      });

      const repeatedIds = new Map<string, string[]>();
      for (const group of variants) {
        const [char] = group;
        if (repeatedIds.has(char)) {
          console.log(repeatedIds.get(char), group);
        }
        repeatedIds.set(char, group);
      }

      await prisma.kanjisenseVariantGroup.createMany({
        data: variants.map((group) => ({
          id: getFigureId(version, group[0]),
          version,
          key: group[0],
          variants: group,
        })),
      });

      // eslint-disable-next-line no-inner-declarations
      function byPriorityDescending(a: string, b: string) {
        const priorityDifference = getPriority(b) - getPriority(a);
        if (priorityDifference) return priorityDifference;

        return (appearances[a] ?? 0) - (appearances[b] ?? 0);
      }
    },
  });
}

function getPriority(char: string) {
  if (lists.joyo.has(char)) return 4;
  if (lists.jinmeiyo.has(char) && lists.hyogai.has(char)) return 3;
  if (lists.jinmeiyo.has(char)) return 2;
  if (lists.hyogai.has(char)) return 1;
  return 0;
}

function mergeVariants(base: string[][], additions: string[][]): string[][] {
  const merged = base.map((g) => [...g]);
  for (const additionGroup of additions) {
    const overlappingGroup = merged.find((baseGroup) =>
      additionGroup.some((additionGroupMember) =>
        baseGroup.includes(additionGroupMember),
      ),
    );
    if (overlappingGroup) {
      for (const member of additionGroup) {
        if (!overlappingGroup.includes(member)) {
          overlappingGroup.push(member);
        }
      }
    } else {
      merged.push(additionGroup);
    }
  }
  for (const group of merged) {
    const set = new Set(group);
    if (set.size !== group.length) {
      console.warn("duplicates in variant group detected:", group);
    }
  }
  const allChars = new Map<string, string[][]>();
  for (const group of merged) {
    for (const char of group) {
      allChars.set(char, allChars.get(char)?.concat(group) ?? [group]);
    }
  }
  let error = false;
  for (const [char, groups] of allChars) {
    if (groups.length > 1) {
      error = true;
      console.warn("overlapping variant groups detected:", char, groups);
    }
  }
  if (error) throw new Error("overlapping variant groups detected");
  return merged;
}
