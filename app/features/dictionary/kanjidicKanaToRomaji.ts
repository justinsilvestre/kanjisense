export function kanjidicKanaToRomaji(input: string, preserveDots = false) {
  if (input === "みずうみ") return "mizuumi";
  if (input === "からすうり") return "karasuuri";
  if (input === "あるいは") return "aruiwa";
  try {
    let result = "";
    for (let i = 0; i < input.length; i++) {
      if (input[i] === ".") {
        result += preserveDots ? "." : "";
      } else {
        result += kanaCharacterToRomaji(input, i);
        if (MACRON_VOWELS.has(result.at(-1)!)) i++;
      }
    }
    return result;
  } catch (e) {
    console.error(e);
    throw new Error(`Error converting ${input} to romaji`);
  }
}

const MACRON_VOWELS = new Set("āīūēō");

// prettier-ignore
const KATAKANA_TO_ROMAJI = {
  ア: ["", "a"], イ: ["", "i"], ウ: ["", "u"], エ: ["", "e"], オ: ["", "o"], 
  カ: "ka",キ: "ki", ク: "ku", ケ: "ke", コ: "ko",
  サ: "sa",シ: ["sh", "i", "s"], ス: "su", セ: "se", ソ: "so",
  タ: "ta",チ: ["ch", "i", "t"], ツ: ["ts", "u", "t"], テ: "te", ト: "to",
  ナ: "na",ニ: "ni", ヌ: "nu", ネ: "ne", ノ: "no",
  ハ: "ha",ヒ: "hi", フ: "fu", ヘ: "he", ホ: "ho",
  マ: "ma",ミ: "mi", ム: "mu", メ: "me", モ: "mo",
  ヤ: "ya", ユ: "yu", ヨ: "yo", 
  ャ: "ya", ュ: "yu", ョ: "yo", 
  ラ: "ra",リ: "ri", ル: "ru", レ: "re", ロ: "ro",
  ワ: "wa",ヲ: "wo",
  ン: ["n", ""], ガ: "ga",ギ: "gi", グ: "gu", ゲ: "ge", ゴ: "go",
  ザ: "za",ジ: ["j", "i"], ズ: "zu", ゼ: "ze", ゾ: "zo",
  ダ: "da",ヂ: ["j", "i"], ヅ: "zu", デ: "de", ド: "do",
  バ: "ba",ビ: "bi", ブ: "bu", ベ: "be", ボ: "bo",
  パ: "pa",ピ: "pi", プ: "pu", ペ: "pe", ポ: "po",
  ッ: "",
  ー: '',
} as const;

const HIRAGANA_TO_KATAKANA = Object.fromEntries(
  `あア いイ うウ えエ おオ
かカ きキ くク けケ こコ
さサ しシ すス せセ そソ
たタ ちチ つツ てテ とト
なナ にニ ぬヌ ねネ のノ
はハ ひヒ ふフ へヘ ほホ
まマ みミ むム めメ もモ
やヤ ゆユ よヨ
がガ ぎギ ぐグ げゲ ごゴ
ざザ じジ ずズ ぜゼ ぞゾ
だダ ぢヂ づヅ でデ どド
ばバ びビ ぶブ べベ ぼボ
ぱパ ぴピ ぷプ ぺペ ぽポ
っッ
わワ をヲ
んン
ゃャ ゅュ ょョ
らラ りリ るル れレ ろロ`
    .split(/\s+/)
    .map(([hiragana, katakana]) => [hiragana, katakana]),
);

const SMALL_YA_GYO = new Set("ャュョ");
const MACRONIZED_VOWELS = {
  a: "ā",
  i: "ī",
  u: "ū",
  e: "ē",
  o: "ō",
};
const O_GYO_KANA = new Set("オコゴソゾトドノホボポモヨョロヲ");
const macronizeVowel = (vowel: string) => {
  return MACRONIZED_VOWELS[vowel as keyof typeof MACRONIZED_VOWELS] || vowel;
};

