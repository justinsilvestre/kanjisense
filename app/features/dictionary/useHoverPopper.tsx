import { useRef, useState } from "react";

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

  return {
    ...popper,
    isClosing,
    open: open,
    close: close,
    handleMouseEnter: open,
    handleMouseLeave: close,
    handleFocus: open,
    handleBlur: close,
  };
}
