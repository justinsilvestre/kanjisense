/* eslint-disable react/no-unescaped-entities */
import clsx from "clsx";
import { Fragment } from "react";

import { DictLink } from "~/components/AppLink";
import { PopperOptions } from "~/components/usePaddedPopper";

import { useHoverPopper } from "./useHoverPopper";

const popoverOptions: PopperOptions = {
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
        offset: ({ reference }) => {
          return [-reference.width, 0];
        },
      },
    },
  ],
};
export function RadicalSection({
  radicalIndexes,
}: {
  radicalIndexes: {
    radical: { number: number; character: string };
    remainder: number;
  }[];
}) {
  const popper = useHoverPopper(popoverOptions);

  return (
    <section
      className="relative"
      ref={popper.setReferenceElement}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...popper.openEventHandlers}
    >
      traditional radical:{" "}
      {radicalIndexes?.map((radicalIndex) => (
        <span key={radicalIndex?.radical.character}>
          <DictLink
            figureKey={radicalIndex.radical.character}
            className="no-underline hover:underline"
          >
            {radicalIndex.radical.number}&nbsp;
            <span className="">{radicalIndex.radical.character}</span>
            &nbsp; (+{radicalIndex.remainder})
          </DictLink>{" "}
        </span>
      ))}
      {popper.isOpen ? (
        <div
          className="fixed z-20"
          ref={popper.setPopperElement}
          {...popper.attributes.popper}
          style={popper.styles.popper}
        >
          <div
            className={clsx(
              `[border:2px inset #afafaf33] -m-2 w-[95vw] max-w-[30rem] p-3 text-left text-sm shadow shadow-gray-400 transition-opacity  duration-300 [background-color:rgba(247,247,247,0.95)] [border-radius:0.3em]  [box-sizing:border-box] [max-height:85vh] [overflow-y:auto]`,
              popper.popoverContentClassNames,
            )}
          >
            <h3 className=" mb-4 text-center text-lg">
              {radicalIndexes.map((r, i) => (
                <Fragment key={i}>
                  Kangxi radical: {r.radical.character} (number{" "}
                  {r.radical.number})
                  <br />
                  <small>additional strokes: {r.remainder}</small>
                </Fragment>
              ))}
            </h3>
            <p className="mb-4">
              Knowing a character's traditional "radical" is not as useful today
              as was a couple decades ago. But identifying radicals is still
              part of traditional kanji education, and radical knowledge is even
              tested on the 漢字検定 <i>Kanji Kentei</i> exam for certifying
              kanji knowledge in Japan. These radicals are provided here for
              your reference.
            </p>
            <h3 className=" mb-2 text-center font-bold">What is a radical?</h3>
            <p className="mb-4">
              Some English speakers refer to all kanji components as "radicals",
              but traditionally, the term "radicals" is a translation of 部首{" "}
              <i>bushu</i>, literally meaning "section headers". These{" "}
              <i>bushu</i> are 214 kanji components used for looking up kanji in
              traditional paper dictionaries. This system of 214 <i>bushu</i>{" "}
              was devised all the way back in 1716, when the compilers of the
              authoritative 康熙字典 <i>Kangxi Dictionary</i> (Japanese:{" "}
              <i>Kōki Jiten</i>) looked at each kanji and chose{" "}
              <strong>one single component</strong> as its <i>bushu</i>. The
              idea is that users of the dictionary could find an unknown
              character by first identifying its <em>section header</em>{" "}
              component. By looking in the corresponding section of the
              dictionary, they could find all the characters containing that{" "}
              <i>bushu</i> component sorted according to the number of strokes
              needed to write them. This is not always straightforward in
              practice, but this method of organizing dictionaries is still used
              today.
            </p>
            <h3 className=" mb-2 text-center font-bold">
              What do these numbers mean?
            </h3>
            <p className="mb-4">
              The first number given with the 部首 <i>bushu</i> here refers to
              that section's order in the <i>Kangxi Dictionary</i>, which has
              become the standard ordering for kanji dictionaries throughout
              Asia. The second number is the <i>traditional</i> number of
              strokes in the character <em>outside</em> the <i>bushu</i>{" "}
              component, as counted in the Kangxi Dictionary (which may differ
              from the modern stroke count). You can use this information to
              find this kanji in any traditional paper dictionary which
              organizes characters by <i>bushu</i> and stroke count.
            </p>
            {radicalIndexes.length > 1 ? (
              <p className="mb-4">
                This kanji was not in the <i>Kangxi Dictionary</i>, so it
                doesn't have an "official" <i>bushu</i> section header.
                Therefore, multiple possibilities for what the <i>Kangxi</i>{" "}
                compilers might have assigned as this character's <i>bushu</i>{" "}
                are given here.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
