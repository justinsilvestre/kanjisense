import { useFetcher } from "@remix-run/react";
import { PropsWithChildren, useEffect, createElement } from "react";
import { createPortal } from "react-dom";

import { BadgeProps, getBadgeProps } from "~/features/dictionary/displayFigure";
import type { DictPreviewLoaderData } from "~/routes/dict.$figureId.preview";

import { DictLink } from "./AppLink";
import { FigureBadge } from "./FigureBadge";
import { usePaddedPopper } from "./usePaddedPopper";

export function FigurePopoverBadge({
  id,
  badgeProps,
  className = "",
}: {
  id: string;
  badgeProps: BadgeProps;
  className?: string;
}) {
  return (
    <FigurePopover figureId={id} badgeProps={badgeProps} className={className}>
      <FigureBadge id={id} badgeProps={badgeProps} />
    </FigurePopover>
  );
}

export function FigurePopover({
  figureId,
  badgeProps,
  children,
  element = "div",
  className = "",
}: PropsWithChildren<{
  figureId: string;
  badgeProps: BadgeProps;
  className?: string;
  element?: "div" | "span";
}>) {
  const {
    setReferenceElement,
    setPopperElement,
    attributes,
    styles,
    isOpen,
    open,
    close,
    handleClickPopper,
  } = usePaddedPopper();

  const { fetcher, loadFigure } = usePopoverFigureFetcher(figureId);
  useEffect(() => {
    if (isOpen) loadFigure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figureId]);

  return createElement(
    element,
    {
      className: `${className}`,
      ref: setReferenceElement,
      onClick: () => {
        if (isOpen) {
          close();
        } else {
          loadFigure();

          open();
        }
      },
      tabIndex: 0,
      role: "contentinfo",
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
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
          className={`-m-2 [border:2px inset #afafaf33] p-3 shadow-xl shadow-gray-400 transition-opacity duration-300 [width:40v] [min-width:17rem] [max-width:95v] [max-height:88v]  [background-color:rgba(247,247,247,0.95)] [border-radius:0.3em] [box-sizing:border-box]  [overflow-y:auto] md:max-w-xl ${""}`}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          onClick={handleClickPopper}
        >
          <div>
            <DictLink figureId={figureId}>
              <FigureBadge id={figureId} badgeProps={badgeProps} width={6} />
            </DictLink>
          </div>
          <div>
            {fetcher.data?.figure?.firstClassComponents.map((c) => (
              <FigureBadge
                key={c.component.id}
                id={c.component.id}
                badgeProps={getBadgeProps(c.component)}
                width={2.5}
              />
            ))}
          </div>
        </div>,
        document.body,
      ),
  );
}

export function usePopoverFigureFetcher(figureId: string) {
  const fetcher = useFetcher<DictPreviewLoaderData>();

  return {
    fetcher,

    loadFigure() {
      if (
        (!fetcher.data || fetcher.data.figure?.id !== figureId) &&
        fetcher.state === "idle"
      )
        fetcher.load(`/dict/${figureId}/preview`);
    },
  };
}
