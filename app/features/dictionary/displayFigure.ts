import type { KanjisenseFigure, KanjisenseFigureImage } from "@prisma/client";

import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  KanjiListCode,
  isKyoikuCode,
  listCodes,
} from "~/lib/dic/KanjiListCode";

export enum BadgeHue {
  KYOIKU = "KYOIKU",
  JOYO = "JOYO",
  HYOGAI = "HYOGAI",
  JINMEIYO = "JINMEIYO",
  EXTRA = "EXTRA",
}

export type StandaloneCharacterQueryFigure = Pick<
  DictionaryPageFigureWithPriorityUses,
  "_count" | "listsAsCharacter"
>;
export function isStandaloneCharacter(figure: StandaloneCharacterQueryFigure) {
  return Boolean(
    figure.listsAsCharacter.length || !figure._count.firstClassUses,
  );
}

export type IsAtomicFigureQueryFigure = Pick<
  DictionaryPageFigureWithPriorityUses,
  "_count"
>;
export function isAtomicFigure(figure: IsAtomicFigureQueryFigure) {
  return figure._count.firstClassComponents < 2;
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
  else return BadgeHue.EXTRA;
}

export function isSecondaryVariant(
  figure: Pick<KanjisenseFigure, "id" | "variantGroupId">,
) {
  return figure.variantGroupId && figure.variantGroupId !== figure.id;
}

type IsPriorityComponentQueryFigure = Pick<
  DictionaryPageFigureWithPriorityUses,
  "_count"
>;
export function isPriorityComponent<T>(
  figureWithPriorityUses: IsPriorityComponentQueryFigure,
) {
  return Boolean(figureWithPriorityUses._count.firstClassUses);
}

type IsPrioritySoundMarkFigure = Pick<
  DictionaryPageFigureWithPriorityUses,
  "asComponent"
>;

export function isPrioritySoundMark(
  figureWithPriorityUses: IsPrioritySoundMarkFigure,
) {
  return Boolean(figureWithPriorityUses.asComponent?._count.soundMarkUses);
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

function _getBadgeProps<T>(
  figure: Pick<
    KanjisenseFigure,
    | "id"
    | "variantGroupId"
    | "listsAsCharacter"
    | "listsAsComponent"
    | "aozoraAppearances"
  > &
    StandaloneCharacterQueryFigure &
    IsAtomicFigureQueryFigure &
    IsPriorityComponentQueryFigure &
    IsPrioritySoundMarkFigure & {
      image?: KanjisenseFigureImage | null;
    },
) {
  const figureIsStandaloneCharacter = isStandaloneCharacter(figure);
  const lists = getLists(figureIsStandaloneCharacter, figure);
  return {
    image: figure.image,
    aozoraAppearanaces: figure.aozoraAppearances,
    hue: getBadgeHue(lists),
    isStandaloneCharacter: figureIsStandaloneCharacter,
    isPriorityComponent: isPriorityComponent(figure),
    isSecondaryVariant: isSecondaryVariant(figure),
  };
}

export type BadgeProps = ReturnType<typeof getBadgeProps>;
