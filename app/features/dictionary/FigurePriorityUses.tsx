import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";

import { getParentReadingMatchingSoundMark } from "./getParentReadingMatchingSoundMark";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { FigureKeywordDisplay } from "./SingleFigureDictionaryEntry";

export function FigurePriorityUses({
  componentFigure,
  priorityUses,
}: {
  componentFigure: DictionaryPageFigureWithPriorityUses;
  priorityUses: DictionaryPageFigureWithPriorityUses["firstClassUses"];
}) {
  if (!priorityUses.length) return null;

  return (
    <>
      <h2>used as a component in {priorityUses.length} priority figures</h2>

      <ul>
        {priorityUses.map((u) => {
          const figureIsSoundMarkUse =
            u.parent.activeSoundMarkId === componentFigure.id;
          const parentReadingMatchingSoundMark = figureIsSoundMarkUse
            ? getParentReadingMatchingSoundMark(
                u.parent.activeSoundMarkValue,
                componentFigure.reading,
                u.parent.reading,
              )
            : null;
          return (
            <li
              key={u.parentId}
              className={`inline-block m-4 ${
                !u.parent.isPriority ? "bg-slate-200" : ""
              }`}
            >
              <FigurePopoverBadge
                className="block"
                id={u.parent.id}
                badgeProps={getBadgeProps(u.parent)}
                width={5}
              />
              <OnAndGuangyunReadings
                parentReadingMatchingSoundMark={parentReadingMatchingSoundMark}
                reading={u.parent.reading}
              />
              <br />
              <FigureKeywordDisplay figure={u.parent} />
              <br />
            </li>
          );
        })}
      </ul>
    </>
  );
}
