import { useFetcher } from "@remix-run/react";
import { PropsWithChildren, useEffect, createElement } from "react";
import { createPortal } from "react-dom";

import {
  BadgeProps,
  getBadgeProps,
  isPrioritySoundMark,
} from "~/features/dictionary/badgeFigure";
import { DictionaryHeadingMeanings } from "~/features/dictionary/DictionaryHeadingMeanings";
import { FigureTags } from "~/features/dictionary/FigureTags";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { FigureKeywordDisplay } from "~/features/dictionary/SingleFigureDictionaryEntry";
import type { DictPreviewLoaderData } from "~/routes/dict.$figureId.preview";

import { DictLink } from "./AppLink";
import { FigureBadge } from "./FigureBadge";
import { usePaddedPopper } from "./usePaddedPopper";

export function FigurePopoverBadge({
  id,
  badgeProps,
  className = "",
  width,
}: {
  id: string;
  badgeProps: BadgeProps;
  className?: string;
  width?: number;
}) {
  return (
    <FigurePopover
      figureId={id}
      badgeProps={badgeProps}
      className={`${className}`}
    >
      <FigureBadge id={id} badgeProps={badgeProps} width={width} />
    </FigurePopover>
  );
}

export function FigurePopover({
  figureId,
  badgeProps: initialBadgeProps,
  children,
  element = "div",
  className = "",
}: PropsWithChildren<{
  figureId: string;
  badgeProps: BadgeProps;
  className?: string;
  element?: "div" | "span";
}>) {
  const popper = usePaddedPopper();
  const {
    setReferenceElement,
    setPopperElement,
    attributes,
    styles,
    isOpen,
    open,
    close,
    update,
    handleClickPopper,
  } = popper;

  const { fetcher, loadFigure } = usePopoverFigureFetcher(figureId);

  const figure = fetcher.data?.figure;
  const badgeProps = figure ? getBadgeProps(figure) : initialBadgeProps;

  useEffect(() => {
    if (figure?.id) {
      console.log(`New figure loaded: ${figure.id}`, { update });
      update?.();
    }
  }, [figure?.id, update]);

  return createElement(
    element,
    {
      className: `${className}`,
      ref: setReferenceElement,
      onClick: () => {
        if (isOpen) {
          close();
          loadFigure(figureId);
        } else {
          loadFigure();

          open();
        }
      },
      tabIndex: 0,
      role: "contentinfo",
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          loadFigure();

          open();
        }
      },
      style: {
        cursor: "pointer",
      },
    },
    children,
    isOpen &&
      createPortal(
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={`pointer-events-auto [min-height:12rem] [border:2px inset #afafaf33] p-3 shadow-xl shadow-gray-400 transition-opacity duration-300 [width:40v] [min-width:17rem] [max-width:95v] [max-height:88v]  [background-color:rgba(247,247,247,0.95)] [border-radius:0.3em] [box-sizing:border-box]  [overflow-y:auto] md:max-w-xl`}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          onClick={handleClickPopper}
        >
          <div className="">
            <DictLink figureId={figure?.id || figureId} focusOnLoad>
              <FigureBadge
                id={figure?.id || figureId}
                badgeProps={badgeProps}
                width={6}
              />
            </DictLink>
            {figure?.firstClassComponents.map((c) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={c.component.id}
                className="cursor-pointer inline-block m-1"
                onClick={() => loadFigure(c.component.id)}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    loadFigure(c.component.id);
                  }
                }}
              >
                <FigureBadge
                  id={c.component.id}
                  badgeProps={getBadgeProps(c.component)}
                  width={2.5}
                  className="mr-1"
                />
                <FigureKeywordDisplay figure={c.component} />
              </div>
            ))}
          </div>

          <div>
            {figure ? (
              <DictionaryHeadingMeanings
                headingsMeanings={getHeadingsMeanings(figure)}
                className="flex-row"
              />
            ) : null}

            <br />
            <FigureTags
              badgeProps={badgeProps}
              isSoundMark={figure ? isPrioritySoundMark(figure) : false}
              isAtomic={
                figure?.isPriority
                  ? figure.firstClassComponents.length === 0
                  : false
              }
            />
          </div>
        </div>,
        document.getElementById("overlay") || document.body,
      ),
  );
}

export function usePopoverFigureFetcher(figureId: string) {
  const fetcher = useFetcher<DictPreviewLoaderData>();

  return {
    fetcher,

    loadFigure(figureToFetchId: string = figureId) {
      if (
        (!fetcher.data || fetcher.data.figure?.id !== figureToFetchId) &&
        fetcher.state === "idle"
      )
        fetcher.load(`/dict/${figureToFetchId}/preview`);
    },
  };
}
