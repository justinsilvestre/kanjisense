// https://nk2028.shn.hk/qieyun-js/classes/____.html

import { initialGroups, getInitialGroup } from "~/lib/qys/QysInitial";

import { asciiRhymes } from "./asciiRhymes";
import { QieyunRhymeCycleHead } from "./QieyunRhymeCycleHead.1";
import { Kaihe, QysSyllableProfile } from "./QysSyllableProfile";
import { QysTranscriptionProfile } from "./QysTranscriptionProfile";

function changeRuShengCoda(isRuSheng: boolean, final: string) {
  if (!isRuSheng) return final;
  if (final.endsWith("m")) return final.slice(0, -1) + "p";
  else if (final.endsWith("n")) return final.slice(0, -1) + "t";
  else if (final.endsWith("ng")) return final.slice(0, -2) + "k";
  else return final;
}

// prettier-ignore
type Final =  "iūng" | "ūng" | "ūk" | "yūk" | "ẁīk" | "wīk" | "wōng" | "ōng" | "ong" | "wo" | "o" | "wāi" | "āi" | "wai" | "ai" | "won" | "on" | "an" | "wan" | "au" | "wȧ" | "wa" | "ya" | "a" | "wang" | "ang" | "wŏng" | "ŏng" | "ou" | "am" | "ām" | "ạ̊ng" | "wạ̈" | "ạ̈" | "wạ̈i" | "ạ̈i" | "wại" | "ại" | "wạn" | "ạn" | "wạ̈n" | "ạ̈n" | "ạu" | "yạ" | "wạ" | "ạ" | "wâng" | "ŷang" | "wẹng" | "ẹng" | "wạng" | "wạ̈ng" | "ạng" | "ạ̈ng" | "äm" | "ạm" | "wei" | "ei" | "em" | "wen" | "en" | "eu" | "weng" | "eng" | "uï" | "ẁï" | "wï" | "yï" | "ï" | "i" | "uī" | "ẁī" | "wī" | "yī" | "ī" | "wî" | "î" | "yo" | "iu" | "ạ̈m" | "u" | "yu" | "ẁei" | "wėi" | "yei" | "ėi" | "âi" | "yeu" | "ėu" | "ū" | "iū" | "ông" | "ŷong" | "yūn" | "ẁīn" | "wīn" | "yīn" | "īn" | "ịn" | "un" | "in" | "ân" | "wên" | "ên" | "ẁen" | "wėn" | "yen" | "ėn" | "âng" | "yang" | "ẁeng" | "wėng" | "yeng" | "ėng" | "wĭng" | "ŷŏng" | "yŏng" | "yim" | "im" | "yem" | "ėm" | "êm" | "âm"

const rhymes: Record<
  QieyunRhymeCycleHead,
  Final | ((syllable: QysTranscriptionProfile) => Final)
