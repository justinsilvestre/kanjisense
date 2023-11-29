import type { ComponentUse } from "~/features/dictionary/ComponentUse";

export function isComponentFirstClass(
  priorityFiguresIds: Set<string>,
  parent: string,
  component: string,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
  figuresToVariantGroups: Map<string, string[]>,
  figuresToComponentsTrees: Map<string, ComponentUse[]>,
) {
  const figureIsAtomic = figuresToComponentsTrees.get(component)!.length <= 1;
  if (figureIsAtomic) return true;

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
