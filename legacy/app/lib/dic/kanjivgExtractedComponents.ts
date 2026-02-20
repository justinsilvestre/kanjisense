import { TransformObject} from "svg-path-commander";

export const kanjiVgNonKanjiFigures = ["ヒ", "リ"];

const takeWideTopRightElement: Partial<TransformObject>= {
  scale: [1.7, 1.7],
  origin: [109 - 109 / 6, 0],
}
const takeWideRightElement: Partial<TransformObject>= {
  scale: [1.25, 1],
  origin: [109, 0],
}
const takeTallBottomElement: Partial<TransformObject>= {
  scale: [1, 1.25],
  origin: [109 / 2, 109],
}
const takeBottomRightElement: Partial<TransformObject>= {
  scale: [1.25, 1.25],
  origin: [109, 109],
}

export const kanjivgExtractedComponents: {
  [key: string]:
    | [source: string]
    | [source: string, strokes: [firstStroke: number, lastStroke: number]]
  | [source: string, strokes: [firstStroke: number, lastStroke: number], transform: Partial<TransformObject>];
} = {
  "CDP-8BBE": ["無", [1, 8]],
  "CDP-8CC6": ["長", [6, 8]], // legs and cane
  "𧘇": ["衣", [3, 6]], // skirt
  "GWS-U2FF1-U4E00-CDP-8CC6-VAR-001": ["長", [5, 8]], // old body
  "CDP-8968": ["リ"],
  "GWS-U5E1A-G": ["帰", [3, 10], takeWideRightElement],
  匕: ["ヒ"], // kvg looks like shikaru right, so using katakana HI
  "𠤎": ["匕"],
  "𫩠": ["常", [1, 8]],
  䒑: ["首", [1, 3]],
  镸: ["髟", [1, 7], {
    scale: [1.6, 1],
    origin: [109 / 6, 0],
  }],
  "𠂉": ["尓", [1, 2]],
  "CDP-8CB5": ["亦", [3, 6]],
  丅: ["敢", [1, 2], {
    scale: [2, 2],
    origin: [106 / 6, 106 / 6],
  }],
  丷: ["来", [2, 3]],
  "CDP-89CA": ["齊", [8, 10]],
  巜: ["兪", [8, 9]],
  𠀐: ["貴", [1, 5]],
  彐: ["縁", [7, 9], takeWideTopRightElement],
  𧰨: ["豕", [2, 7]],
  亼: ["合",[1, 3]],
  㐄: ["年", [3, 6]],
  'CDP-8BB8': ["舜", [1, 6]],
  舛: ["舜", [7, 13], {
    scale: [1.2, 1.4],
    origin: [109 / 2, 109 - (109 / 6)],
  }],
  夅: ["降", [4, 10], takeWideRightElement],
  粦: ["隣", [4, 16], takeWideRightElement],
  'GWS-U8FF7-K': ["謎", [8, 17], takeWideRightElement],
  'GWS-U6728-01': ["林", [1, 4]],
  '⻗': ['雲', [1, 8]],
  '𠂭': ['鹵', [5, 10]],
  '𠂇': ['左', [1,2]],
  'GWS-U20087-11': ['右', [1, 2]],
  '耒': ['耕', [1, 6]],
  'GWS-U3AC3-05': ['旅', [1, 6]],
  "迶": ['随', [4, 12]],
  'GWS-U76CA-K': ["溢", [4, 13], takeWideRightElement],
  '乑': ['衆', [7, 12], takeTallBottomElement],
  "𠂢": ['派', [4, 9], takeWideRightElement],
  "GWS-U27607-VAR-010": ['派', [6, 9], takeWideRightElement],
  'GWS-CDP-8C66-VAR-001': ['旅', [7, 10], takeBottomRightElement],
  'GWS-U22F04-03-VAR-001': ["啓", [1, 8]],
  '𠂆': ['盾', [1, 2]],
  "𦉰": ["岡", [1, 5]],
  "𦉪": ["冏", [1, 4]],
};

