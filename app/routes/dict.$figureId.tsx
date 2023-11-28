import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import DictionaryLayout from "~/components/DictionaryLayout";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import {
  getDictionaryPageFigure,
  DictionaryPageSearchedFigure,
} from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  links as kvgLinks,
  SingleFigureDictionaryEntry,
} from "~/features/dictionary/SingleFigureDictionaryEntry";

interface LoaderData {
  searchedFigure: DictionaryPageSearchedFigure;
}

export const meta: MetaFunction = () => [{ title: "Figure entry" }];

export const links: LinksFunction = () => [...kvgLinks()];

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
  const variants = figure.variantGroup?.variants
    .flatMap((vid) => {
      return figure.variantGroup?.figures.find((f) => f.id === vid) || [];
    })
    .map((f) => getBadgeProps(f));
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <SingleFigureDictionaryEntry figure={figure} variants={variants} />
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
