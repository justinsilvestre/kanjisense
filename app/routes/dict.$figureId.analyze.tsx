import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import { badgeFigureSelect } from "~/features/dictionary/badgeFigure";

export interface FigureComponentsAnalysisLoaderData {
  figure: FigureComponentsAnalysis;
}

export type FigureComponentsAnalysis = NonNullable<
  Awaited<ReturnType<typeof analyzeFigureComponents>>
>;

export type ComponentsTreeMemberFigure =
  FigureComponentsAnalysis["firstClassComponents"][number]["component"];

async function analyzeFigureComponents(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    select: {
      id: true,
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
                  // component: {
                  //   select: {
                  //     id: true,
                  //   },
                  // },
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
  const figureId = params.figureId!;

  const figure = await analyzeFigureComponents(figureId);

  if (!figure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<FigureComponentsAnalysisLoaderData>({
    figure,
  });
};