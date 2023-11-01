import fs from "fs";
import path from "path";

export const files = {
  kanjidicInput1: vendor("kanjidic/kanji_bank_1.json"),
  kanjidicInput2: vendor("kanjidic/kanji_bank_2.json"),
};

function vendor<S extends string>(string: S) {
  return path.resolve(__dirname, "vendor", string) as `${string}/vendor/${S}`;
}

function readTextFileSync<T>(filepath: string) {
  return fs.readFileSync(filepath, "utf-8") as T;
}
export function readJsonSync<T>(filepath: string) {
  return JSON.parse(readTextFileSync(filepath)) as T;
}
