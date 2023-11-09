import { QieyunRhymeCycleHead } from "prisma/QieyunRhymeCycleHead";
import { QysInitial } from "prisma/QysInitial";

import {
  FinalCodeSuffix,
  attestedFinals,
  getCategoriesBySpecificityDescending,
} from "./attestedOnFinals";

type DengOrChongniu = "一" | "二" | "三" | "四" | "A" | "B";
enum Kaihe {
  Open = "開",
  Closed = "合",
}

enum Tone {
  平 = "平",
  上 = "上",
  去 = "去",
  入 = "入",
}

export interface QysSyllableProfile {
  initial: QysInitial;
  dengOrChongniu: DengOrChongniu;
  kaihe: Kaihe | null;
  tone: Tone;
  cycleHead: QieyunRhymeCycleHead;
}

export type ClassifiedOnyomi =
  | {
      modernKatakana: string;
      xiaoyun: number;
      type:
        | "ATTESTED_KAN"
        | "ATTESTED_KAN_RARE"
        | "ATTESTED_GO"
        | "ATTESTED_GO_RARE"
        | "KANYO";
      source: "Kanjidic" | "Unihan";
    }
  | {
      modernKatakana: string;
      xiaoyun: number;
      type: "SPECULATED_KAN" | "SPECULATED_GO";
      source: "Inferred";
    };

export enum InferredOnyomiType {
  AttestedKan = "ATTESTED_KAN",
  AttestedKanRare = "ATTESTED_KAN_RARE",
  AttestedGo = "ATTESTED_GO",
  AttestedGoRare = "ATTESTED_GO_RARE",
  SpeculatedKan = "SPECULATED_KAN",
  SpeculatedGo = "SPECULATED_GO",
}

const KAN_TYPES_PRIORITY = [
  InferredOnyomiType.AttestedKan,
  InferredOnyomiType.AttestedKanRare,
  InferredOnyomiType.SpeculatedKan,
];
const GO_TYPES_PRIORITY = [
  InferredOnyomiType.AttestedGo,
  InferredOnyomiType.AttestedGoRare,
  InferredOnyomiType.SpeculatedGo,
];

export function inferKanOn(
  syllable: QysSyllableProfile,
  format = (historicalOnyomiNotation: string) => historicalOnyomiNotation,
  onyomiFinalCandidates = getAttestedOnFinals(syllable, format),
) {
  const readingTypeToReadings = new Map<InferredOnyomiType, string[]>();
  if (!onyomiFinalCandidates) return readingTypeToReadings;
  for (const type of KAN_TYPES_PRIORITY) {
    for (const rawInitialCandidate of KAN_ON_INITIALS[syllable.initial]) {
      const initial = rawInitialCandidate === "h" ? "p" : rawInitialCandidate;
      for (const final of onyomiFinalCandidates.getReadings(type)) {
        const readingsForType = readingTypeToReadings.get(type) || [];
        readingTypeToReadings.set(type, readingsForType);
        readingsForType.push(format(initial + final));
      }
    }
  }
  return readingTypeToReadings;
}

export function inferGoOn(
  syllable: QysSyllableProfile,
  format = (historicalOnyomiNotation: string) => historicalOnyomiNotation,
  onyomiFinalCandidates = getAttestedOnFinals(syllable, format),
) {
  const readingTypeToReadings = new Map<InferredOnyomiType, string[]>();
  if (!onyomiFinalCandidates) return readingTypeToReadings;
  for (const type of GO_TYPES_PRIORITY) {
    for (const rawInitialCandidate of GO_ON_INITIALS[syllable.initial]) {
      const initial = rawInitialCandidate === "h" ? "p" : rawInitialCandidate;
      for (const final of onyomiFinalCandidates.getReadings(type)) {
        const readingsForType = readingTypeToReadings.get(type) || [];
        readingTypeToReadings.set(type, readingsForType);
        readingsForType.push(format(initial + final));
      }
    }
  }
  return readingTypeToReadings;
}
export function inferOnyomi(
  syllable: QysSyllableProfile,
  format = (historicalOnyomiNotation: string) => historicalOnyomiNotation,
) {
  const onyomiFinalCandidates = getAttestedOnFinals(syllable, format);
  return {
    kan: inferKanOn(syllable, format, onyomiFinalCandidates),
    go: inferGoOn(syllable, format, onyomiFinalCandidates),
  };
}

class XiaoyunInferredOnyomiReadings {
  constructor(
    private format = (historicalOnyomiNotation: string) =>
      historicalOnyomiNotation,
    public readings = new Map<InferredOnyomiType, string[]>(),
  ) {}

  addReadings(type: InferredOnyomiType, readings: string[]) {
    const readingsForType = this.readings.get(type) || [];
    this.readings.set(type, readingsForType);
    for (const reading of readings) readingsForType.push(this.format(reading));
  }

  getReadings(type: InferredOnyomiType) {
    return this.readings.get(type) || [];
  }
}

