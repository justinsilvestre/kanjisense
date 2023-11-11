import {
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
        hiiiiii!!!
        {figure.id} {figure.keyword} {figure.mnemonicKeyword}
      </h1>

      <h1>
        <FigureSvg figure={figure} />
      </h1>
      <h2>
        {figure.firstClassComponents.map((c) => (
          <span key={c.indexInTree}>
            {c.component.id}{" "}
            {c.parent.activeSoundMarkId === c.component.id
              ? displayActiveSoundMark(c)
              : ""}{" "}
            {c.component.keyword}{" "}
            {c.component.mnemonicKeyword
              ? `"${c.component.mnemonicKeyword}"`
              : ""}
          </span>
        ))}
      </h2>

      <h2>{figure.reading?.kanjidicEntry?.onReadings?.join(" ")}</h2>
      <h2>{figure.reading?.kanjidicEntry?.kunReadings?.join(" ")}</h2>
      <h2>
        {figure.reading?.sbgyXiaoyuns
          ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
          ?.join(" ")}
      </h2>

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
            <span className={` text-2xl`}>{u.parent.id}</span>
            <br />
            {isStandaloneCharacter(u.parent) ? "字" : ""}
            {u.parent.asComponent ? "⚙️" : ""}
            <br />
            {u.parent.activeSoundMarkId === figure.id
              ? getReadingMatchingSoundMark(u)
              : null}
            <br />
            {u.parent.keyword} {u.parent.mnemonicKeyword}
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
function FigureSvg({
  figure,
  strokeWidth = kvgAttributes.style.strokeWidth,
  stroke = kvgAttributes.style.stroke,
}: {
  figure: Pick<DictionaryPageFigureWithPriorityUses, "KvgJson" | "id">;
  strokeWidth?: number;
  stroke?: string;
}) {
  if (figure.KvgJson) {
    const kvgJson = figure.KvgJson.json as unknown as KvgJsonData;
    return (
      <svg
        {...kvgAttributes}
        style={{ ...kvgAttributes.style, strokeWidth, stroke }}
      >
        {kvgJson.p.map((d, i) => (
          <path d={d} key={i} />
        ))}
        <text
          x="-10"
          y="100"
          className="fill-transparent stroke-transparent text-transparent "
        >
          {figure.id}
        </text>
      </svg>
    );
  }
}
