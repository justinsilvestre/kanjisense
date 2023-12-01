import { useFetcher } from "@remix-run/react";

import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { FigurePriorityUsesLoaderData } from "~/routes/dict.$figureId.uses";

import { FigureKeywordDisplay } from "./FigureKeywordDisplay";
import { getParentReadingMatchingSoundMark } from "./getParentReadingMatchingSoundMark";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { PRELOADED_USES_COUNT } from "./PRELOADED_USES_COUNT";
import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

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
  const {
    fetcher: { data: fetcherData },
    getFigurePriorityUses,
  } = useComponentUsesFetcher(componentFigure.id);

  if (!priorityUses.length) return null;

  return (
    <section
      className={`${className} flex flex-row flex-wrap gap-4 p-8 max-sm:p-4 `}
    >
      <h2 className=" basis-full text-gray-600">used as a component in:</h2>
      <ul className="flex basis-full flex-row flex-wrap justify-between gap-4 max-sm:gap-1">
        {priorityUses.concat(fetcherData?.firstClassUses || []).map((u) => {
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
              className={`group align-top [flex-basis:6rem] ${
                !u.parent.isPriority ? "bg-slate-200" : ""
              }`}
            >
              <FigurePopoverBadge
                className="block"
                id={u.parent.id}
                badgeProps={getBadgeProps(u.parent)}
                width={5}
              />

              <div className="relative [height:1.5em] [width:5.5rem] ">
                <div className='overflow-hidden whitespace-nowrap [text-overflow:"…"]  [width:6.25rem]  group-hover:absolute group-hover:z-50  group-hover:overflow-visible  group-hover:whitespace-normal group-hover:[width:8rem] '>
                  <span className="group-hover:bg-white group-hover:outline group-hover:outline-neutral-100">
                    <FigureKeywordDisplay figure={u.parent} />
                    &nbsp;
                  </span>
                </div>
              </div>
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
                  hasSoundMarkHighlight={figureIsSoundMarkUse}
                />
              )}
            </li>
          );
        })}

        {!fetcherData?.firstClassUses && count > PRELOADED_USES_COUNT ? (
          <li
            className="flex-grow pb-10 [flex-basis:6rem] [height:5rem]"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            role="button"
            onClick={() => getFigurePriorityUses()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                getFigurePriorityUses();
              }
            }}
          >
            + <strong>{count - PRELOADED_USES_COUNT}</strong> more
          </li>
        ) : (
          <li className="flex-grow [flex-basis:6rem]"> </li>
        )}
      </ul>
    </section>
  );
}

function useComponentUsesFetcher(figureId: string) {
  const fetcher = useFetcher<FigurePriorityUsesLoaderData>();
  return {
    fetcher,
    getFigurePriorityUses() {
      if (
        fetcher.state === "idle" ||
        (fetcher.data && fetcher.data.id !== figureId)
      ) {
        fetcher.load(`/dict/${figureId}/uses`);
      }
    },
  };
}