function getAttestedOnFinals(
  syllable: QysSyllableProfile,
  format?: (historicalOnyomiNotation: string) => string,
) {
  const { initial, cycleHead } = syllable;
  const finalCodeSuffix = finalCodeSuffixes.find((fc) => {
    return fc.test(syllable) && attestedFinals[`${cycleHead}${fc.text}`];
  });
  if (!finalCodeSuffix) return null;
  const finalCode = `${cycleHead}${finalCodeSuffix.text}` as const;
  const attestedReadingsForFinal = attestedFinals[finalCode];
  if (!attestedReadingsForFinal) return null;
  const initialCategories = getCategoriesBySpecificityDescending(initial);
  if (!initialCategories.length) return null;
  const result = new XiaoyunInferredOnyomiReadings(format);

  let kanEncountered = false;
  let goEncountered = false;
  for (const category of initialCategories) {
    const candidates = attestedReadingsForFinal[category];

    if (candidates) {
      const kan = candidates[0]
        ? Array.isArray(candidates[0])
          ? candidates[0]
          : [candidates[0]]
        : [];

      const go = candidates[1]
        ? Array.isArray(candidates[1])
          ? candidates[1]
          : [candidates[1]]
        : [];

      if (!kanEncountered) {
        if (kan.length) kanEncountered = true;

        result.addReadings(
          InferredOnyomiType.AttestedKan,
          kan.filter((s) => !/^(\*|\?)/.test(s)),
        );
        result.addReadings(
          InferredOnyomiType.AttestedKanRare,
          kan.flatMap((s) => (s.startsWith("?") ? s.slice(1) : [])),
        );
        result.addReadings(
          InferredOnyomiType.SpeculatedKan,
          kan.flatMap((s) => (s.startsWith("*") ? s.slice(1) : [])),
        );
      }
      if (!goEncountered) {
        if (go.length) goEncountered = true;

        result.addReadings(
          InferredOnyomiType.AttestedGo,
          go.filter((s) => !/^(\*|\?)/.test(s)),
        );
        result.addReadings(
          InferredOnyomiType.AttestedGoRare,
          go.flatMap((s) => (s.startsWith("?") ? s.slice(1) : [])),
        );
        result.addReadings(
          InferredOnyomiType.SpeculatedGo,
          go.flatMap((s) => (s.startsWith("*") ? s.slice(1) : [])),
        );
      }
    }
  }

  if (result.readings.size) {
    return result;
  }

  return null;
}

const finalCodeSuffixes: {
  text: FinalCodeSuffix;
  test: (params: QysSyllableProfile) => boolean;
}[] = [
  {
    text: "3h4",
    test: (p) =>
      isContrastiveThirdDivisionRhyme(p.cycleHead) &&
      p.dengOrChongniu !== nonThirdDivisionCounterpart(p.cycleHead) &&
      p.kaihe === Kaihe.Closed &&
      p.tone === Tone.入,
  },
  {
    text: "ah4",
    test: (p) =>
      p.dengOrChongniu === "A" &&
      p.kaihe === Kaihe.Closed &&
      p.tone === Tone.入,
  },
  {
    text: "3h",
    test: (p) =>
      isContrastiveThirdDivisionRhyme(p.cycleHead) &&
      p.dengOrChongniu !== nonThirdDivisionCounterpart(p.cycleHead) &&
      p.kaihe === Kaihe.Closed,
  },
  { text: "h4", test: (p) => p.kaihe === Kaihe.Closed && p.tone === Tone.入 },
  {
    text: "ah",
    test: (p) => p.dengOrChongniu === "A" && p.kaihe === Kaihe.Closed,
  },
  { text: "a4", test: (p) => p.dengOrChongniu === "A" && p.tone === Tone.入 },
  {
    text: "34",
    test: (p) =>
      isContrastiveThirdDivisionRhyme(p.cycleHead) &&
      p.dengOrChongniu !== nonThirdDivisionCounterpart(p.cycleHead) &&
      p.tone === Tone.入,
  },
  { text: "a", test: (p) => p.dengOrChongniu === "A" },
  { text: "h", test: (p) => p.kaihe === Kaihe.Closed },
  {
    text: "3",
    test: (p) =>
      isContrastiveThirdDivisionRhyme(p.cycleHead) &&
      p.dengOrChongniu !== nonThirdDivisionCounterpart(p.cycleHead),
  },
  { text: "4", test: (p) => p.tone === Tone.入 },
  { text: "", test: () => true },
];

function historicalOnyomiNotationToModernOnyomi(onyomiNotation: string) {
  return onyomiNotation
    .replace(/uwap?u/i, "ou")
    .replace(/ap?u/i, "ou")
    .replace(/ep?u/, "iYou")
    .replace(/ip?u/, "iYuu")
    .replace(/uwi/, "i")
    .replace(/uwe/, "e")
    .replace(/uwo/, "o")
    .replace(/^p/, "h")
    .replace(/^iY/, "y")
    .replace(/^uW/, "w")
    .replace(/uWa/, "a")
    .replace(/di/, "zi")
    .replace(/du/, "zu");
}
export function toModernKatakana(historicalOnyomiNotation: string) {
  const romaji = historicalOnyomiNotationToModernOnyomi(
    historicalOnyomiNotation,
  );
  return toKatakana(romaji);
}

