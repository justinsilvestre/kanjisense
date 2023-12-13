/* eslint-disable react/no-unescaped-entities */
import { DictLink } from "~/components/AppLink";
import { PopperOptions } from "~/components/usePaddedPopper";

import { useHoverPopper } from "./useHoverPopper";

const popoverOptions: PopperOptions = {
  modifiers: [
    {
      name: "preventOverflow",
      options: {
        mainAxis: true,
        altAxis: true,
        tether: false,
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
  const hoverPopover = useHoverPopper(popoverOptions);

  return (
    <section
      ref={hoverPopover.setReferenceElement}
      {...hoverPopover.openEventHandlers}
    >
      traditional radical:{" "}
      {radicalIndexes?.map((radicalIndex) => (
        <span key={radicalIndex?.radical.character}>
          <DictLink
            figureId={radicalIndex.radical.character}
            className="no-underline hover:underline"
          >
            {radicalIndex.radical.number}&nbsp;
            <span className="">{radicalIndex.radical.character}</span>
            &nbsp; (+{radicalIndex.remainder})
          </DictLink>{" "}
        </span>
      ))}
      {hoverPopover.isOpen ? (
        <div
          className=" w-95vh absolute z-50 max-h-[95vh] w-[350rem] max-w-[95vw] overflow-y-auto  rounded-md bg-neutral-50 p-4 shadow-md shadow-black/30 "
          {...hoverPopover.attributes.popper}
          style={hoverPopover.styles.popper}
        >
          <h3 className=" mb-4 text-center text-lg">
            {radicalIndexes
              .map(
                (r) =>
                  `radical #${r.radical.number} ${r.radical.character} + ${r.remainder} additional strokes`,
              )
              .join(", ")}
          </h3>
          <p className="mb-4">
            These traditional "radicals" are not as useful today, now that most
            people use electronic dictionaries. But identifying a kanji's{" "}
            radical is still part of traditional kanji education, and radical
            knowledge is even tested on the 漢字検定 <i>Kanji Kentei</i> exam,
            which is used to certify kanji knowledge in Japan.
          </p>
          <p className="mb-4">
            Some English speakers refer to all kanji components as "radicals",
            but traditionally, the term "radicals" refers to the 214 部首{" "}
            <i>bushu</i>, literally "section headers". These 部首 <i>bushu</i>{" "}
            are 214 kanji components that are used to look up kanji in
            traditional paper dictionaries. All the way back in 1716, the
            compilers of the authoritative 康熙字典 <i>Kangxi Dictionary</i>{" "}
            (Japanese: <i>Kōki Jiten</i>) looked at each kanji and chose{" "}
            <strong>one single component</strong> as its 部首 <i>bushu</i>. The
            idea is that users of the dictionary can look up unknown kanji by
            first identifying its <em>section header</em> component, then
            finding the kanji in the corresponding section of the dictionary.
            This is not always straightforward in practice, but this method of
            organizing dictionaries is still used today.
          </p>
          <p className="mb-4">
            The first number given with the 部首 <i>bushu</i> here refers to
            that section's order in the <i>Kangxi Dictionary</i>, which has
            become standard throughout Asia. The second number is the{" "}
            <i>traditional</i> number of strokes in the character{" "}
            <em>outside</em> the <i>bushu</i> component (which may differ from
            the modern stroke count). You can use this information to find this
            kanji in any traditional paper dictionary which organizes characters
            by <i>bushu</i> and stroke count.
          </p>
          {radicalIndexes.length > 1 ? (
            <p className="mb-4">
              This kanji was not in the <i>Kangxi Dictionary</i>, so it doesn't
              have an "official" <i>bushu</i> section header. Therefore,
              multiple possibilities for what the <i>Kangxi</i> compilers might
              have assigned as this character's <i>bushu</i> are given here.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
