import { KanjisenseFigure } from "@prisma/client";
import { FigureBadge } from "~/components/FigureBadge";
import { FigurePopover, FigurePopoverBadge } from "~/components/FigurePopover";
import {
  getBadgeProps,
  isPriorityComponent,
  isPrioritySoundMark,
  isStandaloneCharacter,
} from "~/features/dictionary/displayFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  displayActiveSoundMark,
  getReadingMatchingSoundMark,
} from "~/features/dictionary/getReadingMatchingSoundMark";
import { KvgJsonData } from "~/features/dictionary/KvgJsonData";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

export function SingleFigureDictionaryEntry({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  return (
    <section className={`${figure.isPriority ? "" : "bg-gray-200"}`}>
      <h1>
        {figure.id} {figure.keyword} {figure.mnemonicKeyword}
      </h1>

      <h1>
        {" "}
        <FigureBadge
          id={figure.id}
          badgeProps={getBadgeProps(figure)}
          width={10}
        />
      </h1>
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
  xlmns: "http://www.w3.org/2000/svg",
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
function FigureKeywordDisplay({
  figure,
}: {
  figure: Pick<
    KanjisenseFigure,
    "keyword" | "mnemonicKeyword" | "listsAsCharacter"
  >;
}) {
  if (!figure.mnemonicKeyword) return <>{figure.keyword}</>;

  if (figure.mnemonicKeyword === figure.keyword)
    return <>&quot;{figure.keyword}&quot;</>;

  const mnemonicKeywordWithoutReference =
    figure.mnemonicKeyword.split(" {{")[0];
  if (figure.listsAsCharacter.length)
    return (
      <>
        {figure.keyword} &quot;{mnemonicKeywordWithoutReference}&quot;
      </>
    );

  return <>{mnemonicKeywordWithoutReference}</>;
}
