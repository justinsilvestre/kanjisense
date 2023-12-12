import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import {
  FigureSearchResults,
  getDictionarySearchResults,
} from "~/features/dictionary/dictionarySearchResults";

export interface DictSearchLoaderData {
  results: FigureSearchResults;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const queryStringParams = new URL(request.url).searchParams;
  const searchQueries = queryStringParams.getAll("q");
  if (!searchQueries.length) {
    throw new Response(`No search query provided.`, { status: 400 });
  }
  try {
    const results = await getDictionarySearchResults(searchQueries);

    return json<DictSearchLoaderData>({ results });
  } catch (error) {
    return json<DictSearchLoaderData>({
      results: {
        figures: [],
        images: [],
      },
      error: (error as unknown as Error)?.message,
    });
  }
};
