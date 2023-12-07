/* eslint-disable react/no-unescaped-entities */
import A from "app/components/ExternalLink";

export function References({
  showContentsButton,
}: {
  showContentsButton: () => React.ReactNode;
}) {
  return (
    <section id="references">
      <h3>References {showContentsButton()}</h3>

      <p>
        For general information on the traditional initial/final categories, the
        source texts of Middle Chinese phonology, the reconstructed Middle
        Chinese of Pan Wuyun, and Old Chinese reconstructions:
      </p>
      <ul>
        <li>
          Shen, Zhongwei. (2020). <i>A Phonological History of Chinese</i>.
          Cambridge University Press.
        </li>
      </ul>
      <p>
        The cited reconstructed forms of initials and finals were chosen to show
        variety, and were not intended as an endorsement of specific
        reconstructions. Besides those forms taken from Pan Wuyun, some were
        taken Bernhard Karlgren's and Zhengzhang Shangfeng's reconstructions via{" "}
        <A href="http://en.wiktionary.org">Wiktionary</A> and the{" "}
        <A href="https://nk2028.shn.hk/qieyun-autoderiver/">
          Qieyun Autoderiver
        </A>
        , as well as the sources below:
      </p>
      <ul>
        <li>
          Coblin, W. S. (1994). A Compendium of Phonetics in Northwest Chinese.{" "}
          <i>Journal of Chinese Linguistics Monograph Series, 7</i>.
        </li>{" "}
        <a href="http://www.jstor.org/stable/23825696">
          http://www.jstor.org/stable/23825696
        </a>
        <li>
          Pulleyblank, Edwin G. (1991).{" "}
          <i>
            Lexicon of Reconstructed Pronunciation in Early Middle Chinese, Late
            Middle Chinese and Early Mandarin
          </i>
          . UBC Press.
        </li>
        <li>
          Pulleyblank, Edwin G. (1984).{" "}
          <i>Middle Chinese: A Study in Historical Phonology</i>. UBC Press.
        </li>
      </ul>

      <p>For descriptions of Middle Chinese tones:</p>
      <ul>
        <li>
          Mei, Tsu-Lin. (1970). Tones and Prosody in Middle Chinese and The
          Origin of The Rising Tone.{" "}
          <i>Harvard Journal of Asiatic Studies, 30</i>, 86–110.
        </li>
      </ul>

      <p>For the characterization of Korean "voiced" sounds:</p>
      <ul>
        <li>
          Chang, Charles B. (2006).{" "}
          <A href="https://www.researchgate.net/publication/259743465_Tense_consonants_in_Korean_revisited_A_crosslinguistic_perceptual_study">
            Tense consonants in Korean revisited: A crosslinguistic perceptual
            study
          </A>
          . In Charles B. Chang et al. (Eds.), CamLing 2006: Proceedings of the
          Fourth University of Cambridge Postgraduate Conference in Language
          Research (pp. 35-42). Cambridge, UK: Cambridge Institute of Language
          Research.
        </li>
      </ul>

      <p>For reconstructed Japanese sounds:</p>
      <ul>
        <li>
          Frellesvig, B. (2010). <i>A History of the Japanese Language</i>.
          Cambridge University Press.
        </li>
      </ul>

      <p>
        The correspondences between Middle Chinese finals and <i>on'yomi</i>{" "}
        were taken from this document, which draws from the dictionaries
        五十音引き漢和辞典 and 全訳 漢辞海 from Sanseido. In some cases, 全訳
        漢辞海 was consulted directly.
      </p>
      <ul>
        <li>
          Koide, Atsushi. (2007).{" "}
          <a href="https://ksu.repo.nii.ac.jp/?action=repository_action_common_download&item_id=1280&item_no=1&attribute_id=22&file_no=1">
            日本漢字音・中国中古音対照表 (Contrastive tables of Sino-Japanese
            and Ancient Chinese phonology)
          </a>
          . <i>Kyoto Sangyo University essays. Humanities series</i>.
        </li>
      </ul>
      <p>
        For inspiration, and information on historical Chinese rhyming
        practices:
      </p>
      <ul>
        <li>
          Branner, David Prager. (1999).{" "}
          <A href="https://www.researchgate.net/publication/233505841_A_Neutral_Transcription_System_for_Teaching_Medieval_Chinese">
            A Neutral Transcription System for Teaching Medieval Chinese
          </A>
          . <i>T'ang Studies</i>, 1999. 1-169.
        </li>
      </ul>
    </section>
  );
}
