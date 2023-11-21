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

import {
  parseActiveSoundMarkValue,
  transcribeSerializedXiaoyunProfile,
} from "./getActiveSoundMarkValueText";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { FigureKeywordDisplay } from "./SingleFigureDictionaryEntry";

export function DictionaryEntryComponentsTree({
  figure,
  className,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
  className?: string;
}) {
  return (
    <section
      className={`${className} flex flex-row flex-wrap gap-4 justify-evenly`}
    >
      {figure.firstClassComponents
        .sort((a, b) => a.indexInTree - b.indexInTree)
        .map(({ componentId, component }) => {
          return (
            <DictionaryEntryComponentsTreeMember
              key={componentId}
              parentFigure={figure}
              componentFigure={component}
            />
          );
        })}
    </section>
  );
}

function DictionaryEntryComponentsTreeMember({
  parentFigure,
  componentFigure,
}: {
  parentFigure: ComponentsTreeMemberFigure;
  componentFigure: ComponentsTreeMemberFigure;
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
    <div>
      <FigurePopoverBadge
        id={componentFigure.id}
        badgeProps={getBadgeProps(componentFigure)}
        width={6}
      />
      <FigureKeywordDisplay figure={componentFigure} />
      <br />
      {parentActiveSoundMark ? (
        <OnAndGuangyunReadings
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
      {componentFigure.firstClassComponents.length && !isExpanded ? (
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
      {componentFigure.firstClassComponents.length && isExpanded ? (
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
