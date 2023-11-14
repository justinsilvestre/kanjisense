import { KanjisenseFigure } from "@prisma/client";

import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverBadge } from "~/components/FigurePopover";
import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  isPriorityComponent,
  isPrioritySoundMark,
  isStandaloneCharacter,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/displayFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  displayActiveSoundMark,
  getReadingMatchingSoundMark,
} from "~/features/dictionary/getReadingMatchingSoundMark";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

export function SingleFigureDictionaryEntry({
  figure,
  primaryVariantFigure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
  primaryVariantFigure: StandaloneCharacterQueryFigure;
}) {
  const headingsMeanings = getHeadingsMeanings(figure, primaryVariantFigure);
  return (
    <section className={`${figure.isPriority ? "" : "bg-gray-200"}`}>
      <h1>
        {figure.id}: <FigureKeywordDisplay figure={figure} />
      </h1>
      <div>
        <FigureBadge
          id={figure.id}
          badgeProps={getBadgeProps(figure)}
          width={10}
        />
      </div>

      {headingsMeanings.currentCharacter ? (
        <h1>{headingsMeanings.currentCharacter.join("; ")}</h1>
      ) : null}
      {headingsMeanings.componentMnemonic ? (
        <h1>
          <div className="text-gray-500">component mnemonic:</div>
          {headingsMeanings.componentMnemonic.text}
          {headingsMeanings.componentMnemonic.reference ? (
            <>
              {" "}
              ({headingsMeanings.componentMnemonic.referenceTypeText}{" "}
              {headingsMeanings.componentMnemonic.reference})
            </>
          ) : null}
        </h1>
      ) : null}
      {headingsMeanings.obsoleteCharacter ? (
        <h1>
          <div className="text-gray-500">historical character meaning:</div>
          {headingsMeanings.obsoleteCharacter.join("; ")}
        </h1>
      ) : null}
      <h2>
        {figure.firstClassComponents.map((c) => (
          <span key={c.indexInTree}>
            <FigurePopoverBadge
              id={c.componentId}
              badgeProps={getBadgeProps(c.component)}
            />{" "}
            {c.parent.activeSoundMarkId === c.component.id
              ? displayActiveSoundMark(c)
              : ""}{" "}
            <FigureKeywordDisplay figure={c.component} />
          </span>
        ))}
      </h2>

      <h2>{figure.reading?.selectedOnReadings?.join(" ") || "-"}</h2>
      <h2>{figure.reading?.kanjidicEntry?.onReadings?.join(" ")}</h2>
      <h2>{figure.reading?.kanjidicEntry?.kunReadings?.join(" ")}</h2>
      <h2>
        {figure.reading?.sbgyXiaoyuns
          ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
          ?.join(" ")}
      </h2>

      <h2>priority: {figure.isPriority ? "yes" : "no"}</h2>
      <h2>standalone: {isStandaloneCharacter(figure) ? "yes" : "no"}</h2>
      <h2>priority sound mark: {isPrioritySoundMark(figure) ? "yes" : "no"}</h2>
      <h2>priority component: {isPriorityComponent(figure) ? "yes" : "no"}</h2>

      <h2>
        used as a component in {figure.firstClassUses.length} priority figures
      </h2>

      <ul>
        {figure.firstClassUses.map((u) => (
          <li
            key={u.parentId}
            className={`inline-block m-4 ${
              !u.parent.isPriority ? "bg-slate-200" : ""
            }`}
          >
            <FigurePopoverBadge
              id={u.parent.id}
              badgeProps={getBadgeProps(u.parent)}
            />
            <br />
            {u.parent.activeSoundMarkId === figure.id
              ? getReadingMatchingSoundMark(u)
              : null}
            <br />
            <FigureKeywordDisplay figure={u.parent} />
            <br />
          </li>
        ))}
      </ul>
    </section>
  );
}

export const kvgAttributes = {
  ["xlmns"]: "http://www.w3.org/2000/svg",
  viewBox: "-20 -20 149 149",
  style: {
    fill: "none",
    stroke: "black",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "7em",
    height: "7em",
  },
} as const;
function getHeadingsMeanings(
  figure: DictionaryPageFigureWithPriorityUses,
  primaryVariantFigure: StandaloneCharacterQueryFigure,
): HeadingMeanings {
  const mnemonicKeyword = figure.mnemonicKeyword;
  const [, mnemonicKeywordText, , referenceTypeText, reference] =
    mnemonicKeyword?.match(/^(.+?)( \{\{(cf\.|via) (.)}})?$/) ?? [];

  const componentMnemonic: HeadingComponentMnemonic | null = mnemonicKeywordText
    ? {
        text: mnemonicKeywordText,
        reference: reference || null,
        referenceTypeText:
          (referenceTypeText as HeadingComponentMnemonic["referenceTypeText"]) ||
          null,
      }
    : null;

  const isStandaloneCharacterVariant =
    isStandaloneCharacter(primaryVariantFigure);

  if (isStandaloneCharacterVariant) {
    const currentCharacterMeanings: string[] = [];
    currentCharacterMeanings.push(figure.keyword);
    if (figure.meaning?.kanjidicEnglish?.length)
      currentCharacterMeanings.push(
        ...figure.meaning.kanjidicEnglish.filter((m) => m !== figure.keyword),
      );
    if (!currentCharacterMeanings.length && figure.meaning?.unihanDefinition)
      currentCharacterMeanings.push(figure.meaning.unihanDefinition);

    return {
      currentCharacter: currentCharacterMeanings,
      componentMnemonic,
    };
  }

  const characterMeanings: string[] = [];
  characterMeanings.push(figure.keyword);
  if (figure.meaning?.kanjidicEnglish?.length)
    characterMeanings.push(
      ...figure.meaning.kanjidicEnglish.filter((m) => m !== figure.keyword),
    );
  if (!characterMeanings.length && figure.meaning?.unihanDefinition)
    characterMeanings.push(figure.meaning.unihanDefinition);

  return {
    componentMnemonic: componentMnemonic || {
      text: figure.keyword,
      reference: null,
      referenceTypeText: null,
    },
    obsoleteCharacter: characterMeanings,
  };
}

type HeadingMeanings =
  | {
      currentCharacter: string[];
      componentMnemonic: HeadingComponentMnemonic | null;
      obsoleteCharacter?: null;
    }
  | {
      componentMnemonic: HeadingComponentMnemonic;
      obsoleteCharacter: string[] | null;
      currentCharacter?: null;
    };

interface HeadingComponentMnemonic {
  text: string;
  reference?: string | null;
  referenceTypeText?: "cf." | "via" | null;
}

function FigureKeywordDisplay({
  figure,
}: {
  figure: Pick<
    KanjisenseFigure,
    "keyword" | "mnemonicKeyword" | "listsAsCharacter"
  > &
    IsPriorityComponentQueryFigure &
    StandaloneCharacterVariantQueryFigure;
}) {
  if (!figure.mnemonicKeyword) return <>{figure.keyword}</>;

  if (figure.mnemonicKeyword === figure.keyword)
    return <>&quot;{figure.keyword}&quot;</>;

  const mnemonicKeywordWithoutReference =
    figure.mnemonicKeyword.split(" {{")[0];
  if (isStandaloneCharacterVariant(figure))
    return (
      <>
        {figure.keyword} &quot;{mnemonicKeywordWithoutReference}&quot;
      </>
    );

  return <>&quot;{mnemonicKeywordWithoutReference}&quot;</>;
}
