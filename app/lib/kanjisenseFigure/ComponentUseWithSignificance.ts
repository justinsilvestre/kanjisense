/** no tag means direct meaningful */

type FigureId = string;

export enum ComponentUseTag {
  /** used within this parent character, but not common enough to have a meaning in Kanjijump */
  directMeaningless = "d",

  /** should not happen */
  directMeaninglessSound = "e",

  /** used within a "directMeaningless" component of this parent character */
  meaningfulIndirect = "m",

  /** used within a "directMeaningless component" of this parent character, serving as sound mark */
  meaningfulIndirectSound = "n",

  /** used directly as a sound mark within this parent character */
  sound = "s",
}

export class ComponentUseWithSignificance {
  parent: FigureId;
  tag?: ComponentUseTag;
  parentIsPriorityFigure: boolean;

  constructor(
    parent: FigureId,
    parentIsPriorityFigure: boolean,
    tag?: ComponentUseTag,
  ) {
    this.parent = parent;
    this.tag = tag;
    this.parentIsPriorityFigure = parentIsPriorityFigure;
  }

  isDirect() {
    return (
      !this.tag ||
      this.tag === ComponentUseTag.directMeaningless ||
      this.tag === ComponentUseTag.sound ||
      this.tag === ComponentUseTag.directMeaninglessSound
    );
  }

  isMeaningful() {
    return (
      !this.tag ||
      this.tag === ComponentUseTag.meaningfulIndirect ||
      this.tag === ComponentUseTag.meaningfulIndirectSound ||
      this.tag === ComponentUseTag.sound
    );
  }

  isKanjijumpMeaningful() {
    return (
      !this.tag ||
      this.tag === ComponentUseTag.meaningfulIndirect ||
      this.tag === ComponentUseTag.meaningfulIndirectSound ||
      (this.parentIsPriorityFigure && this.tag === ComponentUseTag.sound)
    );
  }

  isSoundMarkUse() {
    return (
      this.tag === ComponentUseTag.directMeaninglessSound ||
      this.tag === ComponentUseTag.meaningfulIndirectSound ||
      this.tag === ComponentUseTag.sound
    );
  }

  isKanjijumpSoundMarkUse() {
    return (
      this.tag === ComponentUseTag.meaningfulIndirectSound ||
      (this.parentIsPriorityFigure && this.tag === ComponentUseTag.sound)
    );
  }

  toJSON() {
    return (
      (this.tag || "") + this.parent + (!this.parentIsPriorityFigure ? "*" : "")
    );
  }

  static fromJSON(json: ReturnType<ComponentUseWithSignificance["toJSON"]>) {
    const match = /^(?<tag>[dmens])?(?<parent>[^*]+)(?<nonPriority>\*)?$/u.exec(
      json,
    );
    if (!match?.groups) {
      throw new Error(`Problem decoding JSON ${JSON.stringify(json)}`);
    }
    const { parent, tag, nonPriority } = match.groups;
    return new ComponentUseWithSignificance(
      parent,
      !nonPriority,
      (tag as ComponentUseTag) || undefined,
    );
  }
}

export function getTag(
  direct: boolean,
  meaningful: boolean,
  soundMark: boolean,
): ComponentUseTag | undefined {
  if (direct && !meaningful) {
    return soundMark
      ? ComponentUseTag.directMeaninglessSound
      : ComponentUseTag.directMeaningless;
  }

  if (!direct && meaningful) {
    return soundMark
      ? ComponentUseTag.meaningfulIndirectSound
      : ComponentUseTag.meaningfulIndirect;
  }

  return soundMark ? ComponentUseTag.sound : undefined;
}
