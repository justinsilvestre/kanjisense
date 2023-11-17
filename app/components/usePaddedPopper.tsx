import * as PopperJS from "@popperjs/core";
import { useState, useCallback, useEffect } from "react";
import { Modifier, Modifiers, usePopper } from "react-popper";

export type PopperOptions = Omit<Partial<PopperJS.Options>, "modifiers"> & {
  createPopper?: typeof PopperJS.createPopper;
  modifiers?: readonly Modifier<Modifiers>[];
};

const defaultOptions: PopperOptions = {
  placement: "bottom-start",
  modifiers: [
    {
      name: "preventOverflow",
      options: {
        mainAxis: true,
        altAxis: true,
        tether: false,
        padding: 0,
      },
    },
    {
      name: "offset",
      options: {
        offset: ({ reference }) => {
          return [0, -reference.height];
        },
      },
    },
  ],
};

export function usePaddedPopper({
  options = defaultOptions,
}: {
  options?: PopperOptions;
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  useEffect(() => {
    if (isOpen) {
      const closeOnEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", closeOnEsc);
      return () => document.removeEventListener("keydown", closeOnEsc);
    }
  }, [close, isOpen]);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  );
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(
    referenceElement,
    popperElement,
    options,
  );
  const handleClickPopper = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation();
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      const closeOnClick = (e: MouseEvent) => {
        const popper = popperElement;
        if (e.target !== popper && !popper?.contains(e.target as Node)) {
          const reference = referenceElement;
          if (e.target !== reference && !reference?.contains(e.target as Node))
            close();
        }
      };

      document.body.addEventListener("click", closeOnClick);
      return () => document.body.removeEventListener("click", closeOnClick);
    }
  }, [isOpen, popperElement]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setReferenceElement,
    setPopperElement: setPopperElement as (
      instance: HTMLElement | null,
    ) => void,
    styles,
    attributes,
    handleClickPopper,
  };
}
