import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import { FigurePopoverBadge } from "~/components/FigurePopover";
import { getBadgeProps } from "~/features/dictionary/badgeFigure";
import { ComponentUseJson } from "~/features/dictionary/ComponentUse";
import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import {
  ComponentsTreeMemberFigure,
  FigureComponentsAnalysisLoaderData,
} from "~/routes/dict.$figureId.analyze";

import { getParentReadingMatchingSoundMark } from "./getParentReadingMatchingSoundMark";
import { OnAndGuangyunReadings } from "./OnAndGuangyunReadings";
import { FigureKeywordDisplay } from "./SingleFigureDictionaryEntry";

export function DictionaryEntryComponentsTree({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  const componentsTree = figure.componentsTree as ComponentUseJson[] | null;
  if (!componentsTree) return null;
  const firstClassComponents = new Map(
    figure.firstClassComponents.map((c) => [c.componentId, c.component]),
  );

  return (
    <section>
      {componentsTree.map(([, componentId]) => {
        if (!firstClassComponents.has(componentId)) return null;
        return (
          <DictionaryEntryComponentsTreeMember
            key={componentId}
            parentFigure={figure}
            componentFigure={firstClassComponents.get(componentId)!}
          />
        );
      })}
    </section>
  );
}
// type ComponentTreeMemberFigure = Pick<DictionaryPageFigureWithPriorityUses["firstClassComponents"][0]["component"], "id" | "keyword" | "mnemonicKeyword" | "firstClassComponents" | "reading"> & BadgePropsFigure;

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
  const parentReadingMatchingSoundMark = figureIsSoundMarkUse
    ? getParentReadingMatchingSoundMark(
        parentFigure.activeSoundMarkValue,
        componentFigure.reading,
        parentFigure.reading,
      )
    : null;
  return (
    <div>
      <FigurePopoverBadge
        id={componentFigure.id}
        badgeProps={getBadgeProps(componentFigure)}
      />
      <FigureKeywordDisplay figure={componentFigure} />
      <OnAndGuangyunReadings
        parentReadingMatchingSoundMark={parentReadingMatchingSoundMark}
        reading={componentFigure.reading}
      />
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
