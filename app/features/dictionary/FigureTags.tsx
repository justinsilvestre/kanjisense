/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import clsx from "clsx";
import { PropsWithChildren } from "react";

import {
  BrowseAtomicComponentsLink,
  BrowseCharactersLink,
  BrowseCompoundComponentsLink,
} from "~/components/AppLink";
import { PopperOptions } from "~/components/usePaddedPopper";
import { BadgeProps } from "~/features/dictionary/badgeFigure";
import { KanjiListCode, isKyoikuCode } from "~/lib/dic/KanjiListCode";
import { parseFigureId } from "~/models/figure";

import { TOTAL_ATOMIC_COMPONENTS_COUNT } from "./TOTAL_ATOMIC_COMPONENTS_COUNT";
import { useHoverPopper } from "./useHoverPopper";

const JOYO_COUNT = 2316;

export function FigureTags({
  badgeProps,
  isAtomic,
  className,
}: {
  badgeProps: BadgeProps;
  isAtomic: boolean;
  className?: string;
}) {
  const {
    isPriorityComponent,
    isStandaloneCharacter,
    id,
    variantGroupId,
    listsAsCharacter,
    listsAsComponent,
    isPrioritySoundMark,
  } = badgeProps;
  const lists = isStandaloneCharacter ? listsAsCharacter : listsAsComponent;
  return (
    <ul className={`${className} flex flex-row flex-wrap gap-1`}>
      <ListTags
        lists={lists}
        isStandaloneCharacter={isStandaloneCharacter}
        className={` rounded-sm border-2 border-solid px-1 text-sm font-bold uppercase [padding-top:0.1rem]`}
      />
      {isPriorityComponent && !isStandaloneCharacter ? (
        <FigureTag
          className={`rounded-sm border-2 border-solid border-black bg-slate-800 px-1 text-sm font-bold uppercase text-white [padding-top:0.1rem] group-[ppo]:border-slate-300 group-[ppo]:bg-slate-600`}
          popoverContent={() => (
            <>
              <p className="mb-3 mt-0">
                Figures shown inside ○ <strong>circles</strong> throughout
                Kanjisense are <strong>kanji components only</strong>.
              </p>
              <p className="mb-3 mt-0">
                You won&apos;t find this component used as a standalone
                character, at least not in everyday modern Japanese.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          )}
        >
          ○ component only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && !isPriorityComponent ? (
        <FigureTag
          className={` rounded-sm border-2 border-solid border-black bg-slate-800 px-1 text-sm font-bold uppercase text-white [padding-top:0.1rem] group-[ppo]:border-slate-300 group-[ppo]:bg-slate-600`}
          popoverContent={() => (
            <>
              <p className="mb-3 mt-0">
                Kanji shown inside □ <strong>squares</strong> throughout
                Kanjisense are <strong>standalone characters only</strong>.
              </p>
              <p className="mb-3 mt-0">
                You won&apos;t find this kanji used as a component in everyday
                modern Japanese.
              </p>
              <p className="mb-3 mt-0">
                This kanji <em>may</em> appear as a component of rare characters
                outside{" "}
                <BrowseCharactersLink>
                  the 3,500 most important kanji
                </BrowseCharactersLink>
                , but you probably won&apos;t come across them as a
                second-language learner.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          )}
        >
          □ character only
        </FigureTag>
      ) : null}
      {isStandaloneCharacter && isPriorityComponent ? (
        <FigureTag
          className={` rounded-sm border-2 border-solid border-black bg-slate-800 px-1 text-sm font-bold uppercase text-white [padding-top:0.1rem] group-[ppo]:border-slate-300 group-[ppo]:bg-slate-600`}
          popoverContent={() => (
            <>
              <p className="mb-3 mt-0">
                Figures shown inside a combined ○ <strong>circle</strong> and □{" "}
                <strong>square</strong> in Kanjisense double as{" "}
                <strong>standalone kanji</strong> and{" "}
                <strong>kanji components</strong>.
              </p>
              <p className="mb-3 mt-0">
                You will find these kanji on their own in modern Japanese texts,
                as well as inside other kanji.
              </p>
              <PopoverBottom>
                <BrowseCharactersLink>
                  More on characters and components
                </BrowseCharactersLink>
              </PopoverBottom>
            </>
          )}
        >
          □ character + ○ component
        </FigureTag>
      ) : null}
      {variantGroupId && variantGroupId !== id ? (
        <FigureTag
          className={` rounded-sm border-2 border-solid border-black bg-slate-800 px-1 text-sm font-bold uppercase text-white outline outline-1  -outline-offset-2 [padding-top:0.1rem] group-[ppo]:border-slate-300 group-[ppo]:bg-slate-600`}
          popoverContent={() => (
            <VariantPopoverContent
              isStandaloneCharacter={isStandaloneCharacter}
              primaryVariantId={variantGroupId}
            />
          )}
        >
          variant
        </FigureTag>
      ) : null}
      {isAtomic ? (
        <FigureTag
          className={` rounded-sm border-2 border-solid border-black bg-slate-800  px-1 text-sm font-bold uppercase text-white [padding-top:0.1rem] group-[ppo]:border-slate-300 group-[ppo]:bg-slate-600`}
          popoverContent={() => (
            <>
              The {TOTAL_ATOMIC_COMPONENTS_COUNT} atomic components are the
              &quot;atoms&quot; that come together in various combinations to
              form the{" "}
              <BrowseCharactersLink>
                3,500 most important kanji
              </BrowseCharactersLink>{" "}
              in Japanese.
              <PopoverBottom>
                <BrowseAtomicComponentsLink>
                  More on the kanji components
                </BrowseAtomicComponentsLink>
              </PopoverBottom>
            </>
          )}
        >
          ☆ atomic
        </FigureTag>
      ) : null}
      {isPrioritySoundMark ? (
        <FigureTag
          className={`[bg-top:0 group-[ppo]:border-der-300.1rem] group-[ppo]:bg-yellow-30 rounded-sm border-2 border-solid border-yellow-400 bg-yellow-200 bg-opacity-50 px-1 text-sm font-bold uppercase group-[ppo]:border-yellow-600 group-[ppo]:bg-yellow-300`}
          popoverContent={() => (
            <>
              <p className="mb-3 mt-0">
                This component is a <strong>sound indicator</strong>. Kanji
                containing this component will often have an{" "}
                <strong>identical or similar</strong> pronunciation.
              </p>
              <p className="mb-3 mt-0">
                Note that this only works with <i>on&apos;yomi</i>.
              </p>
              <PopoverBottom>
                <BrowseCompoundComponentsLink>
                  More on sound components and on&apos;yomi
                </BrowseCompoundComponentsLink>
              </PopoverBottom>
            </>
          )}
        >
          sound mark
        </FigureTag>
      ) : null}
    </ul>
  );
}

const popperOptions: PopperOptions = {
  placement: "bottom",
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

function FigureTag({
  children,
  className,
  popoverContent,
}: {
  children: React.ReactNode;
  className?: string;
  popoverContent: () => React.ReactNode;
}) {
  const {
    setReferenceElement,
    setPopperElement,
    attributes,
    styles,
    isOpen,
    openEventHandlers,
    isClosing,
    popoverContentClassNames,
  } = useHoverPopper(popperOptions);

  return (
    <>
      <li
        className={clsx(isOpen && !isClosing ? "groupppo" : null)}
        {...openEventHandlers}
        ref={setReferenceElement}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <span
          className={clsx(
            className,
            "inline-block cursor-pointer [transition:background-color_0.3s]",
          )}
        >
          {children}
        </span>
        {isOpen ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            className={clsx(`pointer-events-auto fixed  z-20 `)}
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            <div
              className={clsx(
                " [color:initial] ",
                "bg-white p-3 text-sm font-normal shadow shadow-gray-400 transition-opacity duration-300 [border-radius:0.3em] [border:2px_inset_#afafaf33]  [box-sizing:border-box] [max-height:88v]  [text-transform:none] [width:18rem] md:max-w-xl",
                popoverContentClassNames,
              )}
            >
              {popoverContent()}
            </div>
          </div>
        ) : null}
      </li>
    </>
  );
}
function ListTags({
  lists: listsArg,
  isStandaloneCharacter,
  className,
}: {
  lists: KanjiListCode[] | null;
  isStandaloneCharacter: boolean;
  className?: string;
}) {
  const lists = listsArg || [];
  const kyoiku = lists.find(
    (c) =>
      c === "1" ||
      c === "2" ||
      c === "3" ||
      c === "4" ||
      c === "5" ||
      c === "6",
  );
  const kyoikuTag = kyoiku && (
    <KanjiListTag
      key={kyoiku}
      code={kyoiku}
      className={className}
      popoverContent={() => (
        <KyoikuTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      )}
    />
  );
  if (isStandaloneCharacter) {
    return (kyoikuTag ? [kyoikuTag] : []).concat(
      lists.flatMap((listCode) =>
        isKyoikuCode(listCode) ? (
          []
        ) : (
          <KanjiListTag
            key={listCode}
            code={listCode}
            className={className}
            popoverContent={() => (
              <KanjiListTagPopoverContent
                listCode={listCode}
                isStandaloneCharacter={isStandaloneCharacter}
              />
            )}
          />
        ),
      ),
    );
  }
  if (kyoikuTag) return kyoikuTag;
  if (lists.includes("j"))
    return (
      <KanjiListTag
        code="j"
        className={className}
        popoverContent={() => (
          <JoyoTag isStandaloneCharacter={isStandaloneCharacter} />
        )}
      />
    );
  if (lists.includes("h") && lists.includes("m"))
    return (
      <KanjiListTag
        code="h"
        className={className}
        popoverContent={() => (
          <HyogaiJinmeiyoTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        )}
      />
    );
  else if (lists.includes("h"))
    return (
      <KanjiListTag
        code="h"
        className={className}
        popoverContent={() => (
          <HyogaiTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        )}
      />
    );

  if (lists.includes("m"))
    return (
      <KanjiListTag
        code="m"
        className={className}
        popoverContent={() => (
          <JinmeiyoTagPopoverContent
            isStandaloneCharacter={isStandaloneCharacter}
          />
        )}
      />
    );
  return null;
}
function KyoikuTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the ~1000 <i>Kyōiku Kanji</i> or &quot;Education Kanji&quot; which are
        part of the Japanese national primary school curriculum.
      </p>
      <p className="mb-3 mt-0">
        {!isStandaloneCharacter ? "Components" : "Characters"} like these are
        marked in the color{" "}
        <span className="font-bold text-blue-600">blue</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function JinmeiyoTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mb-3 mt-0">
        The <i>Jinmeiyō Kanji</i> and their components are marked in the color{" "}
        <span className="font-bold text-red-600">red</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function HyogaiTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mb-3 mt-0">
        This{" "}
        {!isStandaloneCharacter ? "component is used within" : "is of one of"}{" "}
        the kanji of the <i>Hyōgai Kanji Jitaihyō</i>, which is a list of
        characters which, though not as common as the <i>Jōyo Kanji</i>, are
        still important enough to warrant a standard printed form according to
        the Japanese government.
      </p>
      <p className="mb-3 mt-0">
        Kanji from this list and their components are marked in the color{" "}
        <span className="font-bold text-purple-600">purple</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function HyogaiJinmeiyoTagPopoverContent({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jinmeiyō Kanji</i> or &quot;Personal-Name Use Kanji&quot;. These
        are the 863 characters approved for use in personal names despite
        falling outside the list of Regular Use Kanji.
      </p>
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component" : "kanji"} is marked in{" "}
        <span className="font-bold text-purple-600">purple</span> because it it
        also a member of the Extra-<i>Jōyō</i> Kanji List. (Otherwise,{" "}
        <i>Jinmeiyō Kanji</i> and their components are marked in the color{" "}
        <span className="font-bold text-red-600">red</span> throughout
        Kanjisense.)
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function JoyoTag({
  isStandaloneCharacter,
}: {
  isStandaloneCharacter: boolean;
}) {
  return (
    <>
      <p className="mb-3 mt-0">
        This {!isStandaloneCharacter ? "component is used within" : "is one of"}{" "}
        the <i>Jōyō Kanji</i> or &quot;General Use Kanji&quot;. These are the{" "}
        {JOYO_COUNT.toLocaleString()} characters which form part of the Japanese
        high school curriculum and are approved for use in official government
        documents.
      </p>
      <p className="mb-3 mt-0">
        {!isStandaloneCharacter ? "Components like these" : "The Jōyō Kanji"}{" "}
        are marked in the color{" "}
        <span className="font-bold text-joyo-600">green</span> throughout
        Kanjisense.
      </p>
      <PopoverBottom>
        <BrowseCharactersLink>
          More on the kanji lists mentioned throughout Kanjisense
        </BrowseCharactersLink>
      </PopoverBottom>
    </>
  );
}

function KanjiListTag({
  code,
  className,
  popoverContent,
}: {
  code: KanjiListCode;
  className?: string;
  popoverContent: () => React.ReactNode;
}) {
  switch (code) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return (
        <FigureTag
          className={`${className} border-kyoiku-800 bg-kyoiku-700 text-white  group-[ppo]:border-kyoiku-300 group-[ppo]:bg-kyoiku-600`}
          popoverContent={popoverContent}
        >
          primary grade {code}
        </FigureTag>
      );
    case "j": {
      return (
        <FigureTag
          className={`${className} border-joyo-800 bg-joyo-700 text-white  group-[ppo]:border-joyo-300 group-[ppo]:bg-joyo-600`}
          popoverContent={popoverContent}
        >
          Jōyō
        </FigureTag>
      );
    }
    case "h":
      return (
        <FigureTag
          className={`${className} border-hyogai-800 bg-hyogai-700  text-white group-[ppo]:border-hyogai-300 group-[ppo]:bg-hyogai-600`}
          popoverContent={popoverContent}
        >
          extra-Jōyō
        </FigureTag>
      );
    case "m":
      return (
        <FigureTag
          className={`${className} border-jinmeiyo-800 bg-jinmeiyo-700 text-white  group-[ppo]:border-jinmeiyo-300 group-[ppo]:bg-jinmeiyo-600`}
          popoverContent={popoverContent}
        >
          Jinmeiyō
        </FigureTag>
      );
  }
}

function PopoverBottom({ children }: PropsWithChildren<object>) {
  return <div className={" text-right"}>{children}</div>;
}

const VariantPopoverContent = ({
  primaryVariantId,
  isStandaloneCharacter,
}: {
  primaryVariantId: string;
  isStandaloneCharacter: boolean;
}) => (
  <>
    {!isStandaloneCharacter ? (
      <>
        <p className="mb-3 mt-0">
          This component is considered a <strong>variant form</strong> of{" "}
          {[...(parseFigureId(primaryVariantId)?.key || "")].length === 1 ? (
            primaryVariantId
          ) : (
            <>another component or character</>
          )}{" "}
          in Kanjisense.
        </p>
        <p className="mb-3 mt-0">
          Some variants are historically descended from a single character.
          However, others have been grouped together as a mnemonic device,
          because they have similar shapes.
        </p>
        <p className="mb-3 mt-0">
          In most cases, you can think of components&apos; variant forms as
          abbreviations that make characters easier to write.
        </p>
        <PopoverBottom>
          <BrowseCompoundComponentsLink>
            More on the kanji components
          </BrowseCompoundComponentsLink>
        </PopoverBottom>
      </>
    ) : (
      <>
        <p className="mb-3 mt-0">
          This character is a <strong>variant form</strong> of a kanji whose
          standard form may have been simplified in the <i>Jōyō Kanji</i>.
        </p>
        <p className="mb-3 mt-0">
          Kanji simplification in Japan happened mostly in 1945, so you will
          likely only see this form used in old texts, &quot;old-timey&quot;
          signage, and people&apos;s names.
        </p>
        <p className="mb-3 mt-0">
          Variant characters are encircled with a white stripe throughout
          Kanjisense.
        </p>
        <PopoverBottom>
          <BrowseCharactersLink>
            More on the kanji lists mentioned throughout Kanjisense
          </BrowseCharactersLink>
        </PopoverBottom>
      </>
    )}
  </>
);

function KanjiListTagPopoverContent({
  listCode,
  isStandaloneCharacter,
}: {
  listCode: KanjiListCode;
  isStandaloneCharacter: boolean;
}) {
  switch (listCode) {
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return (
        <KyoikuTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
    case "j":
      return <JoyoTag isStandaloneCharacter={isStandaloneCharacter} />;
    case "h":
      return (
        <HyogaiTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
    case "m":
      return (
        <JinmeiyoTagPopoverContent
          isStandaloneCharacter={isStandaloneCharacter}
        />
      );
  }
}
