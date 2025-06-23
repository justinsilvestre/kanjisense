import fs from "fs";
import path from "path";

import { kanjivgExtractedComponents } from "./dic/kanjivgExtractedComponents";

const libDirectory = (function () {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return __dirname;
  } catch (e) {
    return import.meta.url.replace("file:/", "").replace("files.server.ts", "");
  }
})();

export const files = {
  kanjidicInput1: vendor("kanjidic/kanji_bank_1.json"),
  kanjidicInput2: vendor("kanjidic/kanji_bank_2.json"),
  unihanReadings15: vendor("unihan/Unihan_Readings.txt"),
  unihanRadicals15: vendor("unihan/Unihan_RadicalStrokeCounts.txt"),
  unihanIrgSources15: vendor("unihan/Unihan_IRGSources.txt"),
  unihanVariants12: vendor("unihan/Unihan_Variants_12.txt"),
  unihanVariants14: vendor("unihan/Unihan_Variants_14.txt"),
  kanjiDbOldStyle: vendor("kanjidb/jp-old-style.txt"),
  kanjiDbHyogaiVariants: vendor("kanjidb/hyogai-variants.txt"),
  kanjiDbJinmeiVariants: vendor("kanjidb/jinmei-variants.txt"),
  kanjiDbBorrowedInput: vendor("kanjidb/jp-borrowed.txt"),
  kanjiDbTwEduVariants: vendor("kanjidb/twedu-variants.txt"),
  kanjiDbHanyuDaCidianVariants: vendor("kanjidb/hydzd-variants.txt"),
  kanjiDbIdsCdpTxt: vendor("kanjidb/ids-cdp.txt"),
  kanjiDbAnalysisTxt: vendor("kanjidb/ids-analysis.txt"),
  kanjiDBShuowenCharacters: vendor("kanjidb/shuowenCharacters.txt"),
  nk2028GuangyunYuntu: vendor("nk2028/guangyun-yuntu-廣韻反切音韻地位表.csv"),
  nk2028YunjingCsv: vendor("nk2028/qieyun-data-guyiconshu-yunjing.csv"),
  scriptinAozoraFrequenciesJson: vendor("scriptin/aozora.json"),
  componentsDictionaryYml: dic("componentsDictionary.yml"),
  sbgyJson: dic("sbgy.json"),
  sbgyNotesJson: dic("sbgyNotes.json"),
  joyoWikipediaTsv: vendor("wikipedia/joyoWikipedia.tsv"),
  jmdictXml: vendor("edict/JMdict_e"),
};

function vendor<S extends string>(string: S) {
  return path.resolve(
    libDirectory,
    "vendor",
    string,
  ) as `${string}/vendor/${S}`;
}
function dic<S extends string>(string: S) {
  return path.resolve(libDirectory, "dic", string) as `${string}/vendor/${S}`;
}

function readTextFileSync<T>(filepath: string) {
  return fs.readFileSync(filepath, "utf-8") as T;
}
export function readJsonSync<T>(filepath: string) {
  return JSON.parse(readTextFileSync(filepath)) as T;
}

export function getKvgFilePath(character: string) {
  const sourceCharacter =
    kanjivgExtractedComponents[character]?.[0] || character;
  const filename = `${sourceCharacter
    .codePointAt(0)
    ?.toString(16)
    .padStart(5, "0")}.svg`;
  return path.resolve(libDirectory, "vendor", "kanjivg", "svgs", filename);
}

export function getGlyphwikiSvgFilePath(figureKey: string) {
  const filename = `${
    [...figureKey].length === 1 ? getGlyphWikiCode(figureKey) : figureKey
  }.svg`;
  return path.resolve(libDirectory, "vendor", "glyphwiki", "svgs", filename);
}

export function getGlyphWikiCode(key: string) {
  if ([...key].length === 1) {
    const uCode = key.codePointAt(0)?.toString(16);
    return `u${uCode}`;
  } else if (key.startsWith("GWS")) {
    return key.slice(4);
  } else if (key.startsWith("CDP")) {
    return key;
  } else {
    throw new Error(key);
  }
}

export function getShuowenFilePath(filenameCharacters: string) {
  return path.resolve(
    libDirectory,
    "..",
    "..",
    "assets",
    "shuowenSvgs",
    Array.from(filenameCharacters, (char) =>
      char.codePointAt(0)!.toString(16),
    ).join("-") + ".svg",
  );
}

export function getGlyphsFilePath(char: string) {
  return path.resolve(
    libDirectory,
    "..",
    "..",
    "assets",
    "glyphs",
    char.codePointAt(0)!.toString(16) + ".json",
  );
}
