import { useRef, useState } from "react";

import { PopperOptions, usePaddedPopper } from "~/components/usePaddedPopper";

export function useHoverPopper(options: PopperOptions) {
  const popper = usePaddedPopper({ options });

  const closeTimer = useRef<number | null>(null);
  const [, setClosing] = useState(false);

  const open = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    popper.open();
    setClosing(false);
  };
  const close = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    closeTimer.current = window.setTimeout(() => {
      popper.close();
      setClosing(false);
    }, 100);
  };

  return {
    ...popper,
    open: open,
    close: close,
    handleMouseEnter: open,
    handleMouseLeave: close,
    handleFocus: open,
    handleBlur: close,
  };
}
