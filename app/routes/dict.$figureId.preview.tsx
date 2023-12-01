import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import {
  PopoverFigure,
  getPopoverFigure,
} from "~/features/dictionary/PopoverFigure";

interface DictPreviewLoaderData {
  figure: PopoverFigure;
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
