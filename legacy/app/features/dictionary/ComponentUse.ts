export class ComponentUse {
  constructor(
    /** figure key */
    public parent: string,
    /** figure key */
    public component: string,
  ) {}

  toJSON() {
    return [this.parent, this.component];
  }
}

export type ComponentUseJson = [parent: string, component: string];
