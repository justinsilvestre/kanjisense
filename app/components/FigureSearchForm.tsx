import { KanjisenseFigureImage } from "@prisma/client";
import { useFetcher, useNavigate } from "@remix-run/react";
import { clsx } from "clsx";
import { useCombobox } from "downshift";
import type { PropsWithChildren } from "react";
import { useEffect, useId, useMemo, useState } from "react";

import {
  FigureSearchResult,
  FigureSearchResultWithImage,
} from "~/features/dictionary/dictionarySearchResults";
import {
  toModifiedHepburn,
  couldBeRomaji,
} from "~/features/dictionary/romajiHelpers";
import { DictSearchLoaderData } from "~/routes/dict.search";

import { FigureSearchResultsList } from "./FigureSearchResultsList";

export function FigureSearchForm({
  className,
  defaultSearchText,
}: {
  className?: string;
  defaultSearchText?: string;
}) {
  const searchFetcher = useFetcher<DictSearchLoaderData>();

  const imagesMap = useMemo(
    () =>
      new Map<string, KanjisenseFigureImage>(
        searchFetcher.data?.results?.images.map((i) => [i.id, i]) || [],
      ),
    [searchFetcher.data?.results?.images],
  );
  const searchResults: FigureSearchResultWithImage[] = useMemo(
    () =>
      searchFetcher.data?.results?.figures.map((f) => ({
        ...f,
        image: imagesMap.get(f.id) || null,
      })) || [],
    [searchFetcher.data?.results?.figures, imagesMap],
  );

  const [queries, setQueries] = useState<string[]>([]);
  const navigate = useNavigate();

  const loadQueries = debounce(function loadQueries(queries: string[]) {
    searchFetcher.load(
      `/dict/search?${queries
        .map((q) => `q=${encodeURIComponent(q)}`)
        .join("&")}`,
    );
    setQueries(queries);
  }, 400);

  const [searchIsPending, setSearchIsPending] = useState(false);
  const [lastSearchText, setLastSearchText] = useState(queries);
  useEffect(() => {
    setSearchIsPending(searchFetcher.state !== "idle");
  }, [searchFetcher.state]);

  const comboBox = useCombobox({
    id: useId(),
    defaultInputValue: defaultSearchText,
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        const key = selectedItem.id;
        navigate(`/dict/${key}`);
      }
    },
    onInputValueChange({ inputValue, type }) {
      if (inputValue && type === useCombobox.stateChangeTypes.InputChange) {
        const queries: string[] = [inputValue.toLowerCase()];
        const hepburns = toModifiedHepburn(inputValue).filter(
          (h) => h !== inputValue,
        );
        if (hepburns.length && hepburns.every(couldBeRomaji)) {
          for (const hepburn of hepburns) {
            queries.push(`${hepburn.toLowerCase()}`);
          }
        }
        loadQueries(queries);
      }
    },
    items: searchResults || [],
    itemToString(item) {
      if (!item) return "";

      return item?.id.charAt(0) === item.id ? item.id : item.keyword || item.id;
    },
  });

  useEffect(() => {
    if (searchFetcher.state === "idle") {
      setLastSearchText(queries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFetcher.data]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (comboBox.selectedItem) {
      const key = comboBox.selectedItem.id;
      navigate(`/dict/${key}`);
    }
  };

  return (
    <form className={`${className}`} onSubmit={handleSubmit}>
      <ComboBox
        fetcher={searchFetcher}
        comboBox={comboBox}
        items={searchResults}
        queries={lastSearchText}
        searchIsPending={searchIsPending}
      >
        <button
          type="submit"
          className={clsx(
            "block h-full w-16 cursor-pointer border-2 border-zinc-400 bg-slate-500 text-white disabled:cursor-auto",
            {
              "animate-pulse": searchIsPending,
              "opacity-20": !searchIsPending && !comboBox.selectedItem,
            },
          )}
          disabled={!comboBox.selectedItem || searchIsPending}
        >
          {searchIsPending ? "..." : "Go"}
        </button>
      </ComboBox>
    </form>
  );
}

function ComboBox({
  comboBox,
  items,
  queries,
  children,
  fetcher,
  searchIsPending,
  lastSearchText,
}: PropsWithChildren<{
  comboBox: ReturnType<typeof useCombobox<FigureSearchResult>>;
  items: FigureSearchResult[];
  queries: string[];
  fetcher: ReturnType<typeof useFetcher<DictSearchLoaderData>>;
  searchIsPending?: boolean;
  lastSearchText?: string;
}>) {
  const findMatchingQuery = (text: string) => {
    return queries.find((q) => text.toLowerCase().includes(q));
  };
  const findExactMatchingQuery = (text: string) => {
    return queries.find((q) => text.toLowerCase() === q.toLowerCase());
  };
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = comboBox;

  return (
    <div className="">
      <div className="flex flex-row items-end gap-1">
        <div className="flex flex-grow flex-col">
          <label className="w-fit pb-1" htmlFor="search" {...getLabelProps()}>
            search characters + character components
          </label>
          <div className="relative flex h-9 flex-row gap-0.5  bg-white shadow-sm">
            <input
              placeholder="Enter kanji, reading, or English definition"
              className="block flex-grow p-1.5"
              id="search"
              {...getInputProps()}
            />
            <FigureSearchResultsList
              className={clsx(!isOpen && "hidden")}
              isOpen={isOpen}
              inputValue={lastSearchText || ""}
              highlightedIndex={highlightedIndex}
              getItemProps={getItemProps}
              getMenuProps={getMenuProps}
              findMatchingQuery={findMatchingQuery}
              findExactMatchingQuery={findExactMatchingQuery}
              fetcher={fetcher}
              searchIsPending={searchIsPending}
              items={items}
            />
          </div>
        </div>
        <div className="h-9">{children}</div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      fn(...args);
    }, ms);
  };
}
