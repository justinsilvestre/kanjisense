import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import DictionaryLayout from "~/components/DictionaryLayout";
import { prisma } from "~/db.server";
import {
  getDictionaryPageFigure,
  DictionaryPageSearchedFigure,
} from "~/features/dictionary/getDictionaryPageFigure.server";
import { SingleFigureDictionaryEntry } from "~/features/dictionary/SingleFigureDictionaryEntry";

interface LoaderData {
  searchedFigure: DictionaryPageSearchedFigure;
}

export const meta: MetaFunction = () => [{ title: "Figure entry" }];

export const loader: LoaderFunction = async ({ params }) => {
  const { figureId } = params;

  const searchedFigure = figureId
    ? await getDictionaryPageFigure(figureId)
    : null;
  if (!searchedFigure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<LoaderData>({
    searchedFigure,
  });
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { searchedFigure: figure } = loaderData;
  console.log(loaderData.searchedFigure.id, loaderData.searchedFigure);
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <h1>
          {figure.variantGroup?.id}: {figure.variantGroup?.variants.join(" ")}
        </h1>
        {figure.variantGroup ? (
          figure.variantGroup.variants.map((variantId) => {
            const variant = figure.variantGroup?.figures.find(
              (f) => f.id === variantId,
            );
            if (!variant) return null;
            return (
              <SingleFigureDictionaryEntry key={variantId} figure={variant} />
            );
          })
        ) : (
          <SingleFigureDictionaryEntry figure={figure} />
        )}
      </main>
    </DictionaryLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Figure not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
