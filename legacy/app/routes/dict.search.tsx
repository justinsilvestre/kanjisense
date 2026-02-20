import type { LoaderFunction } from "react-router";
import { data } from "react-router";

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

    return data<DictSearchLoaderData>({ results });
  } catch (error) {
    return data<DictSearchLoaderData>({
      results: {
        figures: [],
        images: [],
      },
      error: (error as unknown as Error)?.message,
    });
  }
};
