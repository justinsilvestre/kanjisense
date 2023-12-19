/* eslint-disable jsx-a11y/click-events-have-key-events */
import clsx from "clsx";

import { PopperOptions } from "~/components/usePaddedPopper";

import { useHoverPopper } from "./useHoverPopper";

const popperOptions: PopperOptions = {
  placement: "auto",
  modifiers: [
    {
      name: "preventOverflow",
      options: {
        mainAxis: true,
        altAxis: true,
        tether: false,
      },
    },
    {
      name: "offset",
      options: {
        offset: ({ popper, reference }) => {
          return [-popper.width / reference.width, -popper.height / 2];
        },
      },
    },
  ],
};

export function GlyphsImagesSection({
  glyphsJson,
}: {
  glyphsJson: Partial<Record<"kk" | "twk" | "ns" | "gw", string>>;
}) {
  const popper = useHoverPopper(popperOptions);
  return (
    <div
      className=""
      ref={popper.setReferenceElement}
      {...popper.openEventHandlers}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <div className="flex flex-1 flex-row flex-wrap justify-center gap-4">
        {glyphsJson.ns ? (
          <svg
            viewBox="0 -870 1000 1000"
            className="inline-block [height:2.5rem] [width:2.5rem]"
          >
            <path d={glyphsJson.ns} />
          </svg>
        ) : null}
        {glyphsJson.gw ? (
          <svg
            viewBox="0 0 200 200"
            className="inline-block [height:2.5rem] [width:2.5rem]"
          >
            <path d={glyphsJson.gw} />
          </svg>
        ) : null}
        {glyphsJson.twk ? (
          <svg
            viewBox="0 -870 1000 1000"
            className="inline-block [height:2.5rem] [width:2.5rem]"
          >
            <path d={glyphsJson.twk} />
          </svg>
        ) : null}
        {glyphsJson.kk ? (
          <svg
            viewBox="0 -870 1000 1000"
            className="inline-block [height:2.5rem] [width:2.5rem]"
          >
            <path d={glyphsJson.kk} />
          </svg>
        ) : null}
      </div>
      {popper.isOpen ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          className={clsx(
            `[border:2px inset #afafaf33] z-20 -m-2 max-w-[95vw] bg-neutral-50/95 p-3 text-left text-sm shadow shadow-gray-400 transition-opacity duration-300  [border-radius:0.3em] [box-sizing:border-box] [max-height:88v]  [overflow-y:auto]  `,
            popper.animationClassName,
            " backdrop-blur-md",
          )}
          ref={popper.setPopperElement}
          style={popper.styles.popper}
          {...popper.attributes.popper}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-4 text-center text-lg">
            common typographical variants
          </h3>
          <div className="flex flex-1 flex-row flex-wrap justify-center gap-4">
            {glyphsJson.ns ? (
              <div className="text-center">
                <svg
                  viewBox="0 -870 1000 1000"
                  className="mb-3 inline-block [height:5rem] [width:5rem]"
                >
                  <path d={glyphsJson.ns} />
                </svg>
                <h4 className="mb-2 font-bold">Gothic type</h4>
                <p>Seen often in digital format</p>
              </div>
            ) : null}
            {glyphsJson.gw ? (
              <div className="text-center">
                <svg
                  viewBox="0 0 200 200"
                  className="mb-3 inline-block [height:5rem] [width:5rem]"
                >
                  <path d={glyphsJson.gw} />
                </svg>
                <h4 className="mb-2 font-bold">Minchō type</h4>
                <p>Usual in print media</p>
              </div>
            ) : null}
            {glyphsJson.twk ? (
              <div className="text-center">
                <svg
                  viewBox="0 -870 1000 1000"
                  className="mb-3 inline-block [height:5rem] [width:5rem]"
                >
                  <path d={glyphsJson.twk} />
                </svg>
                <h4 className="mb-2 font-bold">Kaisho type</h4>
                <p>Seen in traditional Chinese brush calligraphy </p>
              </div>
            ) : null}
            {glyphsJson.kk ? (
              <div className="text-center">
                <svg
                  viewBox="0 -870 1000 1000"
                  className="mb-3 inline-block [height:5rem] [width:5rem]"
                >
                  <path d={glyphsJson.kk} />
                </svg>
                <h4 className="mb-2 font-bold">
                  Japanese <i>Textbook</i> type
                </h4>
                <p>Modern quasi-calligraphic style</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
