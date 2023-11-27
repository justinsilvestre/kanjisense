import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import {
  DictionaryPageFigureWithPriorityUses,
  dictionaryPageFigureInclude,
} from "~/features/dictionary/getDictionaryPageFigure.server";

export interface FigureSinoReadingsLoaderData {
  firstClassUses: FigurePriorityUses | null;
}

export type FigurePriorityUses =
  NonNullable<DictionaryPageFigureWithPriorityUses>["firstClassUses"];

async function getComponentPriorityUses(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    select: {
      firstClassUses: {
        ...deleteProperty(dictionaryPageFigureInclude.firstClassUses, "take"),
        skip: dictionaryPageFigureInclude.firstClassUses.take,
      },
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const figureId = params.figureId!;

  const figure = await getComponentPriorityUses(figureId);

  if (!figure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<FigureSinoReadingsLoaderData>({
    firstClassUses: figure.firstClassUses || null,
  });
};

function deleteProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): Omit<T, K> {
  const newObj = { ...obj };
  delete newObj[key];
  return newObj;
}
