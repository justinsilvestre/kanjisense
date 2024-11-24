import { data, type LoaderFunction } from "react-router";

import { prisma } from "~/db.server";
import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";
import { getLatestFigureId } from "~/models/figure";

export type FigureComponentsAnalysisLoaderData =
  | {
      figure: FigureComponentsAnalysis;
      error?: null;
    }
  | { error: string; figure?: null };

export type FigureComponentsAnalysis = NonNullable<
  Awaited<ReturnType<typeof analyzeFigureComponents>>
>;

export type ComponentsTreeMemberFigure =
  FigureComponentsAnalysis["firstClassComponents"][number]["component"];

async function analyzeFigureComponents(figureKey: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: getLatestFigureId(figureKey) },
    select: {
      id: true,
      key: true,
      firstClassComponents: {
        orderBy: { indexInTree: "asc" },
        select: {
          componentId: true,
          component: {
            select: {
              ...badgeFigureSelect,
              image: true,
              keyword: true,
              mnemonicKeyword: true,
              activeSoundMarkId: true,
              activeSoundMarkValue: true,

              reading: {
                select: {
                  selectedOnReadings: true,
                  sbgyXiaoyuns: {
                    include: {
                      sbgyXiaoyun: true,
                    },
                  },
                  kanjidicEntry: {
                    select: {
                      onReadings: true,
                      kunReadings: true,
                    },
                  },
                },
              },

              firstClassComponents: {
                select: {
                  componentId: true,
                },
              },
            },
          },
        },
      },
      meaning: true,
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const figureKey = params.figureKey!;

  const figure = await analyzeFigureComponents(figureKey);

  if (!figure) {
    return data<FigureComponentsAnalysisLoaderData>(
      {
        error: `No figure ${JSON.stringify(
          figureKey,
        )} could be found in the database. `,
      },
      { status: 404 },
    );
  }

  return data<FigureComponentsAnalysisLoaderData>({
    figure,
  });
};
