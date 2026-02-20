import { prisma } from "~/db.server";
import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";
import { getLatestFigureId } from "~/models/figure";

export type PopoverFigure = Awaited<ReturnType<typeof getPopoverFigure>>;
export async function getPopoverFigure(figureKey: string) {
  return await prisma.kanjisenseFigure.findFirst({
    where: { id: getLatestFigureId(figureKey) },
    select: {
      ...badgeFigureSelect,
      keyword: true,
      isPriority: true,
      mnemonicKeyword: true,
      listsAsCharacter: true,
      listsAsComponent: true,

      firstClassComponents: {
        orderBy: { indexInTree: "asc" },
        select: {
          component: {
            select: {
              ...badgeFigureSelect,
              image: true,
              keyword: true,
              mnemonicKeyword: true,
            },
          },
        },
      },
      meaning: true,

      image: true,
    },
  });
}
