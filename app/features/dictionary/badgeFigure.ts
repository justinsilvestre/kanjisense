import type {
  KanjisenseFigure,
  KanjisenseFigureImage,
  KanjisenseVariantGroup,
} from "@prisma/client";

import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  KanjiListCode,
  isKyoikuCode,
  listCodes,
} from "~/lib/dic/KanjiListCode";

export interface BadgeProps {
  id: string;
  image?: KanjisenseFigureImage | null;
  aozoraAppearances: number;
  hue: BadgeHue;
  isStandaloneCharacter: boolean;
  lists: KanjiListCode[];
  isPriorityComponent: boolean;
  variantGroupId: string | null;
}

export const badgeFigureSelect = {
  id: true,
  listsAsCharacter: true,
  listsAsComponent: true,
  variantGroupId: true,
  aozoraAppearances: true,

  _count: {
    select: {
      firstClassComponents: true,
      firstClassUses: {
        where: {
          parent: {
            isPriority: true,
          },
        },
      },
    },
  },
  asComponent: {
    select: {
      _count: {
        select: {
          soundMarkUses: {
            where: { isPriority: true },
          },
        },
      },
    },
  },
};

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

export type StandaloneCharacterVariantQueryFigure =
  StandaloneCharacterQueryFigure & {
    variantGroup?: Pick<
      KanjisenseVariantGroup,
      "hasStandaloneCharacter"
    > | null;
  };
export function isStandaloneCharacterVariant(
  figure: StandaloneCharacterVariantQueryFigure,
) {
  return !figure.variantGroup
    ? isStandaloneCharacter(figure)
    : figure.variantGroup.hasStandaloneCharacter;
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
  figureId: string,
  variantGroupId: KanjisenseFigure["variantGroupId"],
) {
  return Boolean(variantGroupId && variantGroupId !== figureId);
}

export type IsPriorityComponentQueryFigure = Pick<
  DictionaryPageFigureWithPriorityUses,
  "_count"
>;
export function isPriorityComponent(
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

export type BadgePropsFigure = Pick<
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
  };

function _getBadgeProps(figure: BadgePropsFigure): BadgeProps {
  const figureIsStandaloneCharacter = isStandaloneCharacter(figure);
  const lists = getLists(figureIsStandaloneCharacter, figure);
  return {
    id: figure.id,
    image: figure.image,
    aozoraAppearances: figure.aozoraAppearances,
    lists,
    hue: getBadgeHue(lists),
    isStandaloneCharacter: figureIsStandaloneCharacter,
    isPriorityComponent: isPriorityComponent(figure),
    variantGroupId: figure.variantGroupId,
  };
}
