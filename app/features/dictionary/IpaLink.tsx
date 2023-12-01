import A from "app/components/ExternalLink";

export enum IpaSymbols {
  alpha = "ɑ",
  ash = "æ",
  epsilon = "ɛ",
  iBar = "ɨ",
  laxI = "ɪ",
  turnedM = "ɯ",
  uBar = "ʉ",
  schwa = "ə",
  glottalStop = "ʔ",
  voicedPharyngealFricative = "ʕ",
  retroflexT = "ʈ",
  retroflexD = "ɖ",
  tCWithCurl = "tɕ",
  tSWithLoop = "tʂ",
  dZWithCurl = "dʑ",
  dZWithLoop = "dʐ",
  pAspirated = "pʰ",
  tAspirated = "tʰ",
  retroflexTAspirated = "ʈʰ",
  kAspirated = "kʰ",
  sAspirated = "sʰ",
  tsAspirated = "tsʰ",
  tCWithCurlAspirated = "tɕʰ",
  tSWithLoopAspirated = "tʂʰ",
  pBreathy = "pʱ",
  tBreathy = "tʱ",
  retroflexTBreathy = "ʈʱ",
  kBreathy = "kʱ",
  tsBreathy = "tsʱ",
  sBreathy = "sʱ",
  tCWithCurlBreathy = "tɕʱ",
  tSWithLoopBreathy = "tʂʱ",
  cWithCurl = "ɕ",
  sWithLoop = "ʂ",
  zWithCurl = "ʐ",
  zWithLoop = "ʑ",
  nWithLoop = "ɳ",
  nWithLeftHook = "ɲ",
  nWithLeftHookZwithLoop = "ɲʑ",
  gamma = "ɣ",
  retroflexApproximant = "ɻ",
  vWithHook = "ʋ",
  breathyH = "ɦ",
  eng = "ŋ",
  scriptG = "ɡ",
  turnedMWithLongLeg = "ɰ",
  laxA = "ɐ",
  chi = "χ",
  uvularR = "ʁ",
}
export const ipaChartUrl =
  "https://www.internationalphoneticassociation.org/IPAcharts/inter_chart_2018/IPA_2018.html";
