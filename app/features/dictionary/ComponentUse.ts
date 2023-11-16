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
