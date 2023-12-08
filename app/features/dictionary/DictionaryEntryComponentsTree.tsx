import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";
import {
  ComponentsTreeMemberFigure,
  FigureComponentsAnalysisLoaderData,
} from "~/routes/dict.$figureId.analyze";

import { FigureKeywordDisplay } from "./FigureKeywordDisplay";
import {
  parseActiveSoundMarkValue,
  transcribeSerializedXiaoyunProfile,
} from "./getActiveSoundMarkValueText";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";

export function DictionaryEntryComponentsTree({
  figure,
  className,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
  className?: string;
}) {
  const size = figure.firstClassComponents.length <= 4 ? "large" : "small";
  return (
    <section
      className={`${className} flex flex-row flex-wrap justify-evenly gap-4`}
    >
      {figure.firstClassComponents
        .sort((a, b) => a.indexInTree - b.indexInTree)
        .map(({ componentId, component }) => {
          return (
            <DictionaryEntryComponentsTreeMember
              key={componentId}
              parentFigure={figure}
              componentFigure={component}
              size={size}
            />
          );
        })}
    </section>
  );
}

type Size = "small" | "large";

function DictionaryEntryComponentsTreeMember({
  parentFigure,
  componentFigure,
  expandable = false,
  size,
}: {
  parentFigure: ComponentsTreeMemberFigure;
  componentFigure: ComponentsTreeMemberFigure;
  expandable?: boolean;
  size: Size;
}) {
  const { analyzeFigure, fetcher } = useAnalyzeFigureFetcher(
    componentFigure.id,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const figureIsSoundMarkUse =
    parentFigure.activeSoundMarkId === componentFigure.id;
  const parentActiveSoundMark =
    figureIsSoundMarkUse && parentFigure.activeSoundMarkValue
      ? parseActiveSoundMarkValue(parentFigure.activeSoundMarkValue)
      : null;
  return (
    <div className="relative flex flex-col">
      <FigurePopoverBadge
        badgeProps={getBadgeProps(componentFigure)}
        width={size === "large" ? 6 : 5}
        className="mx-auto "
      />
      <div className="mb-1 mt-2 inline-flex flex-col items-center [max-width:10rem]">
        <div>
          <FigureKeywordDisplay figure={componentFigure} />
        </div>
      </div>
      {parentActiveSoundMark ? (
        <OnAndGuangyunReadings
          className="block text-center"
          katakanaOn={parentActiveSoundMark.katakana}
          guangyun={
            parentActiveSoundMark.xiaoyunsByMatchingType
              ? transcribeSoundMarkReading(
                  parentActiveSoundMark.xiaoyunsByMatchingType,
                )
              : null
          }
        />
      ) : null}
      {expandable &&
      componentFigure.firstClassComponents.length &&
      !isExpanded ? (
        <div>
          <button
            onClick={() => {
              setIsExpanded((expanded) => !expanded);
              if (fetcher.state === "idle") analyzeFigure();
            }}
          >
            expand
          </button>
        </div>
      ) : null}
      {expandable &&
      componentFigure.firstClassComponents.length &&
      isExpanded ? (
        <div>
          <button
            onClick={() => {
              setIsExpanded((expanded) => !expanded);
            }}
          >
            collapse
          </button>
          {fetcher.data?.figure?.firstClassComponents.map((c) => (
            <DictionaryEntryComponentsTreeMember
              key={c.component.id}
              parentFigure={parentFigure}
              componentFigure={c.component}
              size={size}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const SOUND_MARK_TYPE_PRIORITY: InferredOnyomiType[] = [
  InferredOnyomiType.AttestedKan,
  InferredOnyomiType.AttestedGo,
  InferredOnyomiType.AttestedKanRare,
  InferredOnyomiType.AttestedGoRare,
  InferredOnyomiType.SpeculatedKan,
  InferredOnyomiType.SpeculatedGo,
];
function transcribeSoundMarkReading(
  xiaoyunsByMatchingType: OnReadingToTypeToXiaoyuns[string],
) {
  for (const type of SOUND_MARK_TYPE_PRIORITY) {
    const xiaoyuns = xiaoyunsByMatchingType[type];
    if (xiaoyuns?.length) {
      return transcribeSerializedXiaoyunProfile(xiaoyuns[0].profile);
    }
  }
  return null;
}

export function useAnalyzeFigureFetcher(figureId: string) {
  const fetcher = useFetcher<FigureComponentsAnalysisLoaderData>();

  return {
    fetcher,

    analyzeFigure() {
      if (
        (!fetcher.data || fetcher.data.figure?.id !== figureId) &&
        fetcher.state === "idle"
      )
        fetcher.load(`/dict/${figureId}/analyze`);
    },
  };
}
