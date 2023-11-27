import { useFetcher } from "@remix-run/react";

import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { FigurePriorityUsesLoaderData } from "~/routes/dict.$figureId.uses";

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
  const {
    fetcher: { data: fetcherData },
    getFigurePriorityUses,
  } = useComponentUsesFetcher(componentFigure.id);

  if (!priorityUses.length) return null;

  return (
    <section className={`${className} flex flex-wrap flex-row gap-4 `}>
      <h2 className=" text-gray-600 ml-4 basis-full">
        used as a component in:
      </h2>
      <ul className="flex flex-row flex-wrap gap-4">
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
              className={`inline-block align-top ${
                !u.parent.isPriority ? "bg-slate-200" : ""
              }`}
            >
              <FigurePopoverBadge
                className="block"
                id={u.parent.id}
                badgeProps={getBadgeProps(u.parent)}
                width={5}
              />

              <div className="[max-width:10rem]">
                <FigureKeywordDisplay figure={u.parent} />
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
                />
              )}
            </li>
          );
        })}
        {!fetcherData?.firstClassUses && count > PRELOADED_USES_COUNT ? (
          <li
            className="inline-block m-4 align-top"
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
