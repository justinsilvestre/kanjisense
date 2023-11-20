import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";

export interface FigureSinoReadingsLoaderData {
  readings: FigureSinoReadings | null;
}

export type FigureSinoReadings = NonNullable<
  Awaited<ReturnType<typeof getSinoCharacterReadings>>
>["reading"];

async function getSinoCharacterReadings(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
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
  const figureId = params.figureId!;

  const figure = await getSinoCharacterReadings(figureId);

  if (!figure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<FigureSinoReadingsLoaderData>({
    readings: figure.reading || null,
  });
};