const isValidKanaOrDot = (
  kana: string,
): kana is keyof typeof KATAKANA_TO_ROMAJI =>
  kana === "." ||
  kana in KATAKANA_TO_ROMAJI ||
  HIRAGANA_TO_KATAKANA[kana] in KATAKANA_TO_ROMAJI;

const getKatakana = (kanaInput: string, index: number) =>
  HIRAGANA_TO_KATAKANA[kanaInput[index]] || kanaInput[index];

const getNextKatakana = (kanaInput: string, index: number) => {
  return kanaInput[index + 1] === "."
    ? getKatakana(kanaInput, index + 2)
    : getKatakana(kanaInput, index + 1);
};

const getNextCharacter = (kanaInput: string, index: number) => {
  return getKatakana(kanaInput, index + 1);
};

function kanaCharacterToRomaji(kanaInput: string, index: number) {
  const kanaCharacter = getKatakana(kanaInput, index);
  const kanaIsValid = isValidKanaOrDot(kanaCharacter);
  if (!kanaIsValid) throw new Error(`Invalid kana character: ${kanaCharacter}`);
  const nextKana = getNextKatakana(kanaInput, index);
  let isLong = nextKana === "ー";
  if (!isLong) {
    const nextKanaSpecs =
      KATAKANA_TO_ROMAJI[
        getNextCharacter(kanaInput, index) as keyof typeof KATAKANA_TO_ROMAJI
      ];

    isLong =
      (!nextKanaSpecs?.[0] &&
        nextKanaSpecs?.[1] ===
          KATAKANA_TO_ROMAJI[
            kanaCharacter as keyof typeof KATAKANA_TO_ROMAJI
          ][1] &&
        !(nextKanaSpecs?.[1] === "i" && index + 1 === kanaInput.length - 1)) ||
      (nextKana === "ウ" &&
        kanaInput[index + 1] !== "." &&
        O_GYO_KANA.has(kanaCharacter));
  }

  switch (kanaCharacter) {
    case "ー": {
      return "";
    }
    case "ッ": {
      const nextKanaCharacter = nextKana;
      if (!nextKanaCharacter) return "";
      const nextKanaIsValid = isValidKanaOrDot(nextKanaCharacter);
      if (!nextKanaIsValid)
        throw new Error(`Invalid kana character: ${nextKanaCharacter}`);
      return (
        KATAKANA_TO_ROMAJI[nextKanaCharacter][2] ??
        KATAKANA_TO_ROMAJI[nextKanaCharacter][0]
      );
    }
    case "ン": {
      const nextKanaCharacter = nextKana;
      if (!nextKanaCharacter) return "n";
      const nextKanaIsValid = isValidKanaOrDot(nextKanaCharacter);
      if (!nextKanaIsValid)
        throw new Error(`Invalid kana character: ${nextKanaCharacter}`);
      const nextRomaji = KATAKANA_TO_ROMAJI[nextKanaCharacter];
      if (!nextRomaji[0] || nextRomaji[0] === "y") return "n'";
      return "n";
    }
    case "キ":
    case "シ":
    case "チ":
    case "ニ":
    case "ヒ":
    case "ミ":
    case "リ":
    case "ギ":
    case "ジ":
    case "ヂ":
    case "ビ":
    case "ピ": {
      const romaji = KATAKANA_TO_ROMAJI[kanaCharacter];
      const nextIsSmallYaGyo = SMALL_YA_GYO.has(nextKana);
      if (nextIsSmallYaGyo)
        return romaji[0] + (Array.isArray(romaji) ? "" : "y");
      return isLong
        ? romaji[0] + macronizeVowel(romaji[1])
        : romaji[0] + romaji[1];
    }

    case "ア":
    case "イ":
    case "ウ":
    case "エ":
    case "オ":
    case "ャ":
    case "ュ":
    case "ョ":
      return isLong
        ? macronizeVowel(KATAKANA_TO_ROMAJI[kanaCharacter][1])
        : KATAKANA_TO_ROMAJI[kanaCharacter][1];

    default: {
      const romaji = KATAKANA_TO_ROMAJI[kanaCharacter];
      return isLong
        ? romaji[0] + macronizeVowel(romaji[1]!)
        : romaji[0] + romaji[1];
    }
  }
}
