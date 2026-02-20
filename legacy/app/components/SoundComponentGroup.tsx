import { useState } from "react";

import { DictLink } from "~/components/AppLink";
import { FigureBadgeLink } from "~/components/FigureBadgeLink";
import { abbreviateTranscriptions } from "~/features/dictionary/abbreviateTranscriptions";
import { BadgeProps } from "~/features/dictionary/badgeFigure";
import {
  parseActiveSoundMarkValue,
  transcribeSerializedXiaoyunProfile,
} from "~/features/dictionary/getActiveSoundMarkValueText";
import type { SoundComponentForDisplay } from "~/routes/browse.sound-components";

const MAX_BEFORE_HIDE = 15;

export function SoundComponentGroup({
  groupMemberUsesCount,
  figures,
}: {
  groupMemberUsesCount: number;
  figures: {
    badge: BadgeProps;
    readings: {
      selectedOnReadings: string[];
      kanjidicEntry: { onReadings: string[] } | null;
      sbgyXiaoyuns: {
        sbgyXiaoyun: {
          xiaoyun: number;
          exemplars: string[];
          fanqie: string;
          initial: string;
          cycleHead: string;
          tone: string;
          kaihe: string | null;
          note: string | null;
          dengOrChongniu: string | null;
        };
      }[];
    } | null;
    values: string[];
    uses: string[];
    usesCount: number;
  }[];
}) {
  const figuresCount = figures.length;
  const expandable = figuresCount > MAX_BEFORE_HIDE;
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex flex-col">
      <h2 className="m-4 basis-full text-center text-lg">
        Seen in {groupMemberUsesCount} or more places
      </h2>
      <div className="a">
        {(expandable && !isExpanded
          ? figures.slice(0, MAX_BEFORE_HIDE)
          : figures
        ).map(({ badge, values, uses }: SoundComponentForDisplay) => {
          const parsedValues = values.map((v) => parseActiveSoundMarkValue(v));
          return (
            <div
              className="m-1 inline-flex flex-row gap-2 align-top"
              key={badge.key}
            >
              <FigureBadgeLink figureKey={badge.key} badgeProps={badge} />
              <div className="flex flex-col">
                <div>
                  {parsedValues.map((v, i) => (
                    <span key={i}>
                      {v.katakana}{" "}
                      {v.xiaoyunsByMatchingType
                        ? abbreviateTranscriptions(
                            Array.from(
                              new Set(
                                Object.values(v.xiaoyunsByMatchingType).flatMap(
                                  (xs) => xs.map((x) => x.profile),
                                ),
                              ),
                              (p) => transcribeSerializedXiaoyunProfile(p),
                            ),
                          )
                        : null}
                    </span>
                  ))}
                </div>

                <div className=" max-w-[10rem] text-lg">
                  {uses.map((u) => (
                    <span key={u}>
                      <DictLink
                        figureKey={u}
                        className=" no-underline hover:underline"
                      >
                        {u}
                      </DictLink>{" "}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        {expandable ? (
          <button
            className="m-4 rounded bg-blue-100 px-4 py-2 text-black hover:bg-blue-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Show less</>
            ) : (
              <>Show {figuresCount - MAX_BEFORE_HIDE} more components</>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