function toKatakana(latinOnyomiNotation: string) {
  let kana = "";

  let pendingGyo: Record<string, string> | null = null;
  for (const letter of latinOnyomiNotation) {
    if (pendingGyo) {
      kana += pendingGyo[letter];
      pendingGyo = null;
    } else {
      const searchResult = LATIN_TO_KANA[letter as keyof typeof LATIN_TO_KANA];
      if (typeof searchResult === "string") {
        kana += searchResult;
      } else {
        pendingGyo = searchResult;
      }
    }
  }
  return kana
    .replace(/^ウヮ/u, "ワ")
    .replace(/^ウ([ヰヱ])/u, "$1")
    .replace(/^イャ/u, "ヤ")
    .replace(/^イュ/u, "ユ")
    .replace(/^イョ/u, "ヨ");
}
const LATIN_TO_KANA = {
  a: "ア",
  i: "イ",
  u: "ウ",
  e: "エ",
  o: "オ",
  k: { a: "カ", i: "キ", u: "ク", e: "ケ", o: "コ" },
  s: { a: "サ", i: "シ", u: "ス", e: "セ", o: "ソ" },
  t: { a: "タ", i: "チ", u: "ツ", e: "テ", o: "ト" },
  n: { a: "ナ", i: "ニ", u: "ヌ", e: "ネ", o: "ノ" },
  h: { a: "ハ", i: "ヒ", u: "フ", e: "ヘ", o: "ホ" },
  m: { a: "マ", i: "ミ", u: "ム", e: "メ", o: "モ" },
  y: { a: "ヤ", u: "ユ", o: "ヨ" },
  Y: { a: "ャ", u: "ュ", o: "ョ" },
  r: { a: "ラ", i: "リ", u: "ル", e: "レ", o: "ロ" },
  w: { a: "ワ", i: "ヰ", e: "ヱ", o: "ヲ" },
  W: { a: "ヮ" },
  g: { a: "ガ", i: "ギ", u: "グ", e: "ゲ", o: "ゴ" },
  z: { a: "ザ", i: "ジ", u: "ズ", e: "ゼ", o: "ゾ" },
  d: { a: "ダ", i: "ヂ", u: "ヅ", e: "デ", o: "ド" },
  b: { a: "バ", i: "ビ", u: "ブ", e: "ベ", o: "ボ" },
  p: { a: "パ", i: "ピ", u: "プ", e: "ペ", o: "ポ" },
  M: { u: "ン" },
};

function isContrastiveThirdDivisionRhyme(cycleHead: string) {
  return (
    cycleHead === "東" ||
    cycleHead === "戈" ||
    cycleHead === "麻" ||
    cycleHead === "庚"
  );
}

function nonThirdDivisionCounterpart(cycleHead: string) {
  if (isContrastiveThirdDivisionRhyme(cycleHead)) {
    if (cycleHead === "東" || cycleHead === "戈") return "一";
    if (cycleHead === "麻" || cycleHead === "庚") return "二";
  }
}

export const KAN_ON_INITIALS: Record<QysInitial, string[]> = {
  幫: ["h"],
  滂: ["h"],
  並: ["h"],
  明: ["b", "m"],
  端: ["t"],
  透: ["t"],
  定: ["t"],
  泥: ["d", "n"],
  來: ["r"],
  知: ["t"],
  徹: ["t"],
  澄: ["t"],
  孃: ["d", "n"],
  精: ["s"],
  清: ["s"],
  從: ["s"],
  心: ["s"],
  邪: ["s"],
  莊: ["s"],
  初: ["s"],
  崇: ["s"],
  生: ["s"],
  俟: ["s"],
  章: ["s"],
  昌: ["s"],
  常: ["s"],
  書: ["s"],
  船: ["s"],
  日: ["z"],
  見: ["k"],
  溪: ["k"],
  羣: ["k"],
  疑: ["g"],
  影: [""],
  曉: ["k"],
  匣: ["k"],
  云: [""],
  以: [""],
};
export const GO_ON_INITIALS: Record<QysInitial, string[]> = {
  幫: ["h"],
  滂: ["h"],
  並: ["b"],
  明: ["m"],
  端: ["t"],
  透: ["t"],
  定: ["d"],
  泥: ["n"],
  來: ["r"],
  知: ["t"],
  徹: ["t"],
  澄: ["d"],
  孃: ["n"],
  精: ["s"],
  清: ["s"],
  從: ["z"],
  心: ["s"],
  邪: ["z"],
  莊: ["s"],
  初: ["s"],
  崇: ["z"],
  生: ["s"],
  俟: ["z"],
  章: ["s"],
  昌: ["s"],
  常: ["z"],
  書: ["s"],
  船: ["z"],
  日: ["n"],
  見: ["k"],
  溪: ["k"],
  羣: ["g"],
  疑: ["g"],
  影: [""],
  曉: ["k"],
  匣: ["g", ""],
  云: [""],
  以: [""],
};
