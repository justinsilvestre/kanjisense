import { KanjisenseFigureRelation } from "@prisma/client";

import {
  ComponentUseWithSignificance,
  getTag,
} from "prisma/kanjisense/ComponentUseWithSignificance";
import { prisma } from "~/db.server";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { isFigurePriority } from "./isFigurePriority";

type FigureId = string;

/** Get all uses of figure as component that are direct, plus for any direct uses without kanjijump meaning,
 * get the first indirect uses which do have kanjijump meaning.
 * May have repeat components, if they are used multiple times in one character */

export async function getMeaningfulUses({
  baseKanjiVariants,
  figure,
  getFigure,
  getActiveSoundMark,
  direct = true,
}: {
  baseKanjiVariants: string[][];
  figure: KanjisenseFigureRelation;
  getFigure: (key: FigureId) => Promise<KanjisenseFigureRelation>;
  getActiveSoundMark: (
    key: FigureId,
  ) => Promise<KanjisenseFigureRelation | null>;
  direct?: boolean;
}): Promise<ComponentUseWithSignificance[]> {
  const meaningfulUses: ComponentUseWithSignificance[] = [];
  const { directUses } = figure;

  for (const directUseParentKey of directUses) {
    const directUse = await getFigure(directUseParentKey);
    const directUseActiveSoundMark =
      await getActiveSoundMark(directUseParentKey);

    const isOrContainsSoundMark =
      directUseActiveSoundMark != null &&
      isMutualKanjijumpVariantOf(figure, directUseActiveSoundMark);

    const { isPriority: parentIsPriorityFigure } = await isFigurePriority(
      prisma,
      baseKanjiVariants,
      directUse,
    );

    if (
      (
        await shouldComponentBeAssignedMeaning(prisma, {
          id: directUse.id,
          directUses: directUse.directUses,
          variantGroupId: directUse.variantGroupId,
        })
      ).result
    )
      meaningfulUses.push(
        new ComponentUseWithSignificance(
          directUse.id,
          parentIsPriorityFigure,
          getTag(direct, true, isOrContainsSoundMark),
        ),
      );
    else {
      if (direct)
        meaningfulUses.push(
          new ComponentUseWithSignificance(
            directUse.id,
            parentIsPriorityFigure,
            getTag(direct, false, isOrContainsSoundMark),
          ),
        );
      meaningfulUses.push(
        ...(await getMeaningfulUses({
          baseKanjiVariants,
          figure: directUse,
          getFigure,
          getActiveSoundMark,
          direct: false,
        })),
      );
    }
  }

  return meaningfulUses;
}

function isMutualKanjijumpVariantOf(
  figure1: KanjisenseFigureRelation,
  figure2: KanjisenseFigureRelation,
) {
  return primaryVariant(figure1) === primaryVariant(figure2);
}
function primaryVariant(figure: KanjisenseFigureRelation) {
  return figure.variantGroupId ?? figure.id;
}
