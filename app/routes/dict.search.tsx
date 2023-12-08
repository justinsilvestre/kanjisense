import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import {
  FigureSearchResults,
  getDictionarySearchResults,
} from "~/features/dictionary/dictionarySearchResults";

interface LoaderData {
  results: FigureSearchResults;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const queryStringParams = new URL(request.url).searchParams;
  const searchQueries = queryStringParams.getAll("q");
  console.log({ searchQueries });
  if (!searchQueries.length) {
    throw new Response(`No search query provided.`, { status: 400 });
  }
  try {
    const results = await getDictionarySearchResults(searchQueries);

    return json<LoaderData>({ results });
  } catch (error) {
    return json<LoaderData>({
      results: {
        figures: [],
        images: [],
      },
      error: (error as unknown as Error)?.message,
    });
  }
};
