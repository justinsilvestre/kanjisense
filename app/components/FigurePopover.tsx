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
import { DictPreviewLoaderData } from "~/routes/dict.$figureKey.preview";

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
  const figureKey = initialBadgeProps.key;
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
      href: `/dict/${figureKey}`,
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

  const { fetcher, loadFigure, badgeProps } =
    usePopoverFigureFetcher(initialBadgeProps);

  const fetchedFigure = fetcher.data?.figure;

  useEffect(() => {
    if (fetchedFigure?.key) {
      update?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedFigure?.key]);

  const popperFigureKey = fetchedFigure?.key || badgeProps?.key;
  const getAnchorAttributes = (badgeProps?: BadgeProps | null) => ({
    className: `${className}`,
    ref: setReferenceElement,
    onClick: () => {
      if (!badgeProps) {
        console.warn(`No badge props for figure ${popperFigureKey}`);
        return;
      }
      if (isOpen) {
        close();
        loadFigure(badgeProps.key);
      } else {
        loadFigure(badgeProps.key);
        open();
      }
    },
  });

  return {
    figure: fetchedFigure,
    loadFigure,
    fetcher,
    badgeProps,
    popperFigureKey,
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
  loadFigure: ReturnType<typeof usePopoverFigureFetcher>["loadFigure"];
  figure: PopoverFigure | undefined;
  popper: ReturnType<typeof usePaddedPopper>;
  fetcher: ReturnType<typeof usePopoverFigureFetcher>["fetcher"];
}) {
  const firstClassComponents = figure?.firstClassComponents;
  const headingsMeanings = figure ? getHeadingsMeanings(figure) : null;

  const { setPopperElement, attributes, styles, handleClickPopper } = popper;
  const loading = fetcher.state === "loading";

  if (!badgeProps || !popper.isOpen) return null;
  const popperFigureKey = badgeProps.key;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      onClick={handleClickPopper}
    >
      <div
        className={clsx(
          popoverFadeinStyles.fadeIn,
          `[border:2px inset #afafaf33] pointer-events-auto max-w-xl bg-gray-50/90 p-3 shadow-xl shadow-black/30  backdrop-blur-sm [border-radius:0.3em] [box-sizing:border-box]  [max-height:88v] `,
        )}
      >
        <div className={clsx("flex flex-row flex-wrap items-center  gap-4")}>
          <DictLink figureKey={popperFigureKey} focusOnLoad className="">
            <FigureBadge badgeProps={badgeProps} width={6} />
          </DictLink>
          {loading ? (
            <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-300 p-4">
              <div className="text-center">
                <p className="animate-pulse italic text-gray-900/75">
                  loading...
                </p>
              </div>
            </div>
          ) : null}
          {!loading && firstClassComponents?.length ? (
            <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-300 p-4">
              {firstClassComponents.map((c, i) => (
                <a
                  key={c.component.id + String(i)}
                  className="inline-flex cursor-pointer items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    loadFigure(c.component.key, getBadgeProps(c.component));
                  }}
                  role="button"
                  href={`/dict/${c.component.key}`}
                >
                  <FigureBadge
                    badgeProps={getBadgeProps(c.component)}
                    width={3}
                    className="mr-4 align-middle"
                  />
                  <span className="i align-middle">
                    <FigureKeywordDisplay figure={c.component} />
                  </span>
                </a>
              ))}
            </div>
          ) : null}
          {!loading && fetcher.data?.error ? (
            <div className="flex flex-grow basis-0 flex-wrap items-center justify-evenly gap-4 self-stretch rounded-md border-2 border-gray-300 p-4">
              <div className="text-center">
                <p className=" italic text-red-900/75">
                  problem loading components data
                </p>
              </div>
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
    </div>
  );
}

export function usePopoverFigureFetcher(initialBadgeProps?: BadgeProps | null) {
  const fetcher = useFetcher<DictPreviewLoaderData>();
  const [loadingBadgeProps, setLoadingBadgeProps] = useState(initialBadgeProps);

  const fetchedFigure = fetcher.data?.figure;
  const fetchedBadgeProps = fetchedFigure && getBadgeProps(fetchedFigure);
  useEffect(() => {
    if (fetchedFigure?.id) {
      console.log("fetchedFigure.id", fetchedFigure.id);
      setLoadingBadgeProps(null);
    }
  }, [fetchedFigure?.id]);

  return {
    fetcher,
    badgeProps: loadingBadgeProps || fetchedBadgeProps || initialBadgeProps,
    loadFigure(figureToFetchKey: string, badgeProps?: BadgeProps | null) {
      if (
        (!fetcher.data || fetcher.data.figure?.key !== figureToFetchKey) &&
        fetcher.state === "idle"
      ) {
        if (badgeProps) {
          setLoadingBadgeProps(badgeProps);
        }
        fetcher.load(`/dict/${figureToFetchKey}/preview`);
      }
    },
  };
}
