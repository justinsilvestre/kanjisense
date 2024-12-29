import { QieyunRhymeCycleHead } from "./QieyunRhymeCycleHead.1";
import { initialGroups } from "./QysInitial";
import { QysTranscriptionProfile } from "./QysTranscriptionProfile";

type AsciiFinal = string;

export const asciiRhymes: Record<
  QieyunRhymeCycleHead,
  AsciiFinal | ((syllable: QysTranscriptionProfile) => AsciiFinal)
> = {
  東: (s) => {
    if (s.tone聲 === "入" && s.contrastiveRow等 === "三") {
      if (initialGroups["幫"].has(s.canonical母)) return "uk";
      if (s.canonical母 === "以") return "uk";
      return initialGroups["莊"].has(s.canonical母) ||
        initialGroups["章"].has(s.canonical母) ||
        initialGroups["精"].has(s.canonical母)
        ? "iuk"
        : "iuk";
    }
    if (s.contrastiveRow等 === "三") {
      return initialGroups["幫"].has(s.canonical母) ? "ung" : "iung";
    }
    return s.canonical母 === "影" ? "oung" : "oung";
  },
  冬: "oong",
  模: (s) => (s.canonical母 === "影" ? "wo" : "o"),
  泰: (s) => (s.is合口 ? "wai" : "ai"),
  灰: "woi",
  咍: "oi",
  魂: "won",
  痕: "on",
  寒: (s) => (s.is合口 ? "wan" : "an"),
  豪: "au",
  歌: (s) => {
    if (s.is合口) return s.contrastiveRow等 === "三" ? "ua" : "wa";
    return s.contrastiveRow等 === "三" ? "ia" : "a";
  },
  唐: (s) => (s.is合口 ? "wang" : "ang"),
  登: (s) => (s.is合口 ? "wong" : "ong"),
  侯: "ou",
  覃: "om",
  談: "am",

  // 二等韻
  江: "orng",
  佳: (s) => (s.is合口 ? "wer" : "er"),
  皆: (s) => (s.is合口 ? "weir" : "eir"),
  夬: (s) => (s.is合口 ? "wair" : "air"),
  刪: (s) => (s.is合口 ? "warn" : "arn"),
  山: (s) => (s.is合口 ? "wern" : "ern"),
  肴: "aur",
  麻: (s) => {
    if (s.contrastiveRow等 === "三") return "iar";
    return s.is合口 ? "war" : "ar";
  },
  庚: (s) => {
    if (s.contrastiveRow等 === "三") return s.is合口 ? "wieng" : "ieng";
    return s.is合口 ? "warng" : "arng";
  },
  耕: (s) => (s.is合口 ? "werng" : "erng"),
  咸: "erm",
  銜: "arm",

  // 四等韻
  齊: (s) => (s.is合口 ? "wei" : "ei"),
  先: (s) => (s.is合口 ? "wen" : "en"),
  蕭: "eu",
  青: (s) => (s.is合口 ? "weng" : "eng"),
  添: "em",

  // 三等陰聲韻
  支: (s) => {
    if (s.is合口) {
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        return s.is重紐A類 ? "ue" : "wie";
      return "ue";
    }

    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "ye"
      : "ie";
  },
  脂: (s) => {
    if (s.is合口) {
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        return s.is重紐A類 ? "uy" : "wiy";
      return "uy";
    }

    if (
      initialGroups["幫"].has(s.canonical母) ||
      initialGroups["見"].has(s.canonical母) ||
      initialGroups["影"].has(s.canonical母)
    )
      // return s.is重紐A類 ? "yi" : "ii";
      // return "ii";
      return s.is重紐A類 ? "y" : "iy";
    return "y";
  },
  之: "i",
  // 微: (s) => (s.is合口 || initialGroups["幫"].has(s.canonical母) ? "uy" : "iy"),
  微: (s) => (s.is合口 || initialGroups["幫"].has(s.canonical母) ? "ui" : "ii"),
  魚: "io",
  虞: "u",
  祭: (s) => {
    if (s.is合口) {
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        return s.is重紐A類 ? "uei" : "wiei";
      return "uei";
    }
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yei"
      : "iei";
  },
  廢: (s) =>
    s.is合口 || initialGroups["幫"].has(s.canonical母) ? "uoi" : "ioi",
  宵: (s) =>
    s.canonical母 === "以" ||
    (s.is重紐A類 &&
      (initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)))
      ? "yeu"
      : "ieu",
  尤: (s) => (initialGroups["幫"].has(s.canonical母) ? "uu" : "iuu"),
  幽: (s) =>
    initialGroups["幫"].has(s.canonical母) ||
    initialGroups["見"].has(s.canonical母) ||
    initialGroups["影"].has(s.canonical母)
      ? "yiu"
      : "iu",

  // 三等陽聲韻
  鍾: (s) => {
    return initialGroups["幫"].has(s.canonical母) ? "uong" : "uong";
  },
  眞: (s) => {
    if (s.is合口) {
      if (s.canonical母 === "以") return "uin";
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        //   return s.is重紐A類 ? "uin" : "win";
        // return "uin";
        return s.is重紐A類 ? "uyn" : "wiyn";
      return "uyn";
    }

    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? // ? "yin"
        // : "iyn";
        "yn"
      : "iyn";
  },
  臻: "ryn",
  文: "un",
  欣: "in",
  元: (s) => {
    if (initialGroups["幫"].has(s.canonical母)) return "uon";
    return s.is合口 ? "uon" : "ion";
  },
  仙: (s) => {
    if (s.is合口) {
      if (s.canonical母 === "以") return "yuen";
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        return s.is重紐A類 ? "uen" : "wien";
      return "uen";
    }

    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yen"
      : "ien";
  },
  陽: (s) => {
    if (s.is合口)
      return s.canonical母 === "影" ||
        s.canonical母 === "以" ||
        s.canonical母 === "云"
        ? "uang"
        : "uang";
    return initialGroups["幫"].has(s.canonical母) ||
      initialGroups["莊"].has(s.canonical母)
      ? "iang"
      : "iang";
  },
  清: (s) => {
    if (s.is合口) {
      if (s.canonical母 === "以") return "yueng";
      if (
        initialGroups["幫"].has(s.canonical母) ||
        initialGroups["見"].has(s.canonical母) ||
        initialGroups["影"].has(s.canonical母)
      )
        return s.is重紐A類 ? "ueng" : "wieng";
      return "ueng";
    }
    return s.canonical母 === "以" ||
      (s.is重紐A類 &&
        (initialGroups["幫"].has(s.canonical母) ||
          initialGroups["見"].has(s.canonical母) ||
          initialGroups["影"].has(s.canonical母)))
      ? "yeng"
      : "ieng";
  },
  蒸: (s) => {
    if (s.is合口) return s.canonical母 === "云" ? "wing" : "wing";
    return "ing";
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
      : "iem",
  嚴: "iom",
  凡: "uom",
};
