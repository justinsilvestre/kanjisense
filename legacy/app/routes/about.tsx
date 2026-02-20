/* eslint-disable react/no-unescaped-entities */
import { ReactNode } from "react";
import type { MetaFunction } from "react-router";

import { BrowseSoundComponentsLink } from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import A from "~/components/ExternalLink";

export const meta: MetaFunction = () => [{ title: "About Kanjisense" }];

export default function Index({ error }: { error?: ReactNode }) {
  return (
    <DictionaryLayout>
      <>
        {error ? (
          <div className="border-1 mb-4 rounded-sm border border-red-700/20 p-8 text-center text-red-700">
            {error}
          </div>
        ) : null}
        <section className="mx-auto my-4 flex max-w-2xl flex-grow flex-col justify-center leading-8">
          <div className=" ">
            <h1 className="mb-4 text-center text-xl">About Kanjisense</h1>
            <h2 className="mb-4 text-xl">
              How is Kanjisense different from ______?
            </h2>
            <p className="mb-4">
              The idea of learning the kanji via mnemonic keywords + component
              breakdowns is nothing new. Numerous comparable kanji-learning
              systems have popped up over the years in the form of books like
              Forster and Tamura's <i>Kanji ABC</i>, De Roo's <i>2001 Kanji</i>,
              and, most notably, Heisig's <i>Remembering the Kanji</i>.
            </p>
            <p className="mb-4">
              Kanjisense was born out of my personal yearning for a similar
              resource that:
            </p>
            <ol className="mb-4 ml-8 list-decimal">
              <li>
                <span className="font-bold">
                  takes advantage of modern technology.
                </span>
                <br />
                Seriously, who can be bothered to look up a kanji in a dead-tree
                book these days?
              </li>
              <li>
                <span className="font-bold">
                  tells the real story of the characters' ancient origins.
                </span>
                <br />
                In particular, Heisig's <i>Remembering the Kanji</i> can get
                pretty silly in its choices for component keywords. Kanjisense
                isn't above the occasional silly mnemonic device, but it also
                makes room for discussions of{" "}
                <BrowseSoundComponentsLink>
                  sound components
                </BrowseSoundComponentsLink>
                , and sometimes even ancient character forms.
              </li>
            </ol>
            <p className="mb-4">
              Besides those key differences, Kanjisense is more of a reference
              work than a course of study. The authors of{" "}
              <i>Remembering the Kanji</i> and <i>Kanji ABC</i> recommend you
              power through their books and memorize a list of 2,000 kanji in
              their proprietary order. I know from experience that I don't have
              the sheer willpower it takes to memorize 2,000 characters out of
              context, so I'll hold off from making such recommendations here.
              🙂
            </p>
            <p className="mb-4">
              Instead of a list to memorize, I present you with the same
              information and tools that have helped me the most on my own
              continuing kanji journey.
            </p>
            <h3 className="mt-8 text-center text-xl">Sources</h3>
            <p className="mb-4 text-center">
              Kanjisense was made possible thanks to the following projects.
            </p>
            <h4 className="font-bold">
              <A href="http://kanji-database.sourceforge.net/">
                The Kanji Database Project
              </A>
            </h4>
            <p className="mb-4">
              Graphical decomposition data for the kanji and etymological data
              are based on the Kanji Database Project's{" "}
              <A href="http://kanji-database.sourceforge.net/ids/ids.html">
                ids.txt
              </A>{" "}
              and{" "}
              <A href="http://kanji-database.sourceforge.net/ids/ids-analysis.html">
                ids-analysis.txt
              </A>{" "}
              respectively. These in turn are based on data from the{" "}
              <A href="http://git.chise.org/gitweb/?p=chise/ids.git;a=summary">
                CHISE IDS project
              </A>
              , which is under the{" "}
              <A href="https://www.gnu.org/licenses/old-licenses/gpl-2.0.html">
                GNU General Public License 2.0
              </A>
              . The source for Kanjisense's modified version can be found{" "}
              <A href="https://github.com/justinsilvestre/kanjisense">
                on Github
              </A>
              .
            </p>
            <h4 className="font-bold">
              <A href="https://github.com/scriptin/kanji-frequency">
                Dmitry Shpika's kanji frequency data
              </A>
            </h4>
            <p className="mb-4">
              Character usage frequency data is taken from Github user
              scriptin's "kanji-frequency" repository where it is distributed
              under the{" "}
              <A href="https://creativecommons.org/licenses/by/4.0/">
                Creative Commons Attribution 4.0 International License
              </A>
              . The frequency data used on Kanjisense is based on the{" "}
              <A href="http://www.aozora.gr.jp/">Aozora Bunko</A> library.
            </p>
            <h4 className="font-bold">
              <A href="https://www.unicode.org/reports/tr38/">
                The Unihan Database
              </A>
            </h4>
            <p className="mb-4">
              Character variants data and some character readings data are taken
              from the Unihan Database, and used in conformance with the
              Unicode's{" "}
              <A href="http://www.unicode.org/copyright.html">terms of use</A>.
            </p>
            <h4 className="font-bold">
              <A href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project">
                The KANJIDIC Project
              </A>
            </h4>
            <p className="mb-4">
              Some character readings data was taken from dictionary files by
              the KANJIDIC project, which are released under the{" "}
              <A href="https://www.edrdg.org/edrdg/licence.html">
                Creative Commons 3.0 Attribution-ShareAlike License
              </A>
              .
            </p>
            <h4 className="font-bold">
              <A href="https://nk2028.shn.hk/">nk2028</A>
            </h4>
            <p className="mb-4">
              Some data for Middle Chinese readings was taken from the nk2028
              project, in particular their classifications of Middle Chinese
              syllables according to the traditional categories. That data was
              released under a{" "}
              <A href="https://github.com/nk2028/qieyun-data/blob/main/LICENSE">
                CC0 1.0 Universal license
              </A>
              .
            </p>
            <h4 className="font-bold">
              <A href="http://en.glyphwiki.org/">GlyphWiki</A>
            </h4>
            <p className="mb-4">
              Kanjisense makes use of the free Hanazono Mincho font from
              GlyphWiki, in conformance with{" "}
              <A href="http://en.glyphwiki.org/wiki/GlyphWiki:License">
                GlyphWiki's license
              </A>
            </p>
          </div>
        </section>
      </>
    </DictionaryLayout>
  );
}
