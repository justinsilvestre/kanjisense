import { KanjisenseFigure } from "@prisma/client";

import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopoverBadge } from "~/components/FigurePopover";
import {
  IsPriorityComponentQueryFigure,
  StandaloneCharacterVariantQueryFigure,
  getBadgeProps,
  isPriorityComponent,
  isPrioritySoundMark,
  isStandaloneCharacter,
  isStandaloneCharacterVariant,
} from "~/features/dictionary/displayFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import {
  displayActiveSoundMark,
  getReadingMatchingSoundMark,
} from "~/features/dictionary/getReadingMatchingSoundMark";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

function FirstClassUses({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  if (!figure.firstClassUses.length) return null;
  return (
    <>
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
    </>
  );
}

export function SingleFigureDictionaryEntry({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  const headingsMeanings = getHeadingsMeanings(figure);
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

      {headingsMeanings.componentHistoricalMeaning ? (
        <h1>{headingsMeanings.componentHistoricalMeaning}</h1>
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

      <FirstClassUses figure={figure}></FirstClassUses>
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

export function FigureKeywordDisplay({
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

  const mnemonicKeywordWithoutReference =
    figure.mnemonicKeyword.split(" {{")[0];

  if (figure.mnemonicKeyword === figure.keyword)
    return <>&quot;{mnemonicKeywordWithoutReference}&quot;</>;

  if (isStandaloneCharacterVariant(figure))
    return (
      <>
        {figure.keyword} &quot;{mnemonicKeywordWithoutReference}&quot;
      </>
    );

  return <>&quot;{mnemonicKeywordWithoutReference}&quot;</>;
}
