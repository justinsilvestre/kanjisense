import type { ComponentUse } from "~/features/dictionary/ComponentUse";

import { forcedMeaninglessFiguresSet } from "./componentMeanings";

export function isComponentFirstClass(
  priorityFiguresIds: Set<string>,
  parent: string,
  component: string,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
  figuresToVariantGroups: Map<string, string[]>,
  figuresToComponentsTrees: Map<string, ComponentUse[]>,
) {
  const componentsTree = figuresToComponentsTrees.get(component);
  if (!componentsTree) throw new Error(`No components tree for ${component}`);
  const figureIsAtomic = componentsTree.length <= 1;
  if (figureIsAtomic) return true;
  if (forcedMeaninglessFiguresSet.has(component)) return false;

  const componentIsPriorityFigure = priorityFiguresIds.has(component);
  if (componentIsPriorityFigure) {
    return true;
  } else {
    if (priorityFiguresIds.has(parent)) return false;

    const variants = figuresToVariantGroups.get(component);
    const componentIsPriorityFigureVariant = priorityFiguresIds.has(
      variants?.[0] || component,
    );
    if (componentIsPriorityFigureVariant) return true;

    if (!variants) {
      const priorityDirectUses = [
        ...(componentsToDirectUsesPrimaryVariants.get(component) || []),
      ].filter((f) => priorityFiguresIds.has(f));

      return priorityDirectUses.length > 1;
    }

    const allVariantsPriorityDirectUses = variants.flatMap(
      (v) => componentsToDirectUsesPrimaryVariants.get(v) || [],
    );
    return allVariantsPriorityDirectUses.length > 1;
  }
}
