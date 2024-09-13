/* eslint-disable react/no-unescaped-entities */

import {
  MetaFunction,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import {
  ReactNode,
  useState,
  SetStateAction,
  PropsWithChildren,
  Fragment,
} from "react";

import css from "app/features/dictionary/middle-chinese.css";
import { MiddleChineseLink } from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { useTocHighlighting } from "~/components/useTocHighlighting";
import { InitialConsonants } from "~/features/qysInfo/InitialConsonants";
import { NavLi } from "~/features/qysInfo/NavLi";

import { Finals } from "../features/dictionary/Finals";
import { Baxter } from "../features/qysInfo/Baxter";
import { Diacritics } from "../features/qysInfo/Diacritics";
import { FinalConsonants } from "../features/qysInfo/FinalConsonants";
import { References } from "../features/qysInfo/References";
import { ScrollLink } from "../features/qysInfo/ScrollLink";
import { SectionIds } from "../features/qysInfo/SectionIds";
import { Vowels } from "../features/qysInfo/Vowels";
import { GuangyunRhymesTable } from "~/features/qysInfo/GuangyunRhymesTable";

export const meta: MetaFunction = () => [
  { title: "Middle Chinese pronunciation | Kanjisense" },
];

export const links = () => [{ rel: "stylesheet", href: css }];

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Figure not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

interface Section {
  level: number;
  id: string;
  navText: ReactNode;
  children: Section[];
}
const section = (
  level: number,
  id: string,
  navText: ReactNode,
  children: Section[] = [],
): Section => ({
  level,
  id,
  navText,
  children,
});

const sections = [
  section(0, SectionIds["initial-consonants"], "Initial consonants", [
    section(
      1,
      SectionIds["initial-consonants-like-english"],
      "Initial consonants like English (1)",
    ),
    section(
      1,
      SectionIds["initial-consonants-like-english-2"],
      "Initial consonants like English (2)",
    ),
    section(1, SectionIds["sibilants"], "Sibilant sounds"),
    section(
      1,
      SectionIds["initial-consonants-not-found-in-english"],
      "Initial consonants not found in English",
    ),
    section(
      1,
      SectionIds["dental-vs-retroflex-stops"],
      '"Tongue-head" vs. "tongue-up" sounds',
    ),
    section(
      1,
      SectionIds["on-sound-changes"],
      "Sound changes affecting initial consonants",
      [
        section(
          2,
          SectionIds["a-note-on-voiced-sounds"],
          "Voiced sounds and breathy sounds",
        ),
        section(2, SectionIds["dentilabialization"], "Dentilabialization"),
        section(2, SectionIds["denasalization"], "Denasalization"),
      ],
    ),
  ]),
  section(0, SectionIds["final-consonants"], "Final consonants"),
  section(0, SectionIds["vowels"], "Vowels", [
    section(
      1,
      SectionIds["kan-on"],
      <>
        {" "}
        Viewing Middle Chinese through the{" "}
        <span className="whitespace-nowrap">
          {" "}
          <i>Kan-on</i>{" "}
        </span>
      </>,
    ),
    section(
      1,
      SectionIds["japanese-vowels"],
      "From Japanese to Chinese vowels",
    ),
    section(1, SectionIds["caveats"], "Caveats"),
  ]),
  section(0, SectionIds["finals"], "Finals", [
    section(1, SectionIds["structure-of-finals"], "Structure of finals"),
    section(1, SectionIds["medials"], "Medials"),
    section(1, SectionIds["coda"], "Coda"),
    section(1, SectionIds["main-vowels"], '"Main vowels"'),
    section(1, SectionIds["tones"], "Tones"),
    section(1, SectionIds["a-finals"], <>Finals with main vowel A</>),
    section(1, SectionIds["e-finals"], <>Finals with main vowel E</>),
    section(1, SectionIds["i-finals"], <>Finals with main vowel I</>),
    section(1, SectionIds["o-finals"], <>Finals with main vowel O</>),
    section(1, SectionIds["u-finals"], <>Finals with main vowel U</>),
  ]),
  section(
    0,
    SectionIds["diacritics"],
    "Summary of diacritics used in this notation",
    [
      section(1, SectionIds["four-rows"], "The four rows of the rime tables"),
      section(
        1,
        SectionIds["four-divisions"],
        "Marks of the 'Four Divisions' of the rime tables",
      ),
      section(
        1,
        SectionIds["go-on"],
        "Marks of Kan-on/Go-on vowel alternation",
      ),
      section(
        1,
        SectionIds["kan-on-diacritics"],
        <>
          Marks of vowel alternation within <i>Kan-on</i>
        </>,
      ),
    ],
  ),
  section(0, SectionIds["baxter"], "Why not Baxter's transcription?"),
  section(0, SectionIds["guangyun-rhymes-table"], "The 206 Guangyun rhymes transcribed"),
  section(0, SectionIds["references"], "References"),
];

export default function MiddleChinese() {
  const [isOpen, setIsOpen] = useState(false);
  const vowelTableHeader = (
    <thead className="vowelTableHeader">
      <th></th>
      <th>-∅</th>
      <th>-ng</th>
      <th>-k</th>
      <th>-i</th>
      <th>-n</th>
      <th>-t</th>
      <th>-u</th>
      <th>-m</th>
      <th>-p</th>
    </thead>
  );
  const showContentsButton = () => (
    <button
      className="float-right text-sm font-normal [line-height:2.4rem] md:hidden"
      onClick={() => setIsOpen((o) => !o)}
    >
      [{isOpen ? "hide" : "show"} contents]
    </button>
  );

  useTocHighlighting();

  return (
    <DictionaryLayout>
      <div className="container">
        <main id="top" className=" leading-7">
          <h2>A rough guide to Middle Chinese pronunciation</h2>

          <section>
            <p>
              The truth is that no one knows exactly how{" "}
              <MiddleChineseLink>Middle Chinese</MiddleChineseLink> used to
              sound. That's why, throughout Kanjisense, I've presented Middle
              Chinese readings using a notation meant only to give you a{" "}
              <b>rough picture of their pronunciation</b>.
            </p>
            <p>
              The International Phonetic Alphabet (IPA) would have afforded more
              precision, but a rough picture like this does a better job at
              reflecting the actual state of our knowledge. Many different
              scholars have come up with many different ways of depicting Middle
              Chinese sounds using the IPA, and all these reconstructions are
              fraught with controversy. It would be impossible for me to choose
              one scholar's reconstruction without forcing the users of this
              dictionary to confront all sorts contentious details of Middle
              Chinese phonology, which, in all likelihood, they're probably not
              interested in.
            </p>
            <p>
              But in case you actually are interested in those contentious
              details, here's a rundown of what all these symbols actually
              represent, using the sounds of English and Japanese as a reference
              point.
            </p>

            <Nav isOpen={true} className="md:hidden" />
          </section>

          <InitialConsonants
            showContentsButton={showContentsButton}
          ></InitialConsonants>

          <FinalConsonants
            showContentsButton={showContentsButton}
          ></FinalConsonants>

          <Vowels showContentsButton={showContentsButton}></Vowels>

          <Finals
            showContentsButton={showContentsButton}
            vowelTableHeader={vowelTableHeader}
          ></Finals>
          <Diacritics showContentsButton={showContentsButton}></Diacritics>
          <Baxter></Baxter>
          <GuangyunRhymesTable></GuangyunRhymesTable>
          <References showContentsButton={showContentsButton}></References>
        </main>

        <Nav
          {...{ isOpen, setIsOpen }}
          className="nav shadow-lg md:shadow-none"
        />
      </div>
    </DictionaryLayout>
  );
}

function Nav({
  isOpen,
  setIsOpen,
  className = "",
}: {
  isOpen: boolean;
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>;
  className?: string;
}) {
  return (
    <nav className={`${isOpen ? "" : "hiddenNav"} md:block ${className}`}>
      <h5 className="leading-6">
        <ScrollLink hash="top">
          A rough guide to Middle Chinese pronunciation
        </ScrollLink>{" "}
      </h5>
      <ul>
        {sections.map(({ level, id, navText, children }) => (
          <NavLi key={id} level={level} hash={id} text={navText}>
            {children.length > 0 ? (
              <ul>
                {children.map(({ level, id, navText, children }) => (
                  <Fragment key={id}>
                    <NavLi key={id} level={level} hash={id} text={navText} />
                    {children.length > 0 ? (
                      <ul>
                        {children.map(({ level, id, navText, children }) => (
                          <NavLi
                            key={id}
                            level={level}
                            hash={id}
                            text={navText}
                          >
                            {children.length > 0 ? (
                              <ul>
                                {children.map(
                                  ({ level, id, navText, children }) => {
                                    if (children.length)
                                      throw new Error(`Too deep`);
                                    return (
                                      <NavLi
                                        key={id}
                                        level={level}
                                        hash={id}
                                        text={navText}
                                      />
                                    );
                                  },
                                )}
                              </ul>
                            ) : null}
                          </NavLi>
                        ))}
                      </ul>
                    ) : null}
                  </Fragment>
                ))}
              </ul>
            ) : null}
          </NavLi>
        ))}
      </ul>

      {setIsOpen ? (
        <button
          className="text-sm font-normal md:hidden"
          onClick={() => setIsOpen((o) => !o)}
        >
          [{isOpen ? "hide" : "show"} contents]
        </button>
      ) : null}
    </nav>
  );
}

type SectionId = keyof typeof SectionIds;
function Section({
  id,
  children,
}: PropsWithChildren<{
  id: SectionId;
}>) {
  return (
    <section
      className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={id}
    >
      {children}
    </section>
  );
}