const ipaUrls: Record<string, string> = {
  a: "https://en.wikipedia.org/wiki/Open_front_unrounded_vowel",
  e: "https://en.wikipedia.org/wiki/Close-mid_front_unrounded_vowel",
  i: "https://en.wikipedia.org/wiki/Close_front_unrounded_vowel",
  o: "https://en.wikipedia.org/wiki/Close-mid_back_rounded_vowel",
  u: "https://en.wikipedia.org/wiki/Close_back_rounded_vowel",
  y: "https://en.wikipedia.org/wiki/Close_front_rounded_vowel",
  j: "https://en.wikipedia.org/wiki/Palatal_approximant",
  p: "https://en.wikipedia.org/wiki/Voiceless_bilabial_plosive",
  t: "https://en.wikipedia.org/wiki/Voiceless_dental_and_alveolar_plosives",
  k: "https://en.wikipedia.org/wiki/Voiceless_velar_plosive",
  ts: "https://en.wikipedia.org/wiki/Voiceless_alveolar_affricate",
  s: "https://en.wikipedia.org/wiki/Voiceless_alveolar_sibilant",
  m: "https://en.wikipedia.org/wiki/Bilabial_nasal",
  n: "https://en.wikipedia.org/wiki/Alveolar_nasal",
  [IpaSymbols.eng]: "https://en.wikipedia.org/wiki/Velar_nasal",
  b: "https://en.wikipedia.org/wiki/Voiced_bilabial_plosive",
  d: "https://en.wikipedia.org/wiki/Voiced_dental_and_alveolar_plosives",
  [IpaSymbols.scriptG]: "https://en.wikipedia.org/wiki/Voiced_velar_plosive",
  z: "https://en.wikipedia.org/wiki/Voiced_alveolar_sibilant",
  dz: "https://en.wikipedia.org/wiki/Voiced_alveolar_affricate",
  x: "https://en.wikipedia.org/wiki/Voiceless_velar_fricative",
  [IpaSymbols.alpha]: "https://en.wikipedia.org/wiki/Open_back_unrounded_vowel",
  [IpaSymbols.laxA]: "https://en.wikipedia.org/wiki/Near-open_central_vowel",
  [IpaSymbols.ash]:
    "https://en.wikipedia.org/wiki/Near-open_front_unrounded_vowel",
  [IpaSymbols.epsilon]:
    "https://en.wikipedia.org/wiki/Open-mid_front_unrounded_vowel",
  [IpaSymbols.iBar]:
    "https://en.wikipedia.org/wiki/Close_central_unrounded_vowel",
  [IpaSymbols.laxI]:
    "https://en.wikipedia.org/wiki/Near-close_near-front_unrounded_vowel",
  [IpaSymbols.turnedM]:
    "https://en.wikipedia.org/wiki/Close_back_unrounded_vowel",
  [IpaSymbols.uBar]:
    "https://en.wikipedia.org/wiki/Close_central_rounded_vowel",
  [IpaSymbols.schwa]: "https://en.wikipedia.org/wiki/Schwa",
  [IpaSymbols.glottalStop]: "https://en.wikipedia.org/wiki/Glottal_stop",
  [IpaSymbols.voicedPharyngealFricative]:
    "https://en.wikipedia.org/wiki/Voiced_pharyngeal_fricative",
  [IpaSymbols.retroflexT]:
    "https://en.wikipedia.org/wiki/Voiceless_retroflex_plosive",
  [IpaSymbols.retroflexD]:
    "https://en.wikipedia.org/wiki/Voiced_retroflex_plosive",
  [IpaSymbols.tCWithCurl]:
    "https://en.wikipedia.org/wiki/Voiceless_alveolo-palatal_affricate",
  [IpaSymbols.tSWithLoop]:
    "https://en.wikipedia.org/wiki/Voiceless_retroflex_affricate",
  [IpaSymbols.dZWithCurl]:
    "https://en.wikipedia.org/wiki/Voiced_alveolo-palatal_affricate",
  [IpaSymbols.dZWithLoop]:
    "https://en.wikipedia.org/wiki/Voiced_retroflex_affricate",
  [IpaSymbols.pAspirated]:
    "https://en.wikipedia.org/wiki/Voiceless_bilabial_plosive",
  [IpaSymbols.tAspirated]:
    "https://en.wikipedia.org/wiki/Voiceless_dental_and_alveolar_plosives",
  [IpaSymbols.retroflexTAspirated]:
    "https://en.wikipedia.org/wiki/Voiceless_retroflex_plosive",
  [IpaSymbols.kAspirated]:
    "https://en.wikipedia.org/wiki/Voiceless_velar_plosive",
  [IpaSymbols.sAspirated]: "https://en.wikipedia.org/wiki/Aspirated_consonant",
  [IpaSymbols.tsAspirated]: "https://en.wikipedia.org/wiki/Aspirated_consonant",
  [IpaSymbols.tCWithCurlAspirated]: ipaChartUrl,
  [IpaSymbols.tSWithLoopAspirated]: ipaChartUrl,
  [IpaSymbols.pBreathy]: "https://en.wikipedia.org/wiki/Breathy_voice",
  [IpaSymbols.tBreathy]: "https://en.wikipedia.org/wiki/Breathy_voice",
  [IpaSymbols.retroflexTBreathy]:
    "https://en.wikipedia.org/wiki/Voiceless_retroflex_plosive",
  [IpaSymbols.kBreathy]: "https://en.wikipedia.org/wiki/Breathy_voice",
  [IpaSymbols.tsBreathy]:
    "https://en.wikipedia.org/wiki/Voiceless_alveolar_affricate",
  [IpaSymbols.sBreathy]: "https://en.wikipedia.org/wiki/Breathy_voice",
  [IpaSymbols.tCWithCurlBreathy]: ipaChartUrl,
  [IpaSymbols.tSWithLoopBreathy]: ipaChartUrl,
  [IpaSymbols.cWithCurl]:
    "https://en.wikipedia.org/wiki/Voiceless_alveolo-palatal_fricative",
  [IpaSymbols.sWithLoop]:
    "https://en.wikipedia.org/wiki/Voiceless_retroflex_fricative",
  [IpaSymbols.zWithCurl]:
    "https://en.wikipedia.org/wiki/Voiced_alveolo-palatal_fricative",
  [IpaSymbols.zWithLoop]:
    "https://en.wikipedia.org/wiki/Voiced_retroflex_fricative",
  [IpaSymbols.nWithLoop]:
    "https://en.wikipedia.org/wiki/Voiced_retroflex_nasal",
  [IpaSymbols.nWithLeftHook]:
    "https://en.wikipedia.org/wiki/Voiced_palatal_nasal",
  [IpaSymbols.nWithLeftHookZwithLoop]: ipaChartUrl,
  [IpaSymbols.gamma]: "https://en.wikipedia.org/wiki/Voiced_velar_fricative",
  [IpaSymbols.retroflexApproximant]:
    "https://en.wikipedia.org/wiki/Voiced_retroflex_approximant",
  [IpaSymbols.vWithHook]:
    "https://en.wikipedia.org/wiki/Labiodental_approximant",
  [IpaSymbols.breathyH]:
    "https://en.wikipedia.org/wiki/Voiced_glottal_fricative",
  [IpaSymbols.turnedMWithLongLeg]:
    "https://en.wikipedia.org/wiki/Voiced_velar_approximant",
  [IpaSymbols.chi]: "https://en.wikipedia.org/wiki/Voiceless_uvular_fricative",
  [IpaSymbols.uvularR]: "https://en.wikipedia.org/wiki/Voiced_uvular_fricative",
};

export function IpaLink({
  sound,
  linkSound,
  broad = false,
}: {
  sound: keyof typeof ipaUrls | string;
  linkSound?: keyof typeof ipaUrls | string;
  broad?: boolean;
}) {
  return (
    <A
      href={ipaUrls[linkSound || sound] || ipaChartUrl}
      className="text-orange-700 no-underline hover:underline"
    >
      {broad ? <>/{sound}/</> : <>[{sound}]</>}
    </A>
  );
}
