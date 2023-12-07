import { FigureSearchProperty, FigureSearchPropertyType } from "@prisma/client";
import { Link, useFetcher, useNavigate } from "@remix-run/react";
import cx from "clsx";
import { useCombobox } from "downshift";
import type { PropsWithChildren } from "react";
import { useEffect, useId, useState } from "react";

import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import { FigureSearchResult } from "~/features/dictionary/dictionarySearchResults";
import { kanjidicKanaToRomaji } from "~/features/dictionary/kanjidicKanaToRomaji";
import {
  toModifiedHepburn,
  couldBeRomaji,
} from "~/features/dictionary/romajiHelpers";

import { FigureBadge } from "./FigureBadge";

export function FigureSearchForm({
  className,
  defaultSearchText,
}: {
  className?: string;
  defaultSearchText?: string;
}) {
  const searchFetcher = useFetcher<{ results: FigureSearchResult[] }>();
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).searchFetcher = searchFetcher;
  }, [searchFetcher]);

  const searchResults: FigureSearchResult[] = searchFetcher.data?.results || [];

  const [queries, setQueries] = useState<string[]>([]);
  const navigate = useNavigate();

  const loadQueries = debounce(function loadQueries(queries: string[]) {
    searchFetcher.load(
      `/dict/search?${queries
        .map((q) => `q=${encodeURIComponent(q)}`)
        .join("&")}`,
    );
    setQueries(queries);
  }, 300);

  const comboBox = useCombobox({
    id: useId(),
    defaultInputValue: defaultSearchText,
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        const key = selectedItem.id;
        navigate(`/dict/${key}`);
      }
    },
    onInputValueChange({ inputValue }) {
      if (inputValue) {
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
    items: searchResults,
    itemToString(item) {
      if (!item) return "";

      return item?.id.charAt(0) === item.id ? item.id : item.keyword || item.id;
    },
  });

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
        searchState={searchFetcher.state}
        comboBox={comboBox}
        items={searchResults}
        queries={queries}
      >
        <button
          type="submit"
          className="block h-full w-16 cursor-pointer border-2 border-zinc-400 bg-slate-500 text-white disabled:cursor-auto disabled:opacity-60"
          disabled={!comboBox.selectedItem}
        >
          Go
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
  searchState,
}: PropsWithChildren<{
  comboBox: ReturnType<typeof useCombobox<FigureSearchResult>>;
  items: FigureSearchResult[];
  queries: string[];
  searchState: ReturnType<typeof useFetcher>["state"];
}>) {
  const isQueryMatch = (text: string) => {
    return queries.some((q) => text.toLowerCase().includes(q));
  };
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = comboBox;

  return (
    <div className="">
      <div className="flex flex-row items-end gap-1">
        <div className="flex flex-grow flex-col">
          <label className="w-fit" htmlFor="search" {...getLabelProps()}>
            search characters + character components
          </label>
          <div className="relative flex h-9 flex-row gap-0.5  bg-white shadow-sm">
            <input
              placeholder="Enter kanji, reading, or English definition"
              className="block flex-grow p-1.5"
              id="search"
              {...getInputProps()}
            />
            <ul
              key={searchState}
              className={`absolute top-9 z-30 mt-1 max-h-80 w-full overflow-auto bg-white p-0 shadow-md ${
                !(isOpen && items.length) && "hidden"
              }`}
              {...getMenuProps()}
            >
              {isOpen
                ? items
                    .sort((a, b) => {
                      const aExactInputKeyMatch = comboBox.inputValue.indexOf(
                        a.id,
                      );
                      const bExactInputKeyMatch = comboBox.inputValue.indexOf(
                        b.id,
                      );
                      if (
                        aExactInputKeyMatch !== -1 &&
                        bExactInputKeyMatch !== -1
                      ) {
                        return aExactInputKeyMatch - bExactInputKeyMatch;
                      }
                      return 0;
                    })
                    .map((figure, index) => (
                      <li
                        key={`${figure.id}${index}`}
                        {...getItemProps({ item: figure, index })}
                      >
                        <Link
                          to={`/dict/${figure.id}`}
                          className={cx(
                            highlightedIndex === index && "bg-blue-100",
                            selectedItem === figure && "font-bold",
                            "flex flex-row gap-2 px-3 py-2 shadow-sm",
                          )}
                        >
                          <span className="align-middle text-4xl">
                            <FigureBadge
                              className=""
                              id={figure.id}
                              badgeProps={getBadgeProps(figure)}
                            />
                          </span>
                          <span className="text-sm text-gray-700">
                            {SearchPropertiesDisplay({
                              figure,
                              isQueryMatch,
                              comboBox,
                            })}
                          </span>
                        </Link>
                      </li>
                    ))
                : null}
            </ul>
          </div>
        </div>
        <div className="h-9">{children}</div>
      </div>
    </div>
  );
}
function getKey(type: string, text: string, display: string) {
  return `${type}@${text}@${display}`;
}

