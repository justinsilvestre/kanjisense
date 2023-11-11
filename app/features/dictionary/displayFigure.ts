import type { KanjisenseFigure } from "@prisma/client";

import type {
  DictionaryPageFigureWithAsComponent,
  DictionaryPageFigureWithPriorityUses,
} from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  KanjiListCode,
  isKyoikuCode,
  listCodes,
} from "~/lib/dic/KanjiListCode";

enum BadgeHue {
  KYOIKU = "KYOIKU",
  JOYO = "JOYO",
  HYOGAI = "HYOGAI",
  JINMEIYO = "JINMEIYO",
  NONPRIORITY = "NONPRIORITY",
}

export type StandaloneCharacterQueryFigure = Pick<
  KanjisenseFigure,
  "listsAsCharacter"
> &
  DictionaryPageFigureWithAsComponent;

export function isStandaloneCharacter(figure: StandaloneCharacterQueryFigure) {
  return Boolean(figure.listsAsCharacter.length || !figure.asComponent);
}

export function isAtomicFigure(
  figure: Pick<DictionaryPageFigureWithPriorityUses, "firstClassComponents">,
) {
  return figure.firstClassComponents.length === 0;
}

export function getLists(
  isStandaloneCharacter: boolean,
  figure: Pick<KanjisenseFigure, "listsAsCharacter" | "listsAsComponent">,
) {
  if (isStandaloneCharacter) return figure.listsAsCharacter as KanjiListCode[];
  else return figure.listsAsComponent as KanjiListCode[];
}

export function getBadgeHue(lists: KanjiListCode[]) {
  if (lists.some(isKyoikuCode)) return BadgeHue.KYOIKU;
  else if (lists.includes(listCodes.joyo)) return BadgeHue.JOYO;
  else if (lists.includes(listCodes.hyogai)) return BadgeHue.HYOGAI;
  else if (lists.includes(listCodes.jinmeiyo)) return BadgeHue.JINMEIYO;
  else return BadgeHue.NONPRIORITY;
}

export function isSecondaryVariant(
  figure: Pick<KanjisenseFigure, "id" | "variantGroupId">,
) {
  return figure.variantGroupId ? figure.variantGroupId === figure.id : false;
}

export function isPriorityComponent(
  figureWithPriorityUses: Pick<
    DictionaryPageFigureWithPriorityUses,
    "firstClassUses"
  >,
) {
  return figureWithPriorityUses.firstClassUses.length > 0;
}

export function isPrioritySoundMark(
  figureWithPriorityUses: Pick<
    DictionaryPageFigureWithPriorityUses,
    "id" | "firstClassUses"
  >,
) {
  return figureWithPriorityUses.firstClassUses.some(
    (u) => u.parent.activeSoundMarkId === figureWithPriorityUses.id,
  );
}

export const getBadgeProps = memoizeById(_getBadgeProps);
function memoizeById<T extends { id: string }, U>(fn: (arg: T) => U) {
  const cache = new Map<string, U>();
  return (arg: T) => {
    const cached = cache.get(arg.id);
    if (cached) return cached;
    const result = fn(arg);
    cache.set(arg.id, result);
    return result;
  };
}

function _getBadgeProps(
  figure: Pick<
    DictionaryPageFigureWithPriorityUses,
    | "id"
    | "variantGroupId"
    | "firstClassComponents"
    | "firstClassUses"
    | "asComponent"
    | "listsAsCharacter"
    | "listsAsComponent"
  >,
) {
  const figureIsStandaloneCharacter = isStandaloneCharacter(figure);
  const lists = getLists(figureIsStandaloneCharacter, figure);
  return {
    hue: getBadgeHue(lists),
    isStandaloneCharacter: figureIsStandaloneCharacter,
    isPriorityComponent: isPriorityComponent(figure),
    isSecondaryVariant: isSecondaryVariant(figure),
  };
}
