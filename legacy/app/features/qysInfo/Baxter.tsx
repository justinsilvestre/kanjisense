/* eslint-disable react/no-unescaped-entities */
import A from "app/components/ExternalLink";

export function Baxter() {
  return (
    <section id="baxter">
      <h3>Why not Baxter's transcription?</h3>
      <p>
        Above, I touched my major reasons for using a notation like this{" "}
        <a href="#the-problem-with-reconstructions">
          instead of scholarly reconstructions of Chinese
        </a>
        . But if you've already come across discussions about Chinese historical
        phonology before, you may be wondering why I didn't just use one of the
        existing notations for Middle Chinese.
      </p>
      <p>
        Eventually, I'd like to publish a more detailed description of this
        system, one which goes into more depth about the motivations behind it,
        and the various design decisions that were made, including detailed
        comparisons with other systems. For now, I'll just talk about the one
        Middle Chinese transcription system that's most widely used today, the
        notation developed by William Baxter.
      </p>
      <h4>Baxter's transcription: a misleading design</h4>
      <p>
        Baxter's transcription was first published alongside a full-on
        reconstruction of the Old Chinese sound system. It's used not only in
        linguistics circles, but even in works like Kroll's{" "}
        <em>Student's Dictionary of Medieval Chinese</em>, and Cai's{" "}
        <em>How to Read Chinese Poetry</em>. Its big advantages are:
      </p>
      <ol className="mb-4">
        <li>
          It's "typeable", in a modified form. (This was crucial in 1992 when
          the system was first created, but in the era of Unicode, it's less
          important now. Plus, it's even possible to publish{" "}
          <A href="https://nk2028.shn.hk/qieyun-autoderiver/">nifty</A>{" "}
          <A href="https://edoc.uchicago.edu/edoc2013/digitaledoc_index.php">
            tools
          </A>{" "}
          for transcribing Middle Chinese sounds for cheap.)
        </li>
        <li>
          It's not a phonemic <em>or</em> phonetic reconstruction at all. It's a{" "}
          <em>transcription</em> of data from the rhyme dictionaries and rime
          tables; a representation of <strong>abstract categories</strong>{" "}
          assigned to Middle Chinese syllables based on their entries in the{" "}
          <em>Qieyun</em> and the rime tables.
        </li>
      </ol>

      <p>
        I owe Baxter the idea of a <em>transcription</em> for Middle Chinese. I
        clearly think there's huge value in a system like his that lets us refer
        to Middle Chinese syllables without assigning exact sounds. But I'm
        highly dissatisfied with Baxter's choice of symbols. His design works
        actively against one of his stated intentions, which was to convey these
        abstract categories to non-specialists.
      </p>
      <p>
        The problem is that, while Baxter's transcription technically does not{" "}
        <em>denote</em> particular sounds, it certainly <em>connotes</em> them,
        and Baxter failed to realize just how important those connotations are.
        When these <strong>abstract categories</strong> are represented using
        letters borrowed from the International Phonetic Alphabet, users can't
        help but associate them with <strong>concrete sounds</strong>. These
        concrete associations are in constant conflict with the underlying
        message. In short, it's a <em>misleading design</em>.
      </p>
      <p>
        You might not consider this to be a <em>design</em> problem. You might
        think it should be fine as long as you warn folks not to mistake
        Baxter's transcription for a phonetic or phonological analysis. To his
        credit, Cai does so in <em>How to Read Chinese Poetry</em> (in fact, Cai
        gives Baxter the space to do so himself). But how many readers will
        actually direct their eyes to the footnotes where these warnings are
        relegated, and then <em>heed</em> them, let alone <em>understand</em>{" "}
        them? The very concept of an alphabetic transcription of abstract
        phonological categories will always be too abstract to mean anything to
        the uninitiated.
      </p>
      <p>
        And{" "}
        <strong>
          it's not just non-specialists who have been confused about Baxter's
          intentions
        </strong>
        . In <em>A Student's Dictionary of Medieval Chinese</em>, the eminent
        scholar of medieval Chinese literature Kroll actually explicitly calls
        Baxter's notation a <em>reconstruction</em>, and touts it as a{" "}
        <em>widely accepted</em> one. Even Edwin Pulleyblank was
        confused&mdash;one of the most famous scholars in the exact same
        subfield Baxter works in, who Baxter cites constantly in his own work.
        He criticized Baxter's notation on the grounds that it expresses
        distinctions between syllables without commiting to exact phonetic
        values&mdash;which is exactly what Baxter meant for it to do. When you
        create a tool such as this notation, and{" "}
        <em>even the most capable users</em> misunderstand its purpose, you're
        faced with a choice. You can either blame the user for not{" "}
        <em>just reading the manual</em>, or you can admit that there is, after
        all, a design problem here.
      </p>
      <p>
        This problem is essentially one that Baxter's notation shares with all
        actual reconstructions of Middle Chinese: the selection of symbols is
        largely arbitrary. In the case of actual phonetic reconstructions, this
        is inescapable; there are so many grey areas in these reconstructions,
        yet you've got to choose <em>some</em> particular symbols if you're
        going to put your ideas to paper. But at least in an actual
        reconstruction, that arbitrariness in symbol choice is mitigated by a{" "}
        <strong>strong guiding principle</strong>: the reconstructor's
        motivation to put forth a clear, internally consistent argument about
        the sounds of the language. Since Baxter had no such argument to make,
        he thought it right to dispense with any strong guiding principle. But a
        good design just can't do without one, as the examples above have made
        clear.
      </p>
      <p>
        I hope to have improved on Baxter's notation by reintroducing a{" "}
        <em>mitigating force</em> against the arbitrariness of my symbol
        choices, in the form of{" "}
        <A href="#kan-on">that guiding principle behind my vowel choices</A>.
        This may not guard against users' mistaking my intentions, but in the
        event that they do, they will be better off than users of Baxter's
        system. We can use the <strong>lower level of abstraction</strong> built
        into the design to correct their understanding.
      </p>
      <p>Let me explain what I mean by this.</p>
      <h4>
        Improving on Baxter's notation by{" "}
        <strong>lowering the level of abstraction</strong>
      </h4>
      <p>
        Say you were to come across user of Baxter's notation, maybe someone
        who's been using Kroll's dictionary for a while. They've made a comment
        that reveals they've mistaken Baxter's transcription for a
        reconstruction. Over the past few weeks or months they've already
        started internalizing the symbols of his notation in terms of discrete
        consonants, medials, vowels, diphthongs. If you wanted to correct this
        person's understanding, what could you possibly say to them?
      </p>
      <p>
        The simplest, most concise non-technical explanation you could offer
        would be along the lines of, "Actually, these symbols don't correspond
        consistently to any sounds in particular." But would that satisfy
        someone who, up till now, imagined these symbols were providing them
        with a concrete depiction of Middle Chinese pronunciation? If the
        letters in <em>kaewk</em> and <em>mjie</em> and <em>pjuwng</em> don't
        represent particular sounds, they'll wonder, then what exactly{" "}
        <strong>do</strong> they represent? Unfortunately,{" "}
        <A href="#the-problem-with-reconstructions">
          there is no concise, simple answer to <em>that</em> question
        </A>
        . Therefore the time they've invested in Baxter's system won't provide
        any payoff until they've wrapped their head around the basics of the{" "}
        <i>Qieyun</i> system. And remember&mdash;this notation is meant to be
        accessible to <strong>non-specialists</strong>.
      </p>
      <p>
        On the other hand, if a user of my system mistakes the symbols for a
        reconstruction, I can correct their understanding in an instant with a
        simple rule-of-thumb explanation that "the vowels are based on the
        Japanese <em>on'yomi</em> pronunciation, and the diacritics distinguish
        different rhymes". This answer leaves out the finer details, but{" "}
        <em>at the level of detail on which it operates</em>, it is easy to
        understand. They will still need to learn the <em>Qieyun</em> system to{" "}
        <em>fully</em> understand what they're looking at, but the{" "}
        <em>on'yomi</em> principle provides{" "}
        <strong>a different level on which to understand the notation</strong>.
        It's a lower level of abstraction to work with before learning the{" "}
        <em>Qieyun</em> system&mdash;should they ever choose to put in the
        requisite time to do so.
      </p>
    </section>
  );
}