function SearchPropertiesDisplay({
  figure,
  isQueryMatch,
}: {
  figure: FigureSearchResult;
  isQueryMatch: (text: string) => boolean;
  comboBox: ReturnType<typeof useCombobox<FigureSearchResult>>;
}) {
  function addJapaneseReading(
    reading: Pick<FigureSearchProperty, "type" | "display" | "text">,
    registry: Record<
      string,
      { kana: FigureSearchProperty | null; latin: FigureSearchProperty | null }
    >,
  ) {
    const isRomaji =
      reading.type === FigureSearchPropertyType.ONYOMI_LATIN ||
      reading.type === FigureSearchPropertyType.KUNYOMI_LATIN ||
      reading.type === FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA;
    const romaji = isRomaji
      ? reading.text
      : kanjidicKanaToRomaji(reading.text, true);

    if (registry[romaji]) {
      registry[romaji][isRomaji ? "latin" : "kana"] = {
        ...reading,
        key: getKey(reading.type, reading.text, reading.display),
      };
    } else {
      registry[romaji] = isRomaji
        ? {
            kana: null,
            latin: {
              ...reading,
              key: getKey(reading.type, reading.text, reading.display),
            },
          }
        : {
            latin: null,
            kana: {
              ...reading,
              key: getKey(reading.type, reading.text, reading.display),
            },
          };
    }
  }
  const searchProperties = figure.searchProperties.reduce(
    (all, { searchProperty: { text, type, display } }) => {
      switch (type) {
        case FigureSearchPropertyType.ONYOMI_KANA:
        case FigureSearchPropertyType.ONYOMI_LATIN:
          addJapaneseReading({ text, type, display }, all.onyomi);
          return all;
        case FigureSearchPropertyType.KUNYOMI_KANA:
        case FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA:
        case FigureSearchPropertyType.KUNYOMI_LATIN:
        case FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA:
          addJapaneseReading({ text, type, display }, all.kunyomi);
          return all;
        // not these prolly
        case FigureSearchPropertyType.TRANSLATION_ENGLISH:
          all.meanings.push({
            text,
            type,
            display,
            key: getKey(type, text, display),
          });
          all.mnemonic.push({
            text,
            type,
            display,
            key: getKey(type, text, display),
          });
          return all;
        case FigureSearchPropertyType.MNEMONIC_ENGLISH:
          all.mnemonic.push({
            text,
            type,
            display,
            key: getKey(type, text, display),
          });
      }

      return all;
    },
    {
      onyomi: {} as Record<
        string,
        { kana: FigureSearchProperty; latin: FigureSearchProperty }
      >,
      kunyomi: {} as Record<
        string,
        { kana: FigureSearchProperty; latin: FigureSearchProperty }
      >,
      mnemonic: [] as FigureSearchProperty[],
      meanings: [] as FigureSearchProperty[],
    },
  );
  const { mnemonic, meanings } = searchProperties;
  const onyomi = Object.entries(searchProperties.onyomi);
  const kunyomi = Object.entries(searchProperties.kunyomi);

  const meaningsAndMnemonic = [
    ...meanings,
    ...mnemonic.filter((m) => !meanings.some((me) => me.display === m.display)),
  ];

  return (
    <div className="">
      <div className="text-base">
        {meaningsAndMnemonic.map(({ text, type, display }, i) => {
          return (
            <span
              key={text + type}
              className={
                isQueryMatch(text) || isQueryMatch(display)
                  ? ` font-bold text-blue-600`
                  : ""
              }
            >
              {type === FigureSearchPropertyType.MNEMONIC_ENGLISH ? '"' : ""}
              {display
                ? `${text.slice(0, text.length - display.length)}.${display}`
                : text}
              {type === FigureSearchPropertyType.MNEMONIC_ENGLISH ? '"' : ""}
              {i === meaningsAndMnemonic.length - 1 ? "" : "; "}
            </span>
          );
        })}
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {onyomi.map(([, { kana, latin }], i) => {
          return (
            <KanaSearchProperty
              key={String(i) + `${kana}/${latin}`}
              isQueryMatch={isQueryMatch}
              kana={kana}
              latin={latin}
              isOnyomi={true}
            />
          );
        })}
        {kunyomi.map(([, { kana, latin }], i) => {
          return (
            <KanaSearchProperty
              key={String(i) + `${kana}/${latin}`}
              isQueryMatch={isQueryMatch}
              kana={kana}
              latin={latin}
            />
          );
        })}
      </div>
    </div>
  );
}

function KanaSearchProperty({
  isQueryMatch,
  kana,
  latin,
  isOnyomi,
}: {
  isQueryMatch: (text: string) => boolean;
  kana: FigureSearchProperty;
  latin: FigureSearchProperty;
  isOnyomi?: boolean;
}) {
  if (!latin || !kana)
    return (
      <span>
        {latin?.text}? {kana?.text}?
      </span>
    );
  const romaji = latin?.text;

  const kanaText = kana.display
    ? `${kana.text.slice(0, kana.text.length - kana.display.length)}.${
        kana.display
      }`
    : kana.text;
  return (
    <span
      className={`inline-block ${
        isQueryMatch(romaji) || isQueryMatch(kana.text)
          ? ` font-bold text-blue-600`
          : ""
      }`}
    >
      <span className="block">
        {isOnyomi ? hiraganaToKatakana(kanaText) : kanaText}{" "}
      </span>
      {latin ? (
        <span
          className={`block text-center text-xs text-gray-500 ${
            isOnyomi ? "uppercase" : ""
          }`}
        >
          {latin.display
            ? `${latin.text.slice(
                0,
                latin.text.length - latin.display.length,
              )}.${latin.display}`
            : latin.text}
        </span>
      ) : null}
    </span>
  );
}

function hiraganaToKatakana(hiragana: string) {
  return hiragana.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60),
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
