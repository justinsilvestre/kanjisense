export class ComponentUse {
  constructor(
    public parent: string,
    public component: string,
  ) {}

  toJSON() {
    return [this.parent, this.component];
  }
}

export type ComponentUseJson = [parent: string, component: string];

export interface ComponentUseTreeNode {
  figure: string;
  children: ComponentUseTreeNode[];
}
export function unflattenComponentsTree(
  rootFigure: string,
  flatTree: ComponentUseJson[],
) {
  const root: ComponentUseTreeNode = { figure: rootFigure, children: [] };
  const nodes: ComponentUseTreeNode[] = [root];
  for (const [parent, component] of flatTree) {
    const parentNode = nodes.find((node) => node.figure === parent)!;
    const childNode = { figure: component, children: [] };
    parentNode.children.push(childNode);
    nodes.push(childNode);
  }
  return { root, nodes };
}
