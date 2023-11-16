import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";

import { getParentReadingMatchingSoundMark } from "./getParentReadingMatchingSoundMark";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { FigureKeywordDisplay } from "./SingleFigureDictionaryEntry";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

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
          const parentReading = u.parent.reading;
          const parentReadingMatchingSoundMark = figureIsSoundMarkUse
            ? getParentReadingMatchingSoundMark(
                u.parent.activeSoundMarkValue,
                componentFigure.reading,
                parentReading,
              )
            : null;

          return (
            <li
              key={u.parentId}
              className={`inline-block m-4 align-top ${
                !u.parent.isPriority ? "bg-slate-200" : ""
              }`}
            >
              <FigurePopoverBadge
                className="block"
                id={u.parent.id}
                badgeProps={getBadgeProps(u.parent)}
                width={5}
              />

              <span>
                <FigureKeywordDisplay figure={u.parent} />
              </span>
              <br />
              {parentReadingMatchingSoundMark ? (
                <OnAndGuangyunReadings
                  katakanaOn={parentReadingMatchingSoundMark.katakanaOn}
                  guangyun={parentReadingMatchingSoundMark.guangyun}
                  hasSoundMarkHighlight
                />
              ) : (
                <OnAndGuangyunReadings
                  katakanaOn={
                    parentReading?.selectedOnReadings?.[0] ||
                    parentReading?.kanjidicEntry?.onReadings?.[0] ||
                    null
                  }
                  guangyun={
                    parentReading?.sbgyXiaoyuns?.length
                      ? transcribeSbgyXiaoyun(
                          parentReading.sbgyXiaoyuns[0].sbgyXiaoyun,
                        )
                      : null
                  }
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