> = {
  東: (s) => {
    if (s.tone聲 === "入" && s.contrastiveRow等 === "三") {
      if (initialGroups["幫"].has(s.canonical母)) return "ūk";
      if (s.canonical母 === "以") return "ẁīk";
      return initialGroups["莊"].has(s.canonical母) ||
        initialGroups["章"].has(s.canonical母) ||
        initialGroups["精"].has(s.canonical母)
        ? "yūk"
        : "wīk";
    }
    if (s.contrastiveRow等 === "三") {
      return initialGroups["幫"].has(s.canonical母) ? "ūng" : "iūng";
    }
    return s.canonical母 === "影" ? "wōng" : "ōng";
  },
  冬: "ong",
  模: (s) => (s.canonical母 === "影" ? "wo" : "o"),
  泰: (s) => (s.is合口 ? "wāi" : "āi"),
  灰: "wai",
  咍: "ai",
  魂: "won",
  痕: "on",
  寒: (s) => (s.is合口 ? "wan" : "an"),
  豪: "au",
  歌: (s) => {
    if (s.is合口) return s.contrastiveRow等 === "三" ? "wȧ" : "wa";
    return s.contrastiveRow等 === "三" ? "ya" : "a";
  },
  唐: (s) => (s.is合口 ? "wang" : "ang"),
  登: (s) => (s.is合口 ? "wŏng" : "ŏng"),
  侯: "ou",
  覃: "am",
  談: "ām",

  // 二等韻
  江: "ạ̊ng",
  佳: (s) => (s.is合口 ? "wạ̈" : "ạ̈"),
  皆: (s) => (s.is合口 ? "wạ̈i" : "ạ̈i"),
  夬: (s) => (s.is合口 ? "wại" : "ại"),
  刪: (s) => (s.is合口 ? "wạn" : "ạn"),
  山: (s) => (s.is合口 ? "wạ̈n" : "ạ̈n"),
  肴: "ạu",
  麻: (s) => {
    if (s.contrastiveRow等 === "三") return "yạ";
    return s.is合口 ? "wạ" : "ạ";
  },
  庚: (s) => {
    if (s.contrastiveRow等 === "三") return s.is合口 ? "wẹng" : "ẹng";
    return s.is合口 ? "wạng" : "ạng";
  },
  耕: (s) => (s.is合口 ? "wạ̈ng" : "ạ̈ng"),
  咸: "ạ̈m",
  銜: "ạm",

  // 四等韻
  齊: (s) => (s.is合口 ? "wei" : "ei"),
  先: (s) => (s.is合口 ? "wen" : "en"),
  蕭: "eu",
  青: (s) => (s.is合口 ? "weng" : "eng"),
  添: "em",

  // 三等陰聲韻
  支: (s) => {
    if (
      s.is合口 &&
      !(
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母) ||
        s.canonical母 === "以"
      )
    )
      return "uï";
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁï"
        : "wï";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yï"
      : "ï";
  },
  脂: (s) => {
    if (
      s.is合口 &&
      !(
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母) ||
        s.canonical母 === "以"
      )
    )
      return "uī";
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁī"
        : "wī";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yī"
      : "ī";
  },
  之: "i",
  微: (s) => (s.is合口 ? "wî" : "î"),
  魚: "yo",
  虞: (s) =>
    initialGroups["幫"].has(s.canonical母) ||
    initialGroups["見"].has(s.canonical母) ||
    initialGroups["影"].has(s.canonical母) ||
    s.canonical母 === "來"
      ? "u"
      : "yu",
  祭: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁei"
        : "wėi";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yei"
      : "ėi";
  },
  廢: "âi",
  宵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yeu"
      : "ėu",
  尤: (s) => (initialGroups["幫"].has(s.canonical母) ? "ū" : "iū"),
  幽: "iu",

  // 三等陽聲韻
  鍾: (s) => {
    return initialGroups["幫"].has(s.canonical母) ? "ông" : "ŷong";
  },
  眞: (s) => {
    if (s.is合口) {
      if (
        !(
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母) ||
          s.canonical母 === "以" ||
          s.canonical母 === "來"
        )
      )
        return "yūn";
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁīn"
        : "wīn";
    }
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yīn"
      : "īn";
  },
  臻: "ịn",
  文: "un",
  欣: "in",
  元: (s) => {
    if (initialGroups["幫"].has(s.canonical母)) return "ân";
    return s.is合口 ? "wên" : "ên";
  },
  仙: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁen"
        : "wėn";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yen"
      : "ėn";
  },
  陽: (s) => {
    if (s.is合口)
      return s.canonical母 === "影" ||
        s.canonical母 === "以" ||
        s.canonical母 === "云"
        ? "wâng"
        : "ŷang";
    return initialGroups["幫"].has(s.canonical母) ||
      initialGroups["莊"].has(s.canonical母)
      ? "âng"
      : "yang";
  },
  清: (s) => {
    if (s.is合口)
      return s.canonical母 === "以" ||
        (s.is重紐A類 &&
          (initialGroups["幫"].has(s.canonical母) ||
            initialGroups["見"].has(s.canonical母) ||
            initialGroups["影"].has(s.canonical母)))
        ? "ẁeng"
        : "wėng";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yeng"
      : "ėng";
  },
  蒸: (s) => {
    if (s.is合口) return s.canonical母 === "云" ? "wĭng" : "ŷŏng";
    return "yŏng";
  },
  侵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yim"
      : "im",
  鹽: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yem"
      : "ėm",
  嚴: "êm",
  凡: "âm",
};

export interface TranscriptionOptions {
  ascii?: boolean;
  separator?: string;
}

