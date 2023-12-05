import { prisma } from "~/db.server";
import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";

export type PopoverFigure = Awaited<ReturnType<typeof getPopoverFigure>>;
export async function getPopoverFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findFirst({
    where: { id: figureId },
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
