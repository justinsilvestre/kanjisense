/** no tag means direct meaningful */

import { KanjisenseComponentUseTag } from "@prisma/client";

type FigureId = string;

export class ComponentUseWithSignificance {
  parent: FigureId;
  tag?: KanjisenseComponentUseTag;
  parentIsPriorityFigure: boolean;

  constructor(
    parent: FigureId,
    parentIsPriorityFigure: boolean,
    tag?: KanjisenseComponentUseTag,
  ) {
    this.parent = parent;
    this.tag = tag;
    this.parentIsPriorityFigure = parentIsPriorityFigure;
  }

  isDirect() {
    return (
      !this.tag ||
      this.tag === KanjisenseComponentUseTag.directMeaningless ||
      this.tag === KanjisenseComponentUseTag.sound ||
      this.tag === KanjisenseComponentUseTag.directMeaninglessSound
    );
  }

  isMeaningful() {
    return (
      !this.tag ||
      this.tag === KanjisenseComponentUseTag.meaningfulIndirect ||
      this.tag === KanjisenseComponentUseTag.meaningfulIndirectSound ||
      this.tag === KanjisenseComponentUseTag.sound
    );
  }

  isKanjijumpMeaningful() {
    return (
      !this.tag ||
      this.tag === KanjisenseComponentUseTag.meaningfulIndirect ||
      this.tag === KanjisenseComponentUseTag.meaningfulIndirectSound ||
      (this.parentIsPriorityFigure &&
        this.tag === KanjisenseComponentUseTag.sound)
    );
  }

  isSoundMarkUse() {
    return (
      this.tag === KanjisenseComponentUseTag.directMeaninglessSound ||
      this.tag === KanjisenseComponentUseTag.meaningfulIndirectSound ||
      this.tag === KanjisenseComponentUseTag.sound
    );
  }

  isKanjijumpSoundMarkUse() {
    return (
      this.tag === KanjisenseComponentUseTag.meaningfulIndirectSound ||
      (this.parentIsPriorityFigure &&
        this.tag === KanjisenseComponentUseTag.sound)
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
      (tag as KanjisenseComponentUseTag) || undefined,
    );
  }
}

export function getTag(
  direct: boolean,
  meaningful: boolean,
  soundMark: boolean,
): KanjisenseComponentUseTag | undefined {
  if (direct && !meaningful) {
    return soundMark
      ? KanjisenseComponentUseTag.directMeaninglessSound
      : KanjisenseComponentUseTag.directMeaningless;
  }

  if (!direct && meaningful) {
    return soundMark
      ? KanjisenseComponentUseTag.meaningfulIndirectSound
      : KanjisenseComponentUseTag.meaningfulIndirect;
  }

  return soundMark ? KanjisenseComponentUseTag.sound : undefined;
}
