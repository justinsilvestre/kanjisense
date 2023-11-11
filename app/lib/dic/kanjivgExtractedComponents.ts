export const kanjiVgNonKanjiFigures = ["ヒ", "リ"];

export const kanjivgExtractedComponents: {
  [key: string]:
    | [source: string]
    | [source: string, strokes: [firstStroke: number, lastStroke: number]];
} = {
  "CDP-8BBE": ["無", [1, 8]],
  "CDP-8CC6": ["長", [6, 8]], // legs and cane
  "𧘇": ["衣", [3, 6]], // skirt
  "GWS-U2FF1-U4E00-CDP-8CC6-VAR-001": ["長", [5, 8]], // old body
  "CDP-8968": ["リ"],
  "GWS-U5E1A-G": ["帰", [3, 10]],
  匕: ["ヒ"], // kvg looks like shikaru right, so using katakana HI
  "𠤎": ["匕"],
  "𫩠": ["常", [1, 8]],
  䒑: ["首", [1, 3]],
  镸: ["髟", [1, 7]],
  "𠂉": ["尓", [1, 2]],
  "CDP-8CB5": ["亦", [3, 6]],
  丅: ["敢", [1, 2]],
  丷: ["来", [2, 3]],
  "CDP-89CA": ["齊", [8, 10]],
  巜: ["兪", [8, 9]],
  𠀐: ["貴", [1, 5]],
};
