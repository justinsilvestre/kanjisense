import fs from "fs";
import path from "path";

import { kanjivgExtractedComponents } from "./dic/kanjivgExtractedComponents";

export const files = {
  kanjidicInput1: vendor("kanjidic/kanji_bank_1.json"),
  kanjidicInput2: vendor("kanjidic/kanji_bank_2.json"),
  unihanReadings15: vendor("unihan/Unihan_Readings.txt"),
  unihanVariants12: vendor("unihan/Unihan_Variants_12.txt"),
  unihanVariants14: vendor("unihan/Unihan_Variants_14.txt"),
  kanjiDbOldStyle: vendor("kanjiDb/jp-old-style.txt"),
  kanjiDbHyogaiVariants: vendor("kanjiDb/hyogai-variants.txt"),
  kanjiDbJinmeiVariants: vendor("kanjiDb/jinmei-variants.txt"),
  kanjiDbBorrowedInput: vendor("kanjiDb/jp-borrowed.txt"),
  kanjiDbTwEduVariants: vendor("kanjiDb/twedu-variants.txt"),
  kanjiDbHanyuDaCidianVariants: vendor("kanjiDb/hydzd-variants.txt"),
  kanjiDbIdsCdpTxt: vendor("kanjiDb/ids-cdp.txt"),
  kanjiDbAnalysisTxt: vendor("kanjiDb/ids-analysis.txt"),
  nk2028GuangyunYuntu: vendor("nk2028/guangyun-yuntu-廣韻反切音韻地位表.csv"),
  nk2028YunjingCsv: vendor("nk2028/qieyun-data-guyiconshu-yunjing.csv"),
  scriptinAozoraFrequenciesJson: vendor("scriptin/aozora.json"),
  componentsDictionaryYml: dic("componentsDictionary.yml"),
  sbgyJson: dic("sbgy.json"),
  sbgyNotesJson: dic("sbgyNotes.json"),
};

function vendor<S extends string>(string: S) {
  return path.resolve(__dirname, "vendor", string) as `${string}/vendor/${S}`;
}
function dic<S extends string>(string: S) {
  return path.resolve(__dirname, "dic", string) as `${string}/vendor/${S}`;
}

function readTextFileSync<T>(filepath: string) {
  return fs.readFileSync(filepath, "utf-8") as T;
}
export function readJsonSync<T>(filepath: string) {
  return JSON.parse(readTextFileSync(filepath)) as T;
}

export function getKvgPath(character: string) {
  const sourceCharacter =
    kanjivgExtractedComponents[character]?.[0] || character;
  const filename = `${sourceCharacter
    .codePointAt(0)
    ?.toString(16)
    .padStart(5, "0")}.svg`;
  return path.resolve(__dirname, "vendor", "kanjivg", "svgs", filename);
}
