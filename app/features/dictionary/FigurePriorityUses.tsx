import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";

import { getParentReadingMatchingSoundMark } from "./getParentReadingMatchingSoundMark";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { FigureKeywordDisplay } from "./SingleFigureDictionaryEntry";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

const PRELOADED_USES_COUNT = 15;

export function FigurePriorityUses({
  componentFigure,
  priorityUses,
  count,
  className,
}: {
  componentFigure: DictionaryPageFigureWithPriorityUses;
  priorityUses: DictionaryPageFigureWithPriorityUses["firstClassUses"];
  count: number;
  className?: string;
}) {
  if (!priorityUses.length) return null;

  return (
    <section className={`${className} flex flex-row  justify-center`}>
      <div className="">
        <h2>used as a component in:</h2>

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
          {count > PRELOADED_USES_COUNT ? (
            <li className="inline-block m-4 align-top">
              and {count - PRELOADED_USES_COUNT} more{" "}
              {count - PRELOADED_USES_COUNT > 1 ? (
                <>components/characters</>
              ) : (
                <>component/character</>
              )}
              .
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
