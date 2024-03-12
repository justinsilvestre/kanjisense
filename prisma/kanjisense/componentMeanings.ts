import { baseKanjiSet } from "~/lib/baseKanji";
import { FigureKey } from "~/models/figure";

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
  figuresToVariantGroups: Map<FigureKey, FigureKey[]>,
  componentsToDirectUsesPrimaryVariants: Map<FigureKey, Set<FigureKey>>,
  priorityCandidatesKeys: Set<FigureKey>,
  componentKey: string,
) {
  if (forcedMeaninglessFiguresSet.has(componentKey))
    return {
      result: false,
      reason: "forced",
    };

  const componentVariants = figuresToVariantGroups.get(componentKey);
  const variantGroupKey = componentVariants?.[0] ?? null;
  const primaryVariantIsInBaseKanji = baseKanjiSet.has(
    variantGroupKey ?? componentKey,
  );
  if (primaryVariantIsInBaseKanji)
    return {
      result: true,
      reason: "base kanji or variant thereof",
    };

  const figureIsPriorityCandidateOrVariantThereof = (key: string) => {
    if (priorityCandidatesKeys.has(key)) return true;
    const variantGroup = figuresToVariantGroups.get(key);
    if (!variantGroup) return false;
    return variantGroup.some((v) => priorityCandidatesKeys.has(v));
  };

  const usesInPriorityCandidatesAndTheirVariants = new Set<string>();
  if (!componentVariants) {
    const directUsesPrimaryVariants =
      componentsToDirectUsesPrimaryVariants.get(componentKey);
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
