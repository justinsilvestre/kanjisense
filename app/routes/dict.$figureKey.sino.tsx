import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import { getLatestFigureId } from "~/models/figure";

export type FigureSinoReadingsLoaderData =
  | {
      readings: FigureSinoReadings;
      error?: null;
    }
  | { error: string; readings?: null };

export type FigureSinoReadings = NonNullable<
  Awaited<ReturnType<typeof getSinoCharacterReadings>>
>["reading"];

async function getSinoCharacterReadings(figureKey: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: getLatestFigureId(figureKey) },
    select: {
      reading: {
        select: {
          unihan15: {
            select: {
              kHangul: true,
              kVietnamese: true,
              kCantonese: true,
              kMandarin: true,
              kHanyuPinyin: true,
            },
          },
        },
      },
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const figureKey = params.figureKey!;

  const figure = await getSinoCharacterReadings(figureKey);

  if (!figure) {
    return json<FigureSinoReadingsLoaderData>(
      {
        error: `No figure ${JSON.stringify(
          figureKey,
        )} could be found in the database. `,
      },
      { status: 404 },
    );
  }

  return json<FigureSinoReadingsLoaderData>({
    readings: figure.reading || null,
  });
};