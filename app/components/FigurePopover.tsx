import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import { PropsWithChildren, useEffect, createElement, useState } from "react";
import { createPortal } from "react-dom";

import { BadgeProps, getBadgeProps } from "~/features/dictionary/badgeFigure";
import { DictionaryHeadingMeanings } from "~/features/dictionary/DictionaryHeadingMeanings";
import { FigureKeywordDisplay } from "~/features/dictionary/FigureKeywordDisplay";
import { FigureTags } from "~/features/dictionary/FigureTags";
import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";
import { PopoverFigure } from "~/features/dictionary/PopoverFigure";


import { DictLink } from "./AppLink";
import { FigureBadge } from "./FigureBadge";
import popoverFadeinStyles from "./popoverFadeIn.module.css";
import { usePaddedPopper } from "./usePaddedPopper";

export function FigurePopoverBadge({
  badgeProps,
  className = "",
  width,
}: {
  badgeProps: BadgeProps;
  className?: string;
  width?: number;
}) {
  return (
    <FigurePopover badgeProps={badgeProps} className={`${className}`}>
      <FigureBadge badgeProps={badgeProps} width={width} />
    </FigurePopover>
  );
}

export function FigurePopover({
  badgeProps: initialBadgeProps,
  children,
  className,
}: PropsWithChildren<{
  badgeProps: BadgeProps;
  className?: string;
}>) {
  const figureId = initialBadgeProps.id;
  const figurePopover = useFigurePopover({
    className,
    initialBadgeProps,
  });
  const { getAnchorAttributes, popper } = figurePopover;

  const anchorAttributes = getAnchorAttributes(initialBadgeProps);
  return createElement(
    "a",
    {
      ...anchorAttributes,
      onClick: (e) => {
        e.preventDefault();
        anchorAttributes.onClick();
      },
      href: `/dict/${figureId}`,
    },
    children,
    popper.isOpen
      ? createPortal(
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <FigurePopoverWindow {...figurePopover} />,
          document.getElementById("overlay") || document.body,
        )
      : null,
  );
}

export function useFigurePopover({
  initialBadgeProps,
  className = "",
}: {
  initialBadgeProps?: BadgeProps | null;
  className?: string;
} = {}) {
  const popper = usePaddedPopper();
  const { setReferenceElement, isOpen, open, close, update } = popper;

  const { fetcher, loadFigure } = usePopoverFigureFetcher();

  const figure = fetcher.data?.figure;
  const badgeProps = figure ? getBadgeProps(figure) : initialBadgeProps;

  const [loadingBadgeProps, setLoadingBadgeProps] = useState(badgeProps);

  useEffect(() => {
    if (figure?.id) {
      console.log(`New figure loaded: ${figure.id}`, { update });
      update?.();
    }
  }, [figure?.id]);

  const popperFigureId = figure?.id || badgeProps?.id;
  const getAnchorAttributes = (badgeProps?: BadgeProps | null) => ({
    className: `${className}`,
    ref: setReferenceElement,
    onClick: () => {
      if (!badgeProps) {
        console.warn(`No badge props for figure ${popperFigureId}`);
        return;
      }
      if (isOpen) {
        close();
        setLoadingBadgeProps(badgeProps);
        loadFigure(badgeProps.id);
      } else {
        setLoadingBadgeProps(badgeProps);
        loadFigure(badgeProps.id);

        open();
      }
    },
  });

  return {
    figure,
    loadFigure,
    fetcher,
    badgeProps:
      fetcher.state === "loading" && loadingBadgeProps
        ? loadingBadgeProps
        : badgeProps,
    popperFigureId,
    getAnchorAttributes,
    popper,
  };
}

export function FigurePopoverWindow({
  badgeProps,
  loadFigure,
  figure,
  popper,
  fetcher,
}: {
  badgeProps?: BadgeProps | null;
  loadFigure: (figureToFetchId: string) => void;
  figure: PopoverFigure | undefined;
  popper: ReturnType<typeof usePaddedPopper>;
  fetcher: ReturnType<typeof usePopoverFigureFetcher>["fetcher"];
}) {
  const firstClassComponents = figure?.firstClassComponents;
  const headingsMeanings = figure ? getHeadingsMeanings(figure) : null;

  const { setPopperElement, attributes, styles, handleClickPopper } = popper;
  const loading = fetcher.state === "loading";

  if (!badgeProps || !popper.isOpen) return null;
  const popperFigureId = badgeProps.id;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={clsx(
        `[border:2px inset #afafaf33] pointer-events-auto max-w-xl bg-gray-50/90 p-3 shadow-xl shadow-black/30 backdrop-blur-sm  [border-radius:0.3em] [box-sizing:border-box] [max-height:88v]  [overflow-y:auto]`,
      )}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      onClick={handleClickPopper}
    >
      <div
        className={clsx(
          popoverFadeinStyles.fadeIn,
          "flex flex-row flex-wrap items-center  gap-4",
        )}
      >
        <DictLink figureId={popperFigureId} focusOnLoad className="">
          <FigureBadge badgeProps={badgeProps} width={6} />
        </DictLink>
        {loading ? (
          <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-300 p-4"></div>
        ) : null}
        {!loading && firstClassComponents?.length ? (
          <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-300 p-4">
            {firstClassComponents.map((c, i) => (
              <div
                key={c.component.id + String(i)}
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

        {!loading && figure && headingsMeanings ? (
          <DictionaryHeadingMeanings
            headingsMeanings={headingsMeanings}
            className={clsx(
              "grid basis-0 grid-flow-col gap-4 text-lg [grid-template-columns:1fr_auto]",
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
          isAtomic={
            figure?.isPriority
              ? figure.firstClassComponents.length === 0
              : false
          }
        />
      </div>
    </div>
  );
}

export function usePopoverFigureFetcher() {
  const fetcher = useFetcher<{ figure: PopoverFigure }>();

  return {
    fetcher,

    loadFigure(figureToFetchId: string) {
      if (
        (!fetcher.data || fetcher.data.figure?.id !== figureToFetchId) &&
        fetcher.state === "idle"
      )
        fetcher.load(`/dict/${figureToFetchId}/preview`);
    },
  };
}
