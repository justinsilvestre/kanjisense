import clsx from "clsx";
import { useRef, useState } from "react";

import fadeInOutStyles from "~/components/fadeInOut.module.css";
import { PopperOptions, usePaddedPopper } from "~/components/usePaddedPopper";

export function useHoverPopper(options: PopperOptions) {
  const popper = usePaddedPopper({ options });

  const closeTimer = useRef<number | null>(null);
  const [isClosing, setClosing] = useState(false);

  const open = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    popper.open();
    setClosing(false);
  };
  const close = () => {
    setClosing(true);
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    closeTimer.current = window.setTimeout(() => {
      popper.close();
      setClosing(false);
    }, 300);
  };

  const onBlur: React.FocusEventHandler = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      console.log("blur");
      close();
    }
  };

  return {
    ...popper,
    isClosing,
    open: open,
    close: close,

    popoverContentClassNames: clsx(
      popper.state?.placement.includes("top") && "[transform-origin:bottom]",
      popper.state?.placement.includes("bottom") && "[transform-origin:top]",
      !isClosing && fadeInOutStyles.fadeIn,
      isClosing && "opacity-0 transition-opacity duration-300",
    ),

    openEventHandlers: {
      onMouseMove: () => {
        !popper.isOpen ? open() : undefined;
      },
      onMouseDown: (e: React.MouseEvent) => {
        if (popper.isOpen) {
          close();
          e.preventDefault();
        } else open();
      },
      onFocus: () => {
        open();
      },
      onMouseLeave: () => {
        close();
      },
      onBlur,
    },
  };
}
