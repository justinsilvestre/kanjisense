import { createPortal } from "react-dom";

import { useHoverPopper } from "./useHoverPopper";

export function AncientCharacterFormSection({
  svgPaths: paths,
  className,
}: {
  svgPaths: string[];
  className?: string;
}) {
  const popper = useHoverPopper({});

  return (
    <div
      className={`align-center relative flex flex-col justify-center gap-4 text-center ${className}`}
      ref={popper.setReferenceElement}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="tooltip"
      onMouseEnter={popper.handleMouseEnter}
      onMouseLeave={popper.handleMouseLeave}
      onFocus={popper.handleFocus}
      onBlur={popper.handleBlur}
    >
      <div>
        {paths.map((path) => (
          <div
            key={path}
            className="inline-block rounded-md border-2 border-solid border-red-900/80 [height:3rem] [width:3rem]"
          >
            <ShuowenSvg path={path} />
          </div>
        ))}
      </div>
      {popper.isOpen
        ? createPortal(
            <div
              className={`[border:2px inset #afafaf33] -m-2 p-3 text-sm shadow shadow-gray-400 transition-opacity duration-300 [background-color:rgba(247,247,247,0.95)]  [border-radius:0.3em] [box-sizing:border-box] [max-height:88v]  [overflow-y:auto] [width:18rem] md:max-w-xl`}
              ref={popper.setPopperElement}
              style={popper.styles.popper}
              {...popper.attributes.popper}
            >
              <p className="mb-4">
                These ancient character forms are provided here to help you
                understand the evolution of the kanji. They are mostly obsolete,
                but can still be found on <i>hanko</i> seals (stamps) used in
                Japan as a way of signing documents.
              </p>
              <p className="mb-4">
                These &quot;seal script&quot; characters are based on the
                writing of the Qin dynasty (ca. 200{" "}
                <span className="[font-variant:small-caps]">BCE</span>), when
                Chinese writing was first standardized. They are taken from the
                ancient character dictionary 說文解字 <i>Shuowen Jiezi</i>{" "}
                (Japanese: <i>Setsumon Kaiji</i>
                ), which was compiled a couple centuries later, during the
                Eastern Han dynasty (25-206{" "}
                <span className="[font-variant:small-caps]">CE</span>).
              </p>
            </div>,
            document.getElementById("overlay") || document.body,
          )
        : null}
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
