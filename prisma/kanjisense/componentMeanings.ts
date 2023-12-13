import { baseKanjiSet } from "~/lib/baseKanji";

export const forcedMeaninglessFiguresSet = new Set<string>([
  "亏",
  "吅",
  "帀",
  "𠓜",
  "厸",
  "𠔼",
  "CDP-8D52",
  "CDP-8CE6",
  "CDP-89A6",
  "𠫔",
  "CDP-8CED", // properly should have detected only appears in 1 variant group
]);

const MINIMUM_USES_IN_PRIORITY_CANDIDATES = 2;

/**
 * checks relations to see if the given component figure
 * should be assigned a name in kanjisense
 */
export async function shouldComponentBeAssignedMeaning(
  figuresToVariantGroups: Map<string, string[]>,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
  priorityCandidatesIds: Set<string>,
  componentId: string,
) {
  if (forcedMeaninglessFiguresSet.has(componentId))
    return {
      result: false,
      reason: "forced",
    };

  const componentVariants = figuresToVariantGroups.get(componentId);
  const variantGroupId = componentVariants?.[0] ?? null;
  const primaryVariantIsInBaseKanji = baseKanjiSet.has(
    variantGroupId ?? componentId,
  );
  if (primaryVariantIsInBaseKanji)
    return {
      result: true,
      reason: "base kanji or variant thereof",
    };

  const figureIsPriorityCandidateOrVariantThereof = (id: string) => {
    if (priorityCandidatesIds.has(id)) return true;
    const variantGroup = figuresToVariantGroups.get(id);
    if (!variantGroup) return false;
    return variantGroup.some((v) => priorityCandidatesIds.has(v));
  };

  const usesInPriorityCandidatesAndTheirVariants = new Set<string>();
  if (!componentVariants) {
    const directUsesPrimaryVariants =
      componentsToDirectUsesPrimaryVariants.get(componentId);
    for (const v of directUsesPrimaryVariants || []) {
      if (figureIsPriorityCandidateOrVariantThereof(v))
        usesInPriorityCandidatesAndTheirVariants.add(v);
    }
  } else {
    const variantsDirectUsesPrimaryVariants = componentVariants.flatMap((v) => [
      ...(componentsToDirectUsesPrimaryVariants.get(v) || []),
    ]);
    for (const v of variantsDirectUsesPrimaryVariants) {
      if (figureIsPriorityCandidateOrVariantThereof(v))
        usesInPriorityCandidatesAndTheirVariants.add(v);
    }
  }

  if (!usesInPriorityCandidatesAndTheirVariants.size)
    return {
      result: false,
      reason: "no direct uses in composition data",
    };

  if (usesInPriorityCandidatesAndTheirVariants.size === 1)
    return {
      result: false,
      reason: `only used in ${
        [...usesInPriorityCandidatesAndTheirVariants][0]
      }`,
    };

  const enoughUses = Boolean(
    usesInPriorityCandidatesAndTheirVariants.size >=
      MINIMUM_USES_IN_PRIORITY_CANDIDATES,
  );
  return {
    result: enoughUses,
    reason: enoughUses
      ? `used in ${[...usesInPriorityCandidatesAndTheirVariants].join(" ")}`
      : usesInPriorityCandidatesAndTheirVariants.size
      ? `only used in ${[...usesInPriorityCandidatesAndTheirVariants].join(
          " ",
        )}`
      : "not used in priority candidates",
  };
}
