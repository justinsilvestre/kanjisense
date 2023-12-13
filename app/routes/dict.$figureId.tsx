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
import css from "~/features/dictionary/styles.css";

type LoaderData =
  | {
      searchedFigure: DictionaryPageSearchedFigure;
      errorMessage?: null;
    }
  | { errorMessage: string; searchedFigure?: null };

export const meta: MetaFunction<typeof loader> = (a) => [
  {
    title: getPageTitle(a.params.figureId, a.data.searchedFigure),
  },
];

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: css,
  },
  ...kvgLinks(),
];

export const loader: LoaderFunction = async ({ params }) => {
  const { figureId } = params;
  const searchedFigure = figureId
    ? await getDictionaryPageFigure(figureId)
    : null;
  if (!searchedFigure) {
    return json<LoaderData>(
      {
        errorMessage: `No figure ${JSON.stringify(
          figureId,
        )} could be found in the database. `,
      },
      { status: 404 },
    );
  }

  return json<LoaderData>({
    searchedFigure,
  });
};

function getPageTitle(
  figureId: string | null | undefined,
  figure: DictionaryPageSearchedFigure,
): unknown | string {
  if ([...(figureId || "")].length === 1)
    return `${figureId} - definition, components, readings, and more | Kanjisense`;
  if (!figure)
    return `Character definitions, components, readings, and more | Kanjisense`;
  const keyword =
    figure.mnemonicKeyword && figure.mnemonicKeyword !== figure.keyword
      ? JSON.stringify(figure.mnemonicKeyword)
      : figure.keyword;
  return `${keyword} - definition, components, readings, and more | Kanjisense`;
}

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  if (loaderData.errorMessage != null) {
    return (
      <DictionaryLayout>
        <main className="flex flex-grow flex-col gap-2">
          <div className="m-4 text-center text-xl text-red-600">
            {loaderData.errorMessage}
          </div>
        </main>
      </DictionaryLayout>
    );
  }
  const { searchedFigure: figure } = loaderData;
  const variants = figure.variantGroup?.variants
    .flatMap((vid) => {
      return figure.variantGroup?.figures.find((f) => f.id === vid) || [];
    })
    .map((f) => getBadgeProps(f));
  return (
    <DictionaryLayout>
      <main className="flex flex-grow flex-col gap-2">
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
