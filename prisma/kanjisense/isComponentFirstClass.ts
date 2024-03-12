import type { ComponentUse } from "~/features/dictionary/ComponentUse";
import { FigureKey } from "~/models/figure";

import { forcedMeaninglessFiguresSet } from "./componentMeanings";

export function isComponentFirstClass(
  priorityFiguresKeys: Set<FigureKey>,
  parent: FigureKey,
  component: FigureKey,
  componentsToDirectUsesPrimaryVariants: Map<FigureKey, Set<FigureKey>>,
  figuresToVariantGroups: Map<FigureKey, FigureKey[]>,
  figuresToComponentsTrees: Map<FigureKey, ComponentUse[]>,
) {
  const componentsTree = figuresToComponentsTrees.get(component);
  if (!componentsTree) throw new Error(`No components tree for ${component}`);
  const figureIsAtomic = componentsTree.length <= 1;
  if (figureIsAtomic) return true;
  if (forcedMeaninglessFiguresSet.has(component)) return false;

  const componentIsPriorityFigure = priorityFiguresKeys.has(component);
  if (componentIsPriorityFigure) {
    return true;
  } else {
    if (priorityFiguresKeys.has(parent)) return false;

    const variants = figuresToVariantGroups.get(component);
    const componentIsPriorityFigureVariant = priorityFiguresKeys.has(
      variants?.[0] || component,
    );
    if (componentIsPriorityFigureVariant) return true;

    if (!variants) {
      const priorityDirectUses = [
        ...(componentsToDirectUsesPrimaryVariants.get(component) || []),
      ].filter((f) => priorityFiguresKeys.has(f));

      return priorityDirectUses.length > 1;
    }

    const allVariantsPriorityDirectUses = variants.flatMap(
      (v) => componentsToDirectUsesPrimaryVariants.get(v) || [],
    );
    return allVariantsPriorityDirectUses.length > 1;
  }
}
