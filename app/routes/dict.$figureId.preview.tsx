import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";

export interface DictPreviewLoaderData {
  figure: PopoverFigure;
}

export type PopoverFigure = Awaited<ReturnType<typeof getPopoverFigure>>;

async function getPopoverFigure(figureId: string) {
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
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const figureId = params.figureId!;

  const figure = await getPopoverFigure(figureId);

  if (!figure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<DictPreviewLoaderData>({
    figure,
  });
};
