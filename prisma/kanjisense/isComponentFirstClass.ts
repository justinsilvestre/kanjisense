export function isComponentFirstClass(
  priorityFiguresIds: Set<string>,
  parent: string,
  component: string,
  componentsToDirectUsesPrimaryVariants: Map<string, Set<string>>,
  figuresToVariantGroupIds: Map<string, string>,
) {
  const componentIsPriorityFigure = priorityFiguresIds.has(component);
  if (componentIsPriorityFigure) {
    return true;
  } else {
    if (priorityFiguresIds.has(parent)) return false;

    const componentIsPriorityFigureVariant = priorityFiguresIds.has(
      figuresToVariantGroupIds.get(component) || component,
    );
    if (componentIsPriorityFigureVariant) return true;

    const componentIsUsedInMultipleFiguresOfAnyPriority =
      (componentsToDirectUsesPrimaryVariants.get(component)?.size ?? 0) > 1;
    return componentIsUsedInMultipleFiguresOfAnyPriority;
  }
}
