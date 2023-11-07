// https://nk2028.shn.hk/qieyun-js/classes/____.html

const initialGroups = {
  幫: new Set("幫滂並明"),
  端: new Set("端透定泥"),
  來: new Set("來"),
  知: new Set("知徹澄孃"),
  精: new Set("精清從心邪"),
  莊: new Set("莊初崇生俟"),
  章: new Set("章昌常書船"),
  日: new Set("日"),
  見: new Set("見溪羣疑"),
  影: new Set("影曉匣云"),
  以: new Set("以"),
};
const initialToGroup = Object.fromEntries(
  Object.entries(initialGroups).flatMap(([group, initials]) =>
    Array.from(initials, (initial) => [initial, group]),
  ),
);
const getInitialGroup = (initial: string) => initialToGroup[initial] || null;

interface SyllableQieyunProfile {
  is合口: boolean;
  canonical母: string;
  tone聲: string;
  is重紐A類: boolean;
  qieyunCycleHead韻: string;
  row等: string | null;
}

const rhymes: Record<
  QieyunRhymeCycleHead,
  string | ((syllable: SyllableQieyunProfile) => string)
> = {
  東: (s) => {
    if (s.tone聲 === "入" && s.row等 === "三") {
      if (initialGroups["幫"].has(s.canonical母)) return "ūk";
      if (s.canonical母 === "以") return "ẁīk";
      return initialGroups["莊"].has(s.canonical母) ||
        initialGroups["章"].has(s.canonical母)
        ? "yūk"
        : "wīk";
    }
    if (s.row等 === "三") {
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
  寒: "an",
  豪: "au",
  歌: (s) => {
    if (s.is合口) return s.row等 === "三" ? "ẃa" : "wa";
    return s.row等 === "三" ? "ya" : "a";
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
  夬: (s) => (s.is合口 ? "wạ" : "ạ"),
  刪: (s) => (s.is合口 ? "wạn" : "ạn"),
  山: (s) => (s.is合口 ? "wạ̈n" : "ạ̈n"),
  肴: "ạu",
  麻: (s) => {
    if (s.row等 === "三") return "yạ";
    return s.is合口 ? "wạ" : "ạ";
  },
  庚: (s) => {
    if (s.row等 === "三") return s.is合口 ? "wẹng" : "ẹng";
    return s.is合口 ? "wạng" : "ạng";
  },
  耕: (s) => (s.is合口 ? "wạ̈ng" : "ạ̈ng"),
  咸: "ạ̈m",
  銜: "ạm",

  // 四等韻
  齊: (s) => (s.is合口 ? "wèi" : "èi"),
  先: (s) => (s.is合口 ? "wèn" : "èn"),
  蕭: "èu",
  青: (s) => (s.is合口 ? "wèng" : "èng"),
  添: "èm",

  // 三等陰聲韻
  支: (s) => {
    if (
      s.is合口 ||
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
        : "wei";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yei"
      : "ei";
  },
  廢: "âi",
  宵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yeu"
      : "eu",
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
        : "wen";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yen"
      : "en";
  },
  陽: (s) => {
    if (s.is合口) return "wâng";
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
        : "weng";
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yeng"
      : "eng";
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
      : "em",
  嚴: "êm",
  凡: "âm",
};

export function transcribe(syllable: SyllableQieyunProfile) {
  const {
    canonical母: 母,
    tone聲: 聲,
    qieyunCycleHead韻: 韻,
    row等: 等,
  } = syllable;
  let 聲母 = initials[母 as keyof typeof initials];
  const transcribe韻母 = rhymes[韻 as QieyunRhymeCycleHead];

  const 母組 = getInitialGroup(母);

  let 韻母 =
    typeof transcribe韻母 === "string"
      ? transcribe韻母
      : transcribe韻母!(syllable);

  if (聲 === "入") {
    if (韻母.endsWith("m")) 韻母 = 韻母.slice(0, -1) + "p";
    else if (韻母.endsWith("n")) 韻母 = 韻母.slice(0, -1) + "t";
    else if (韻母.endsWith("ng")) 韻母 = 韻母.slice(0, -2) + "k";
  }

  if (母組 === "莊" && (韻 === "臻" || 等 === "二" || 韻 === "庚"))
    聲母 = 聲母!.replace("ṣ", "s").replace("ẓ", "z");
  else if (母組 === "端" && (等 === "二" || 等 === "三")) 聲母 += "h";
  else if (母 === "以" && /^[yŷẁ]/.test(韻母)) 聲母 = "";

  const 聲調 =
    {
      上: "ˬ",
      去: "ˎ",
    }[聲] || "";

  return 聲母 + 韻母 + 聲調;
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
  日: "nj",
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

type QieyunRhymeCycleHead =
  | "東"
  | "冬"
  | "模"
  | "泰"
  | "灰"
  | "咍"
  | "魂"
  | "痕"
  | "寒"
  | "豪"
  | "歌"
  | "唐"
  | "登"
  | "侯"
  | "覃"
  | "談"
  | "江"
  | "佳"
  | "皆"
  | "夬"
  | "刪"
  | "山"
  | "肴"
  | "麻"
  | "庚"
  | "耕"
  | "咸"
  | "銜"
  | "齊"
  | "先"
  | "蕭"
  | "青"
  | "添"
  | "支"
  | "脂"
  | "之"
  | "微"
  | "魚"
  | "虞"
  | "祭"
  | "廢"
  | "宵"
  | "尤"
  | "幽"
  | "鍾"
  | "眞"
  | "臻"
  | "文"
  | "欣"
  | "元"
  | "仙"
  | "陽"
  | "清"
  | "蒸"
  | "侵"
  | "鹽"
  | "嚴"
  | "凡";
