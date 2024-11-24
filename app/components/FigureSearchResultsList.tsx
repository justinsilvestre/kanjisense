import { FigureSearchProperty, FigureSearchPropertyType } from "@prisma/client";
import cx, { clsx } from "clsx";
import { useCombobox } from "downshift";
import { FetcherWithComponents, Link } from "react-router";

import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import { FigureSearchResult } from "~/features/dictionary/dictionarySearchResults";
import { kanjidicKanaToRomaji } from "~/features/dictionary/kanjidicKanaToRomaji";
import { DictSearchLoaderData } from "~/routes/dict.search";

import { FigureBadge } from "./FigureBadge";

export function FigureSearchResultsList({
  isOpen,
  inputValue,
  highlightedIndex,
  findMatchingQuery,
  findExactMatchingQuery,
  fetcher,
  searchIsPending,
  getItemProps,
  getMenuProps,
  items,
  className,
}: {
  isOpen: boolean;
  inputValue: string;
  highlightedIndex: number;
  getItemProps?: ReturnType<
    typeof useCombobox<FigureSearchResult>
  >["getItemProps"];
  getMenuProps?: ReturnType<
    typeof useCombobox<FigureSearchResult>
  >["getMenuProps"];
  findMatchingQuery: (text: string) => string | undefined;
  findExactMatchingQuery: (text: string) => string | undefined;
  fetcher: FetcherWithComponents<DictSearchLoaderData>;
  searchIsPending?: boolean;
  items: FigureSearchResult[];
  className?: string;
}) {
  return (
    <ul
      key={fetcher.state}
      className={clsx(
        `absolute top-9 z-30 mt-1 max-h-[70vh] w-full overflow-auto bg-white p-0 shadow-md `,
        className,
      )}
      {...getMenuProps?.()}
    >
      {fetcher.data?.error ? (
        <li className="px-3 py-2 shadow-sm">
          <div className="flex flex-row gap-2 p-4">
            <span className="text-sm text-gray-700">
              There was a problem. Please try again later. Error:{" "}
              <span className="text-red-800">{fetcher.data.error}</span>
            </span>
          </div>
        </li>
      ) : null}
      {isOpen
        ? items
            .sort((a, b) => {
              const aExactInputKeyMatch = inputValue.indexOf(a.key);
              const bExactInputKeyMatch = inputValue.indexOf(b.key);
              if (aExactInputKeyMatch !== -1 && bExactInputKeyMatch !== -1) {
                return aExactInputKeyMatch - bExactInputKeyMatch;
              }
              return 0;
            })
            .map((figure, index) => {
              const itemProps = getItemProps?.({ item: figure, index });
              return (
                <li
                  key={`${figure.key}${index}`}
                  {...itemProps}
                  className={cx(searchIsPending ? "opacity-70" : "")}
                >
                  <Link
                    to={`/dict/${figure.key}`}
                    className={cx(
                      highlightedIndex === index && "bg-blue-100",

                      "flex flex-row gap-2 px-3 py-2 shadow-sm",
                    )}
                  >
                    <span className="mr-2 align-middle text-4xl">
                      <FigureBadge
                        className=""
                        badgeProps={getBadgeProps(figure)}
                      />
                    </span>
                    <span
                      className={cx(
                        "text-sm ",
                        highlightedIndex === index
                          ? "text-black"
                          : "text-gray-700",
                      )}
                    >
                      <SearchPropertiesDisplay
                        figure={figure}
                        findMatchingQuery={findMatchingQuery}
                        findExactMatchingQuery={findExactMatchingQuery}
                      />
                    </span>
                  </Link>
                </li>
              );
            })
        : null}

      {isOpen && !items.length && fetcher.data && !fetcher.data?.error ? (
        <li className="px-3 py-2 shadow-sm">
          <div className="flex flex-row gap-2 p-4">
            <span className="text-sm text-gray-700">
              {searchIsPending ? (
                <span className="animate-pulse italic text-gray-900/80">
                  loading...
                </span>
              ) : (
                <span className="text-gray-900/50">
                  No results found matching your search terms.
                </span>
              )}
            </span>
          </div>
        </li>
      ) : null}
    </ul>
  );
}
export function SearchPropertiesDisplay({
  figure,
  findMatchingQuery,
  findExactMatchingQuery,
}: {
  figure: FigureSearchResult;
  findMatchingQuery: (text: string) => string | undefined;
  findExactMatchingQuery: (text: string) => string | undefined;
}) {
  function addJapaneseReading(
    reading: Pick<
      FigureSearchProperty,
      "type" | "display" | "text" | "version"
    >,
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
      : kanjidicKanaToRomaji(
          reading.display
            ? reading.text.replace(
                new RegExp(`${reading.display}$`),
                `.${reading.display}`,
              )
            : reading.text,
          false,
        );

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
    (all, { searchProperty: { text, type, display, version } }) => {
      switch (type) {
        case FigureSearchPropertyType.ONYOMI_KANA:
        case FigureSearchPropertyType.ONYOMI_LATIN:
          addJapaneseReading({ text, type, display, version }, all.onyomi);
          return all;
        case FigureSearchPropertyType.KUNYOMI_KANA:
        case FigureSearchPropertyType.KUNYOMI_KANA_WITH_OKURIGANA:
        case FigureSearchPropertyType.KUNYOMI_LATIN:
        case FigureSearchPropertyType.KUNYOMI_LATIN_WITH_OKURIGANA:
          addJapaneseReading({ text, type, display, version }, all.kunyomi);
          return all;
        // not these prolly
        case FigureSearchPropertyType.TRANSLATION_ENGLISH:
          all.meanings.push({
            text,
            type,
            display,
            version,
            key: getKey(type, text, display),
          });
          all.mnemonic.push({
            text,
            type,
            display,
            version,
            key: getKey(type, text, display),
          });
          return all;
        case FigureSearchPropertyType.MNEMONIC_ENGLISH:
          all.mnemonic.push({
            text,
            type,
            display,
            version,
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
    ...mnemonic.filter((m) => !meanings.some((me) => me.text === m.text)),
  ];

  return (
    <div className="">
      <div className="mb-1 text-base">
        {meaningsAndMnemonic.map(({ text, type, display }, i) => {
          return (
            <span
              key={text + type}
              className={cx(
                findExactMatchingQuery(text) ? "font-bold text-blue-600" : "",
                !findExactMatchingQuery(text) &&
                  (findMatchingQuery(text) || findMatchingQuery(display))
                  ? ` text-blue-900`
                  : "",
              )}
            >
              {type === FigureSearchPropertyType.MNEMONIC_ENGLISH ? '"' : ""}
              <TextWithMatchHighlighted
                text={
                  display
                    ? `${text.slice(
                        0,
                        text.length - display.length,
                      )}.${display}`
                    : text
                }
                fullMatch={Boolean(findExactMatchingQuery(text))}
                match={findMatchingQuery(text) || findMatchingQuery(display)}
              />

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
              findMatchingQuery={findMatchingQuery}
              findExactMatchingQuery={findExactMatchingQuery}
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
              findMatchingQuery={findMatchingQuery}
              findExactMatchingQuery={findExactMatchingQuery}
              kana={kana}
              latin={latin}
            />
          );
        })}
      </div>
    </div>
  );
}

export function KanaSearchProperty({
  findMatchingQuery,
  findExactMatchingQuery,
  kana,
  latin,
  isOnyomi,
}: {
  findMatchingQuery: (text: string) => string | undefined;
  findExactMatchingQuery: (text: string) => string | undefined;
  kana: FigureSearchProperty;
  latin: FigureSearchProperty;
  isOnyomi?: boolean;
}) {
  const romaji = latin?.text;
  const romajiWithoutOkurigana = romaji?.slice(
    0,
    romaji.length - latin.display.length,
  );
  const withoutOkurigana = kana.text.slice(
    0,
    kana.text.length - kana.display.length,
  );
  const romajiExactMatch =
    findExactMatchingQuery(romaji) ||
    findExactMatchingQuery(romajiWithoutOkurigana);
  const romajiMatch =
    romajiExactMatch ||
    findMatchingQuery(romaji) ||
    findMatchingQuery(romajiWithoutOkurigana);
  const kanaExactMatch =
    findExactMatchingQuery(kana.text) ||
    findExactMatchingQuery(withoutOkurigana);
  const kanaMatch =
    kanaExactMatch ||
    findMatchingQuery(kana.text) ||
    findMatchingQuery(withoutOkurigana);

  const kanaText = kana.display
    ? `${withoutOkurigana}.${kana.display}`
    : kana.text;
  return (
    <span className={cx("inline-block")}>
      <span className="block">
        <TextWithMatchHighlighted
          text={isOnyomi ? hiraganaToKatakana(kanaText) : kanaText}
          fullMatch={Boolean(kanaExactMatch)}
          match={kanaMatch}
        />{" "}
      </span>
      {latin ? (
        <span
          className={`block text-center text-xs text-gray-500 ${
            isOnyomi ? "uppercase" : ""
          }`}
        >
          <TextWithMatchHighlighted
            text={
              latin.display
                ? `${latin.text.slice(
                    0,
                    latin.text.length - latin.display.length,
                  )}.${latin.display}`
                : latin.text
            }
            fullMatch={
              Boolean(romajiExactMatch) ||
              Boolean(
                romajiMatch &&
                  romajiMatch.length > latin.text.length - latin.display.length,
              )
            }
            match={romajiMatch}
          />
        </span>
      ) : null}
    </span>
  );
}
export function getKey(type: string, text: string, display: string) {
  return `${type}@${text}@${display}`;
}
export function TextWithMatchHighlighted({
  text,
  match,
  fullMatch,
}: {
  text: string;
  match: string | undefined;
  fullMatch: boolean;
}) {
  if (fullMatch) return <span className="font-bold text-blue-600">{text}</span>;

  if (!match) {
    return <span className="">{text}</span>;
  }

  const matchIndex = text.toLowerCase().indexOf(match.toLowerCase());
  const matchEndIndex = matchIndex + match.length;
  return (
    <span className="">
      {text.slice(0, matchIndex)}
      <span className="font-bold text-blue-600">
        {text.slice(matchIndex, matchEndIndex)}
      </span>
      {text.slice(matchEndIndex)}
    </span>
  );
}

function hiraganaToKatakana(hiragana: string) {
  return hiragana.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60),
  );
}
