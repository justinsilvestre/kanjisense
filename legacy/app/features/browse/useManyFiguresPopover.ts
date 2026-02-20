import React from "react";

import { useFigurePopover } from "~/components/FigurePopover";
import { BadgeProps } from "~/features/dictionary/badgeFigure";

export type ManyFiguresPopover = ReturnType<typeof useManyFiguresPopover>;

export function useManyFiguresPopover() {
  const figurePopover = useFigurePopover();

  return {
    ...figurePopover,
    getAnchorAttributes: (badgeProps: BadgeProps) => {
      const attrs = figurePopover.getAnchorAttributes(badgeProps);

      const onClick: React.MouseEventHandler = (e) => {
        e.preventDefault();
        if (figurePopover.popper.isOpen) {
          figurePopover.popper.close();
          figurePopover.loadFigure(badgeProps.key, badgeProps);
        } else {
          console.log("load figure", badgeProps.key);
          figurePopover.loadFigure(badgeProps.key, badgeProps);
          figurePopover.popper.open();
        }
        figurePopover.popper.setReferenceElement(
          e.nativeEvent.target as HTMLElement,
        );

        figurePopover.popper.forceUpdate?.();
      };
      return {
        ...attrs,
        onClick,
      };
    },
  };
}
