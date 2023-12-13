import clsx from "clsx";
import { Fragment } from "react";

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
        padding: 4,
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
export function AncientCharacterFormSection({
  svgPaths: paths,
  className,
}: {
  svgPaths: string[];
  className?: string;
}) {
  const popper = useHoverPopper(popperOptions);
  return (
    <div
      className={clsx(
        `align-center relative flex flex-col justify-center gap-4 text-center`,

        className,
      )}
      ref={popper.setReferenceElement}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...popper.openEventHandlers}
    >
      <div>
        {paths.map((path, i) => (
          <div
            key={String(i)}
            className="m-1 inline-block rounded-md border-2 border-solid border-red-900/80 [height:3rem] [width:3rem]"
          >
            <ShuowenSvg path={path} />
          </div>
        ))}
      </div>
      {popper.isOpen ? (
        <div
          className={clsx(
            `[border:2px inset #afafaf33]  z-30 -m-2 p-3 text-left text-sm shadow shadow-gray-400 transition-opacity duration-300 [background-color:rgba(247,247,247,0.95)]  [border-radius:0.3em] [box-sizing:border-box] [max-height:88v]  [overflow-y:auto] [width:18rem] md:max-w-7xl`,
            popper.animationClassName,
          )}
          ref={popper.setPopperElement}
          style={popper.styles.popper}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          {...popper.attributes.popper}
        >
          <p className="mb-4 text-sm">
            These ancient <strong>&quot;seal script&quot;</strong> character
            forms are provided here to help you understand the{" "}
            <strong>historical evolution of the kanji</strong>. They are mostly
            obsolete, but can still be found on <i>hanko</i> seals (stamps) used
            in Japan as a way of signing documents.
          </p>
          <div className="mx-auto mb-4 text-center">
            {paths.map((path) => (
              <Fragment key={path}>
                <div className="inline-block rounded-md border-2 border-solid border-red-900/80 bg-white [height:7rem] [width:7rem]">
                  <ShuowenSvg path={path} />
                </div>
                {paths.length > 1 ? " " : null}
              </Fragment>
            ))}
          </div>

          <p className="mb-4 text-sm">
            The seal script forms in Kanjisense are based on the writing of the
            Qin dynasty (ca. 200{" "}
            <span className="[font-variant:small-caps]">BCE</span>), when
            Chinese writing was first standardized. They are taken from the
            ancient character dictionary 說文解字 <i>Shuowen Jiezi</i>{" "}
            (Japanese: <i>Setsumon Kaiji</i>
            ), which was compiled a couple centuries later, during the Eastern
            Han dynasty (25-206{" "}
            <span className="[font-variant:small-caps]">CE</span>).
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ShuowenSvg({ path }: { path: string }) {
  return (
    <svg viewBox="-10 0 266 256" className=" fill-red-950">
      <path d={path} />
    </svg>
  );
}
