import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import { PropsWithChildren, useEffect, createElement } from "react";
import { createPortal } from "react-dom";

import {
  BadgeProps,
  getBadgeProps,
  isPrioritySoundMark,
} from "~/features/dictionary/badgeFigure";
import { DictionaryHeadingMeanings } from "~/features/dictionary/DictionaryHeadingMeanings";
import { FigureKeywordDisplay } from "~/features/dictionary/FigureKeywordDisplay";
import { FigureTags } from "~/features/dictionary/FigureTags";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { PopoverFigure } from "~/features/dictionary/PopoverFigure";

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

  const headingsMeanings = figure ? getHeadingsMeanings(figure) : null;
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
          className={`[border:2px inset #afafaf33] pointer-events-auto max-w-xl p-3 shadow-xl shadow-gray-400 transition-opacity duration-300 [background-color:rgba(247,247,247,0.95)] [border-radius:0.3em] [box-sizing:border-box] [max-height:88v]  [overflow-y:auto]`}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          onClick={handleClickPopper}
        >
          <div className="flex flex-row flex-wrap items-center  gap-4">
            <DictLink figureId={figure?.id || figureId} focusOnLoad>
              <FigureBadge
                id={figure?.id || figureId}
                badgeProps={badgeProps}
                width={6}
              />
            </DictLink>
            {figure?.firstClassComponents.length ? (
              <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-200 p-4">
                {figure.firstClassComponents.map((c) => (
                  <div
                    key={c.component.id}
                    className="inline-flex cursor-pointer items-center"
                    onClick={() => loadFigure(c.component.id)}
                    role="button"
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
                      width={3}
                      className="mr-4 align-middle"
                    />
                    <span className="i align-middle">
                      <FigureKeywordDisplay figure={c.component} />
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {figure && headingsMeanings ? (
              <DictionaryHeadingMeanings
                headingsMeanings={headingsMeanings}
                className={clsx(
                  "grid grid-flow-col gap-4 text-lg [grid-template-columns:1fr_auto]",
                  {
                    "basis-full": figure.firstClassComponents?.length != 0,
                    "flex-grow items-center self-stretch rounded-md border-2 border-gray-200 p-4 ":
                      figure.firstClassComponents?.length === 0,
                    "text-center":
                      (figure.firstClassComponents?.length === 0 &&
                        !headingsMeanings.componentMnemonic) ||
                      (headingsMeanings.componentMnemonic &&
                        !headingsMeanings.currentCharacter),
                  },
                )}
              />
            ) : null}
            <FigureTags
              className="basis-full"
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
  const fetcher = useFetcher<{ figure: PopoverFigure }>();

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