export function transcribe(
  syllable: QysTranscriptionProfile,
  { ascii = false, separator = "" }: TranscriptionOptions = {},
) {
  const { canonical母, tone聲: 聲, qieyunCycleHead韻: 韻 } = syllable;
  const transcribe韻母 = (ascii ? asciiRhymes : rhymes)[
    韻 as QieyunRhymeCycleHead
  ];
  const 母 = canonical母;

  const 母組 = getInitialGroup(母);

  const 韻母 =
    typeof transcribe韻母 === "string"
      ? transcribe韻母
      : transcribe韻母!(syllable);

  let initialRealization: string;

  if (
    母組 === "端" &&
    // 2nd or 3rd row
    (syllable.qieyunCycleHead韻 === "庚" ||
      syllable.qieyunCycleHead韻 === "之" ||
      syllable.qieyunCycleHead韻 === "脂")
  ) {
    initialRealization = initials[母] + "h";
  } else if (!separator && 母 === "以" && /^[yŷẁ]/.test(韻母))
    initialRealization = "";
  else initialRealization = initials[母];

  if (ascii) {
    const 聲調 = {
      上: "q",
      去: "h",
      平: "",
      入: "",
    }[聲];

    let asciiInitialRealization =
      asciiInitials[母 as keyof typeof asciiInitials];

    let asciiFinalRealization = changeRuShengCoda(聲 === "入", 韻母);
    if (asciiFinalRealization.includes("r"))
      asciiInitialRealization = asciiInitialRealization.replace(/r/g, "");
    if (asciiInitialRealization.includes("j"))
      asciiFinalRealization = asciiFinalRealization.replace(
        /y(?=[aeiouy])/,
        "",
      );

    if (
      母組 === "端" &&
      (syllable.qieyunCycleHead韻 === "庚" ||
        syllable.qieyunCycleHead韻 === "之" ||
        syllable.qieyunCycleHead韻 === "脂")
    ) {
      asciiInitialRealization += "h";
    }

    return (
      (asciiInitialRealization + separator + asciiFinalRealization)
        .replace("yy", "y")
        .replace(/r(?=.*r)/, "")
        .replace(/(j['ʻ]?w?)i(?=[aeo]|uu|u[nk])/, "$1")
        .replace(/(r['ʻ]?)i(?=[aeo]|uu|u[nk])/, "$1")
        .replace(/(y['ʻ]?)i(?=[aeo]|uu|u[nk])/, "$1") +
      separator +
      聲調
    );
  }

  const 聲調 = {
    上: "ˬ",
    去: "ˎ",
    平: "",
    入: "",
  }[聲];

  return (
    initialRealization +
    separator +
    changeRuShengCoda(聲 === "入", 韻母) +
    separator +
    聲調
  )
    .replace(/ẓ(?=.*[äạẹå])/, "z")
    .replace(/ṣ(?=.*[äạẹå])/, "s");
}
export function transcribeSyllableProfile(
  syllableProfile: QysSyllableProfile,
  options?: TranscriptionOptions,
) {
  return transcribe(
    {
      is合口: syllableProfile.kaihe === Kaihe.Closed,
      canonical母: syllableProfile.initial,
      tone聲: syllableProfile.tone,
      is重紐A類: syllableProfile.dengOrChongniu === "A",
      qieyunCycleHead韻: syllableProfile.cycleHead,
      contrastiveRow等: syllableProfile.dengOrChongniu,
    },
    options,
  );
}

const initials = {
  幫: "p",
  滂: "pʻ",
  並: "b",
  明: "m",
  端: "t",
  透: "tʻ",
  定: "d",
  泥: "n",
  來: "l",
  知: "t",
  徹: "tʻ",
  澄: "d",
  孃: "n",
  精: "ts",
  清: "tsʻ",
  從: "dz",
  心: "s",
  邪: "z",
  莊: "tṣ",
  初: "tṣʻ",
  崇: "dẓ",
  生: "ṣ",
  俟: "ẓ",
  章: "tś",
  昌: "tśʻ",
  常: "dź",
  日: "nź",
  書: "ś",
  船: "ź",
  以: "y",
  見: "k",
  溪: "kʻ",
  羣: "g",
  疑: "ng",
  影: "ʾ",
  曉: "kh",
  匣: "gh",
  云: "",
};

const asciiInitials = {
  幫: "p",
  滂: "p'",
  並: "b",
  明: "m",
  端: "t",
  透: "t'",
  定: "d",
  泥: "n",
  來: "l",
  知: "t",
  徹: "t'",
  澄: "d",
  孃: "n",
  精: "ts",
  清: "ts'",
  從: "dz",
  心: "s",
  邪: "z",
  莊: "tsr",
  初: "tsr'",
  崇: "dzr",
  生: "sr",
  俟: "zr",
  章: "tj",
  昌: "tj'",
  常: "dj",
  日: "nj",
  書: "sj",
  船: "zj",
  以: "y",
  見: "k",
  溪: "k'",
  羣: "g",
  疑: "ng",
  影: "'",
  曉: "h",
  匣: "g",
  云: "",
};
