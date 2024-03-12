import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import {
  DictionaryPageFigureWithPriorityUses,
  dictionaryPageFigureInclude,
} from "~/features/dictionary/getDictionaryPageFigure.server";
import { FIGURES_VERSION, getFigureId } from "~/models/figure";

export type FigurePriorityUsesLoaderData =
  | {
      key: string;
      id: string;
      firstClassUses: FigurePriorityUses | null;
      error?: null;
    }
  | { error: string; id?: null; key?: null; firstClassUses?: null };

export type FigurePriorityUses =
  NonNullable<DictionaryPageFigureWithPriorityUses>["firstClassUses"];

async function getComponentPriorityUses(figureKey: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: getFigureId(FIGURES_VERSION, figureKey) },
    select: {
      id: true,
      firstClassUses: {
        ...deleteProperty(dictionaryPageFigureInclude.firstClassUses, "take"),
        skip: dictionaryPageFigureInclude.firstClassUses.take,
      },
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const figureKey = params.figureKey!;

  const figure = await getComponentPriorityUses(figureKey);

  if (!figure) {
    return json<FigurePriorityUsesLoaderData>(
      {
        error: `No figure ${JSON.stringify(
          figureKey,
        )} could be found in the database. `,
      },
      { status: 404 },
    );
  }

  return json<FigurePriorityUsesLoaderData>({
    id: figure.id,
    key: figureKey,
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
