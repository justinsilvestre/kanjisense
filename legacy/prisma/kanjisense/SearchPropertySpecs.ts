import type { FigureSearchPropertyType } from "@prisma/client";

export class SearchPropertySpecs {
  constructor(
    public type: FigureSearchPropertyType,
    public text: string,
    public index: number,
    public display = "",
  ) {}

  private _key?: string;

  get key() {
    return (this._key =
      this._key ?? getKey(this.type, this.text, this.display));
  }

  toString() {
    return `${this.type}: ${this.text}`;
  }

  static create(
    type: FigureSearchPropertyType,
    text: string,
    index: number,
    display = "",
  ): SearchPropertySpecs {
    return new SearchPropertySpecs(type, text, index, display);
  }
}
function getKey(type: string, text: string, display: string) {
  return `${type}@${text}@${display}`;
}
