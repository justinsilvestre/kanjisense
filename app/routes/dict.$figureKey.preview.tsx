import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import {
  PopoverFigure,
  getPopoverFigure,
} from "~/features/dictionary/PopoverFigure";

export type DictPreviewLoaderData =
  | {
      figure: PopoverFigure;
      error?: null;
    }
  | { error: string; figure?: null };

export const loader: LoaderFunction = async ({ params }) => {
  const figureKey = params.figureKey!;

  const figure = await getPopoverFigure(figureKey);

  if (!figure) {
    return json<DictPreviewLoaderData>(
      {
        error: `No figure ${JSON.stringify(
          figureKey,
        )} could be found in the database. `,
      },
      { status: 404 },
    );
  }

  return json<DictPreviewLoaderData>({
    figure,
  });
};
