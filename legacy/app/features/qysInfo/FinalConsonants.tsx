/* eslint-disable react/no-unescaped-entities */
import A from "app/components/ExternalLink";
import { G } from "~/features/qysInfo/G";
import { SectionIds } from "~/features/qysInfo/SectionIds";

export function FinalConsonants({
  showContentsButton,
}: {
  showContentsButton: () => React.ReactNode;
}) {
  return (
    <section
      className="pb-0 pt-14 md:pt-0 md:[margin-bottom:33vh] md:[min-height:50vh] "
      id={SectionIds["final-consonants"]}
    >
      <h3>Final consonants {showContentsButton()}</h3>
      <p>
        As mentioned above, the traditional consonant names of Middle Chinese
        given above technically apply to <i>initial</i> consonants, i.e. those
        at the start of a syllable. But it's beyond any doubt that a subset of
        these consonants could also appear at the end of a syllable. These are
        the <i>stop consonants</i> <G g="p" /> <G g="t" /> <G g="k" /> and the{" "}
        <i>nasal consonants</i> <G g="m" /> <G g="n" /> <G g="ng" />. It's
        possible that these syllable-endings involved more distinctions, like{" "}
        <A href="https://en.wikipedia.org/Palatalization">palatalized</A> or{" "}
        <A href="https://en.wikipedia.org/Labialization">labialized</A>{" "}
        variants. But these are not widely agreed upon, and so they are not
        represented in this notation.
      </p>
    </section>
  );
}
