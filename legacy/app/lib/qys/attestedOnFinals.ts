// source: 日本漢字音・中国中古音対応表 小出敦
// first entered from composite kan-go table,
// then double-checked with kan summary table.

import { QieyunRhymeCycleHead } from "~/lib/qys/QieyunRhymeCycleHead";

export type FinalCodeSuffix =
  | "3h4"
  | "ah4"
  | "3h"
  | "h4"
  | "ah"
  | "a4"
  | "34"
  | "a"
  | "h"
  | "3"
  | "4"
  | "";

export type FinalCode = `${QieyunRhymeCycleHead}${FinalCodeSuffix}`;

/** 唇音 */
const LABIAL = "LABIAL";
/** 牙音 */
const VELAR = "VELAR";
/** 喉音 */
const PHARYNGEAL = "PHARYNGEAL";
/** 牙喉音 */
const GUTTURAL = "GUTTURAL";
/** 歯音 */
const CORONAL = "CORONAL";
/** 歯音(三等) */
const PALATAL = "PALATAL";
/** 歯音(二等) */
const RETROFLEX = "RETROFLEX";
/** 歯音(四一等) */
const ALVEOLAR = "ALVEOLAR";
/** 舌音 */
const LINGUAL = "LINGUAL";

type Place =
  | typeof LABIAL
  | typeof VELAR
  | typeof PHARYNGEAL
  | typeof GUTTURAL
  | typeof CORONAL
  | typeof PALATAL
  | typeof RETROFLEX
  | typeof ALVEOLAR
  | typeof LINGUAL;

export type SpecialInitial = "影" | "云" | "以" | "日" | "明" | "來";
// these ones can have their own rows in the table
export const SPECIAL_INITIALS = new Set<SpecialInitial>([
  "影",
  "云",
  "以",
  "日",
  "明",
  "來",
]);

const LABIALS = new Set("幫滂並明");
const ALVEOLARS = new Set("精清從心邪");
const LINGUALS = new Set("端透定泥來知徹澄娘孃");
const RETROFLEXES = new Set("莊初崇生俟");
const PALATALS = new Set("章昌常書船");
const VELARS = new Set("見溪群羣疑");
const PHARYNGEALS = new Set("影曉匣云以");

const GUTTURALS = new Set([...VELARS, ...PHARYNGEALS]);
const CORONALS = new Set(["日", ...RETROFLEXES, ...PALATALS, ...ALVEOLARS]);

const SPECIFICITY_LEVEL_2: [Set<string>, Place][] = [
  [GUTTURALS, GUTTURAL],
  [CORONALS, CORONAL],
];

const SPECIFICITY_LEVEL_3: [Set<string>, Place][] = [
  [LABIALS, LABIAL],
  [ALVEOLARS, ALVEOLAR],
  [LINGUALS, LINGUAL],
  [RETROFLEXES, RETROFLEX],
  [PALATALS, PALATAL],
  [VELARS, VELAR],
  [PHARYNGEALS, PHARYNGEAL],
];

export function getCategoriesBySpecificityDescending(
  initialCanonical: string,
): (Place | SpecialInitial)[] {
  const categories: (Place | SpecialInitial)[] = [];
  if (SPECIAL_INITIALS.has(initialCanonical as SpecialInitial))
    categories.push(initialCanonical as SpecialInitial);

  const level2Category = SPECIFICITY_LEVEL_2.find(([initials]) =>
    initials.has(initialCanonical),
  )?.[1];
  const level3Category = SPECIFICITY_LEVEL_3.find(([initials]) =>
    initials.has(initialCanonical),
  )?.[1];

  if (level2Category) categories.push(level2Category as Place);
  if (level3Category) categories.push(level3Category as Place);

  return categories;
}

const iYi: FinalsSet = {
  LABIAL: ["i", "i"],
  GUTTURAL: ["i", "i"],
  // "二三四等" -- need we exclude 1等?
  CORONAL: ["i", "i"],
  LINGUAL: ["i", "i"],
};
const wiiWiWiri: FinalsSet = {
  [LABIAL]: ["i", "i"],
  [GUTTURAL]: ["uwi", "uwi"],
  // "二三四等" -- need we exclude 1等?
  [CORONAL]: ["ui", "ui"],
  [LINGUAL]: ["ui", "ui"],
};

const iiYii: FinalsSet = {
  LABIAL: ["i", "i"],
  GUTTURAL: ["i", "i"],
  // "二三四等" -- need we exclude 1等?
  CORONAL: ["i", ["i", "e"]],
  LINGUAL: ["i", "i"],
};
const ywiiYwi: FinalsSet = {
  [LABIAL]: ["i", "i"],
  [GUTTURAL]: ["i", "uwi"],
  以: ["uwi", "iYui"],
  // "二三四等" -- need we exclude 1等?
  [CORONAL]: ["ui", "ui"],
  [LINGUAL]: ["ui", "ui"],
};

const aoiYaoiAi: FinalsSet = {
  LABIAL: ["ai", "ai"],
  GUTTURAL: ["ai", ["ai", "*e"]],
  CORONAL: ["ai", "ai"],
  LINGUAL: ["ai", "ai"],
};
const wauiWai: FinalsSet = {
  LABIAL: ["ai", "ai"],
  GUTTURAL: ["uWai", "uwe"],
  CORONAL: ["ai", "ai"],
  LINGUAL: ["ai", ["ai", "*ui", "*a"]],
};

const areAreiAri: FinalsSet = {
  LABIAL: ["ai", "ai"],
  GUTTURAL: ["ai", ["ai", "e"]],
  CORONAL: ["ai", "ai"],
  LINGUAL: ["ai", "ai"],
};
const wareWareiWari: FinalsSet = {
  LABIAL: ["ai", "ai"],
  GUTTURAL: [
    ["uWai", "uWa"],
    ["uwe", "*uWa"],
  ],
  CORONAL: ["ai", "ai"],
  LINGUAL: ["ai", "ai"],
};

const ieiYei: FinalsSet = {
  LABIAL: ["ei", "ei"],
  GUTTURAL: ["ei", ["ei", "*e"]],
  PALATAL: ["ei", ["ei", "*e"]],
  ALVEOLAR: ["ei", "ai"],
  RETROFLEX: ["?ei", null],
  LINGUAL: ["ei", ["ei", "*ai"]],
};
const wieiYwiei: FinalsSet = {
  LABIAL: ["ei", "ei"],
  GUTTURAL: ["ei", ["ei", "ei"]],
  以: ["ei", "ei"],
  PALATAL: ["ei", ["ei", "*e"]],
  ALVEOLAR: ["ei", "ai"],
  RETROFLEX: ["?ei", null],
  日: ["?ei", null],
  LINGUAL: ["ei", null],
};

const eiYeai: FinalsSet = {
  LABIAL: ["ei", ["ei", "*ai"]],
  GUTTURAL: ["ei", ["ei", "*e"]],
  CORONAL: ["ei", "ai"],
  LINGUAL: ["ei", ["ai", "ei", "*e"]],
};

const winYwin: FinalsSet = {
  GUTTURAL: [
    ["uwiMu", "iMu"],
    ["uwiMu", "iMu"],
  ],
  CORONAL: [
    ["iYuMu", "*iMu"],
    ["iYuMu", "*iMu"],
  ],
  LINGUAL: ["iYuMu", "iYuMu"],
  來: ["iMu", "iMu"],
};

const aenArn: FinalsSet = {
  LABIAL: ["aMu", ["eMu", "aMu"]],
  GUTTURAL: ["aMu", ["eMu", "aMu"]],
  CORONAL: ["aMu", ["eMu", "*aMu"]],
  LINGUAL: ["aMu", ["eMu", "aMu"]],
};
const waenWarn: FinalsSet = {
  LABIAL: ["aMu", ["eMu", "aMu"]],
  GUTTURAL: ["uWaMu", "uweMu"],
  //  unattested; generalizing
  CORONAL: ["?aMu", null],
  LINGUAL: ["aMu", "eMu"],
};

// TODO: check, should there be uwe here?
const ienYen: FinalsSet = {
  LABIAL: ["eMu", ["eMu", "*iMu"]],
  GUTTURAL: ["eMu", "eMu"],
  CORONAL: ["eMu", "eMu"],
  LINGUAL: ["eMu", "eMu"],
};

const ieuYeuEu: FinalsSet = {
  LABIAL: ["eu", "eu"],
  GUTTURAL: ["eu", "eu"],
  CORONAL: ["eu", "eu"],
  LINGUAL: ["eu", "eu"],
};

const aengArng: FinalsSet = {
  LABIAL: ["au", ["au", "iYau"]],
  GUTTURAL: ["au", ["iYau", "*au"]],
  CORONAL: [["au", "ei"], "iYau"],
  LINGUAL: [
    ["au", "*ei"],
    ["iYau", "au"],
  ],
};
const waengWarng: FinalsSet = {
  LABIAL: ["au", ["au", "iYau"]],
  GUTTURAL: ["uWau", "uWau"],
};

const yiengIeng: FinalsSet = {
  LABIAL: ["ei", "iYau"],
  GUTTURAL: ["ei", ["iYau", "*au"]],
  // only 3, 4 deng
  CORONAL: ["ei", "iYau"],
  LINGUAL: ["ei", "iYau"],
};

const imYim: FinalsSet = {
  LABIAL: ["iMu", "oMu"],
  GUTTURAL: ["iMu", ["oMu", "*iMu"]],
  以: ["iMu", "iMu"],
  CORONAL: ["iMu", "iMu"],
  LINGUAL: ["iMu", "iMu"],
};

const aemArm: FinalsSet = {
  LABIAL: ["?aMu", null],
  GUTTURAL: ["aMu", ["aMu", "eMu"]],
  CORONAL: ["aMu", null],
  LINGUAL: ["aMu", ["aMu", "eMu"]],
};

const yermYwarm: FinalsSet = {
  LABIAL: ["aMu", "oMu"],
  LINGUAL: ["?aMu", null],
  GUTTURAL: ["eMu", ["oMu", "eMu"]],
};

const emIemYem: FinalsSet = {
  LABIAL: ["eMu", "eMu"],
  GUTTURAL: ["eMu", "eMu"],
  CORONAL: ["eMu", "eMu"],
  LINGUAL: ["eMu", "eMu"],
};

const ookOk: FinalsSet = {
  LABIAL: ["oku", "oku"],
  GUTTURAL: ["oku", "oku"],
  影: ["uwoku", "uwoku"],
  CORONAL: ["oku", "oku"],
  LINGUAL: ["oku", "oku"],
};

const at: FinalsSet = {
  LABIAL: ["atu", ["atu", "ati"]],
  GUTTURAL: ["atu", ["atu", "ati"]],
  CORONAL: ["atu", ["atu", "ati"]],
  LINGUAL: ["atu", ["atu", "ati"]],
};

const aetArt: FinalsSet = {
  LABIAL: [
    ["atu", "*ati"],
    ["atu", "ati"],
  ],
  GUTTURAL: ["atu", null],
  CORONAL: ["atu", ["atu", "ati", "etu", "eti"]],
  LINGUAL: ["atu", null],
};
const waetWart: FinalsSet = {
  LABIAL: [
    ["atu", "*ati"],
    ["atu", "ati"],
  ],
  GUTTURAL: ["uWatu", "uWatu"],
  CORONAL: ["atu", null],
  LINGUAL: ["?atu", null],
};

const aekArk: FinalsSet = {
  LABIAL: ["aku", ["iYaku", "aku"]],
  GUTTURAL: ["aku", ["iYaku", "aku"]],
  CORONAL: [
    ["aku", "*eki"],
    ["iYaku", "aku"],
  ],
  LINGUAL: ["aku", ["iYaku", "aku"]],
};
const waekWark: FinalsSet = {
  LABIAL: ["aku", ["iYaku", "aku"]],
  GUTTURAL: ["uWaku", ["uwiYaku", "uWaku"]],
  CORONAL: ["?aku", null],
  LINGUAL: ["?aku", null],
};
const ierkYek: FinalsSet = {
  LABIAL: ["eki", "iYaku"],
  GUTTURAL: ["eki", "iYaku"],
  // only 3 and 4 deng
  CORONAL: ["eki", "iYaku"],
  LINGUAL: ["eki", "iYaku"],
};

const ipYip: FinalsSet = {
  // unattested; generalizing from below
  LABIAL: ["?ipu", null],
  GUTTURAL: ["ipu", ["ipu", "*opu"]],
  // 2, 3, 4 deng
  CORONAL: ["ipu", "ipu"],
  LINGUAL: ["ipu", "ipu"],
};

const aepArp: FinalsSet = {
  GUTTURAL: ["apu", ["apu", "epu"]],
  LINGUAL: ["apu", null],
  CORONAL: ["apu", null],
};
const yepYwexp: FinalsSet = {
  LABIAL: ["apu", "opu"],
  GUTTURAL: ["epu", ["opu", "epu"]],
  LINGUAL: ["?apu", null],
};
const epIepYep: FinalsSet = {
  GUTTURAL: ["epu", "epu"],
  // 2, 3, 4 deng
  CORONAL: ["epu", "epu"],
  LINGUAL: ["epu", "epu"],
};

export type FinalsSet = Partial<
  Record<Place | SpecialInitial, readonly [KanOnFinals, GoOnFinals]>
>;
type KanOnFinals = KanOnFinal | readonly [...KanOnFinal[]];
type GoOnFinals = GoOnFinal | readonly [...GoOnFinal[]] | null;

type KanOnFinal = `${"?" | "*" | ""}${OnyomiFinal}`;
type GoOnFinal = `${"*" | ""}${OnyomiFinal}`;
type OnyomiFinal =
  | "a"
  | "ai"
  | "au"
  | "aMu"
  | "apu"
  | "ati"
  | "atu"
  | "aku"
  | "e"
  | "ei"
  | "eu"
  | "eMu"
  | "epu"
  | "eti"
  | "etu"
  | "eki"
  | "i"
  | "iu"
  | "iMu"
  | "ipu"
  | "iti"
  | "itu"
  | "iki"
  | "iku"
  | "o"
  | "ou"
  | "oMu"
  | "opu"
  | "oti"
  | "otu"
  | "oku"
  | "u"
  | "ui"
  | "uu"
  | "uMu"
  | "utu"
  | "uku"
  | "iYa"
  | "iYau"
  | "iYaku"
  | "iYo"
  | "iYou"
  | "iYoku"
  | "iYu"
  | "iYui"
  | "iYuu"
  | "iYuMu"
  | "iYutu"
  | "iYuku"
  | "uWa"
  | "uWai"
  | "uWau"
  | "uWaMu"
  | "uWatu"
  | "uWati"
  | "uWaku"
  | "uwe"
  | "uwei"
  | "uweMu"
  | "uweti"
  | "uwetu"
  | "uweki"
  | "uwi"
  | "uwiMu"
  | "uwitu"
  | "uwiki"
  | "uwo"
  | "uwou"
  | "uwoMu"
  | "uwoti"
  | "uwotu"
  | "uwoku"
  | "uwiYau"
  | "uwiYaku"
  | "uwiYo"
  | "uwiYou";

const she1通: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 通 ****************/
  // 通東 屋
  東: {
    // oong /ung/
    LABIAL: ["ou", "u"],
    影: ["uwou", null],
    GUTTURAL: ["ou", ["u", "uu"]],
    CORONAL: ["ou", ["ou", "*iYuu"]],
    LINGUAL: ["ou", ["ou", "uu", "u"]],
  },
  東3: {
    // irung /jung/
    LABIAL: [
      ["uu", "ou"],
      ["u", "uu"],
    ],
    明: ["ou", "u"],
    GUTTURAL: ["iu", ["u", "uu"]],
    以: ["iu", "iYu"],
    RETROFLEX: [
      ["uu", "ou"],
      ["iYu", "ou"],
    ],
    PALATAL: ["iu", ["iYu", "*u", "*iu"]],
    ALVEOLAR: [["iu", "uu"], null],
    日: ["iu", null],
    LINGUAL: ["iu", "iu"],
  },
  東4: ookOk, // ook /uk/
  東34: {
    // iuk /iuk/
    LABIAL: ["uku", "uku"],
    明: ["oku", "oku"],
    GUTTURAL: ["iku", "iku"],
    // for iYuku readings below:
    // daikanwa (among others) says kan'on iYuku (宿 is iYuku uku)
    // going for daikanwa for preservation of U vowel and for closeness to familiar readings
    RETROFLEX: ["iYuku", "iku"],
    PALATAL: ["iYuku", "iku"],
    ALVEOLAR: ["iYuku", ["iku", "*uku"]],
    日: ["iku", "iku"],
    LINGUAL: ["iku", "iku"],
    來: ["iku", "oku"],
  },

  // 通冬 沃
  冬: {
    LABIAL: ["ou", "u"],
    GUTTURAL: ["ou", ["u", "uu"]],
    CORONAL: ["ou", ["ou", "*iYuu"]],
    LINGUAL: ["ou", ["ou", "uu", "u"]],
  },
  // daikanwa gives YOKU for 沃 qwuok
  冬4: ookOk,

  // 通鍾 燭
  鍾: {
    LABIAL: [["ou"], ["u", "uu"]],
    GUTTURAL: ["uwiYou", ["u", "uu"]],
    以: ["iYou", ["iYu", "iYuu", "iYou"]],
    PALATAL: ["iYou", "iYu"],
    ALVEOLAR: ["iYou", ["iYu", "iYuu", "*u"]],
    日: ["iYou", null],
    LINGUAL: ["iYou", "iu"],
  },
  鍾4: {
    LABIAL: ["oku", "oku"],
    GUTTURAL: ["iYoku", "oku"],
    以: ["iYoku", "iYoku"],
    PALATAL: [["iYoku", "*oku"], "oku"],
    ALVEOLAR: ["iYoku", "oku"],
    日: ["iYoku", "iku"],
    來: ["iYoku", "oku"],
    // unattested for general category; generalizing from 來
    LINGUAL: ["?iYoku", null],
  },
} as const;
const she2江: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 江 ****************/
  // 江江
  江: {
    LABIAL: ["au", ["au", "*ou"]],
    GUTTURAL: ["au", "au"],
    CORONAL: ["au", ["au", "ou"]],
    LINGUAL: ["au", "au"],
  },
  江4: {
    LABIAL: ["aku", ["aku", "*oku"]],
    明: ["aku", "iYaku"],
    GUTTURAL: ["aku", ["aku", "*oku"]],
    CORONAL: ["aku", ["aku", "*oku"]],
    LINGUAL: ["aku", ["aku", "*iYoku", "*iYaku"]],
  },
} as const;
const she3止: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 止 ****************/

  // 止支A

  // 止支B
  支: iiYii,
  支ah: ywiiYwi,
  支h: wiiWiWiri,

  // 止脂A
  // 止脂B
  脂: iYi,
  脂ah: ywiiYwi,

  脂h: wiiWiWiri,

  // 止之
  之: {
    LABIAL: ["i", "i"],
    GUTTURAL: ["i", "o"],
    // "二三四等" -- need we exclude 1等?
    CORONAL: ["i", "i"],
    LINGUAL: ["i", "i"],
  },

  // 止微
  微: {
    LABIAL: ["i", "i"],
    GUTTURAL: ["i", "e"],
    // "二三四等" -- need we exclude 1等?
    CORONAL: ["i", "i"],
    LINGUAL: ["i", "i"],
  },
  微h: wiiWiWiri,
} as const;
const she4遇: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 遇 ****************/

  // 遇魚
  魚: {
    GUTTURAL: ["iYo", ["o", "*iYo"]],
    以: ["iYo", "iYo"],
    RETROFLEX: [
      ["o", "iYo"],
      ["o", "iYo"],
    ],
    PALATAL: ["iYo", ["iYo", "*o"]],
    ALVEOLAR: [
      ["iYo", "*o"],
      ["o", "iYo"],
    ],
    日: ["iYo", "iYo"],
    LINGUAL: ["iYo", "iYo"],
    來: ["iYo", ["o", "iYo"]],
  },

  // 遇模
  模: {
    LABIAL: ["o", ["u", "o"]],
    GUTTURAL: ["o", ["o", "*u"]],
    影: ["uwo", ["u", "uwo"]],
    CORONAL: ["o", ["o", "*u"]],
    LINGUAL: ["o", ["u", "o"]],
  },

  // 遇虞
  虞: {
    LABIAL: ["u", "u"],
    GUTTURAL: [["u", "*ou"], "u"],
    以: [
      ["iYu", "*iu"],
      ["iYu", "*iu"],
    ],
    RETROFLEX: [["uu", "u"], "iYu"],
    PALATAL: [
      ["iYu", "*iu", "*uu"],
      ["iYu", "*u"],
    ],
    ALVEOLAR: [
      ["iYu", "*iu"],
      ["iYu", "u"],
    ],
    日: ["iYu", "iu"],
    LINGUAL: ["iu", ["iu", "*u"]],
    來: ["u", "u"],
  },
} as const;
const she5蟹: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 蟹 ****************/

  // 蟹
  泰: aoiYaoiAi,
  泰h: wauiWai,

  // 蟹廢
  廢: {
    LABIAL: ["ai", ["ai", "*ei"]],
    GUTTURAL: ["ai", "ai"],
  },
  廢h: {
    LABIAL: ["ai", ["ai", "*ei"]],
    GUTTURAL: ["uWai", "uwe"],
  },

  // 蟹夬
  夬: areAreiAri,
  夬h: wareWareiWari,

  // 蟹佳
  佳: {
    LABIAL: ["ai", "ai"],
    GUTTURAL: [
      ["ai", "a"],
      ["ai", "e"],
    ],
    CORONAL: ["ai", "ai"],
    LINGUAL: ["ai", "ai"],
  },
  佳h: {
    LABIAL: ["ai", "ai"],
    GUTTURAL: [
      ["uWai", "uWa"],
      ["uwe", "*uWa"],
    ],
    CORONAL: ["ai", "ai"],
    LINGUAL: ["ai", "ai"],
  },

  // 蟹皆
  皆: areAreiAri,
  皆h: wareWareiWari,

  // 蟹祭A
  祭a: ieiYei,
  祭ah: wieiYwiei,

  // 蟹祭B
  祭: ieiYei,
  祭h: wieiYwiei,

  // 蟹齊
  齊: eiYeai,
  齊h: {
    LABIAL: ["ei", ["ei", "*ai"]],
    GUTTURAL: [
      ["uwei", "ei"],
      ["uwe", "*uwei"],
    ],
    CORONAL: ["ei", "ai"],
    LINGUAL: ["ei", ["ai", "ei", "*e"]],
  },
  齊3: eiYeai,

  // 蟹咍
  咍: aoiYaoiAi,

  // 蟹灰
  灰: wauiWai,
} as const;
const she6臻: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 臻 ****************/

  // 臻眞A 質
  眞a: {
    LABIAL: ["iMu", "iMu"],
    GUTTURAL: ["iMu", "iMu"],
    CORONAL: ["iMu", "iMu"],
    LINGUAL: ["iMu", "iMu"],
  },
  眞a4: {
    LABIAL: ["itu", ["itu", "iti"]],
    GUTTURAL: [
      ["itu", "*iti"],
      ["itu", "iti"],
    ],
    CORONAL: [
      ["itu", "*iti"],
      ["itu", "iti"],
    ],
    LINGUAL: ["itu", "itu"],
  },

  // 臻眞B 質
  眞: {
    LABIAL: ["iMu", "iMu"],
    GUTTURAL: ["iMu", "oMu"],
    CORONAL: ["iMu", "iMu"],
    LINGUAL: ["iMu", "iMu"],
  },
  眞h: winYwin,
  眞4: {
    LABIAL: ["itu", ["itu", "iti"]],
    GUTTURAL: ["itu", "otu"],
    CORONAL: [
      ["itu", "*iti"],
      ["itu", "iti"],
    ],
    LINGUAL: ["itu", "itu"],
  },
  // TODO: check if should be WI
  眞h4: {
    LABIAL: ["itu", ["itu", "iti"]],
    RETROFLEX: [["otu", "*iYutu"], "otu"],
    // 3, 4 deng
    CORONAL: ["iYutu", "iYutu"],
    LINGUAL: ["iYutu", "iYutu"],
    來: ["itu", ["itu", "iti"]],
    // unattested, inferring from nasal ending counterpart:
    GUTTURAL: [["?uwitu", "?itu"], null],
  },
  // 臻諄 術 ywit
  眞ah4: {
    LABIAL: ["itu", ["itu", "iti"]],
    GUTTURAL: ["itu", ["itu", "iti"]],
    RETROFLEX: [["otu", "*iYutu"], "iYutu"],
    PALATAL: ["iYutu", "iYutu"],
    ALVEOLAR: ["iYutu", "iYutu"],
    LINGUAL: ["iYutu", "iYutu"],
    來: ["itu", ["itu", "iti"]],
  },
  // 臻臻 櫛
  臻: {
    LABIAL: ["iMu", "iMu"],
    GUTTURAL: ["iMu", "oMu"],
    CORONAL: ["iMu", "iMu"],
    LINGUAL: ["iMu", "iMu"],
  },
  臻4: {
    RETROFLEX: [
      ["itu", "*iti"],
      ["itu", "iti"],
    ],
  },

  // 臻痕 0
  痕: {
    LABIAL: ["oMu", "oMu"],
    GUTTURAL: ["oMu", "oMu"],
    LINGUAL: ["oMu", "oMu"],
  },
  // actually, not attested at all?
  痕4: {
    LABIAL: ["otu", "otu"],
    GUTTURAL: ["otu", null],
  },

  // 臻魂 沒
  魂: {
    LABIAL: ["oMu", "oMu"],
    GUTTURAL: ["oMu", "oMu"],
    影: ["uwoMu", ["uwoMu", "*uMu"]],
    CORONAL: ["oMu", ["oMu", "*uMu"]],
    LINGUAL: ["oMu", "oMu"],
  },
  魂4: {
    LABIAL: ["otu", "otu"],
    GUTTURAL: ["otu", "otu"],
    影: ["uwotu", null],
    CORONAL: ["otu", ["otu", "oti"]],
    LINGUAL: ["otu", null],
  },

  // 臻欣 迄
  // irn collapsed with yun in kan-go table
  // but only occurs with gutturals in guangyun data
  欣: {
    GUTTURAL: ["iMu", ["oMu", "*iMu"]],
  },
  欣4: { GUTTURAL: ["itu", "oti"] },
  // 臻文 物
  文: {
    LABIAL: ["uMu", ["uMu", "*oMu"]],
    明: ["uMu", "oMu"],
    GUTTURAL: ["uMu", "uMu"],
  },
  文4: {
    LABIAL: ["utu", ["otu", "utu"]],
    明: ["utu", ["otu", "oti"]],
    GUTTURAL: ["utu", "utu"],
  },
} as const;
const she7山: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 山 ****************/
  // 山寒 曷
  寒: {
    LABIAL: ["aMu", "aMu"],
    GUTTURAL: ["aMu", "aMu"],
    CORONAL: ["aMu", "aMu"],
    LINGUAL: ["aMu", "aMu"],
  },
  寒4: at,

  // 山桓 末
  寒h: {
    LABIAL: ["aMu", "aMu"],
    CORONAL: ["aMu", "aMu"],
    GUTTURAL: ["uWaMu", "uWaMu"],
    LINGUAL: ["aMu", "aMu"],
  },
  寒h4: {
    LABIAL: ["atu", ["atu", "ati"]],
    GUTTURAL: ["uWatu", "uWatu"],
    CORONAL: ["atu", "atu"],
    LINGUAL: ["atu", "atu"],
  },
  // [FinalsCodes.at]:   at, // c1n1 appears never used

  // 山元 月
  元: {
    LABIAL: ["aMu", ["oMu", "aMu", "*eMu"]],
    GUTTURAL: ["eMu", ["oMu", "*aMu", "*eMu"]],
  },
  // *perhaps we should mark here
  // that uwoMu is only for whole reading woMu, not -uwoMu.
  // (the same goes for other uwo- readings.)
  元h: {
    LABIAL: ["aMu", ["oMu", "aMu", "*eMu"]],
    GUTTURAL: ["uweMu", ["uwoMu", "uWaMu", "uweMu"]],
  },
  元4: {
    LABIAL: ["atu", ["otu", "atu", "ati"]],
    GUTTURAL: ["etu", "atu"],
  },
  元h4: {
    LABIAL: ["atu", ["otu", "atu", "ati"]],
    GUTTURAL: ["uwetu", ["uwoti", "uWatu", "uWati"]],
  },

  // 山刪 鎋轄
  刪: aenArn,
  刪h: waenWarn,
  刪4: aetArt,
  刪h4: waetWart,

  // 山山 黠
  山: aenArn,
  山h: waenWarn,
  山4: aetArt,
  山h4: waetWart,

  // 山仙A 薛

  // 山仙B 薛
  仙: ienYen,
  仙ah: {
    LABIAL: ["eMu", ["eMu", "*iMu"]],
    GUTTURAL: ["eMu", "eMu"],
    CORONAL: ["eMu", ["eMu", "*aMu"]],
    LINGUAL: ["eMu", "eMu"],
  },
  仙4: {
    LABIAL: ["etu", "etu"],
    GUTTURAL: ["etu", "etu"],
    // marked as 3 and 4 deng
    CORONAL: ["etu", ["etu", "eti"]],
    LINGUAL: ["etu", "etu"],
  },
  仙h4: {
    LABIAL: ["etu", "etu"],
    // rounded guttural marked as 4th deng in table,
    GUTTURAL: ["etu", ["etu", "eti"]],
    // coronal marked as 3 and 4 deng
    CORONAL: ["etu", ["etu", "eti"]],
    LINGUAL: ["etu", "etu"],
  },
  仙h: {
    LABIAL: ["eMu", ["eMu", "*iMu"]],
    GUTTURAL: ["uweMu", ["uweMu", "*uwiMu", "*uWaMu", "*oMu"]],
    CORONAL: ["eMu", ["eMu", "*aMu"]],
    LINGUAL: ["eMu", "eMu"],
  },

  // 山先 屑
  先: {
    // dai kanwa shows *iMu for 眠 as kan'you on, suggesting:
    // LABIAL: ["eMu", "eMu"],
    LABIAL: [["eMu", "*iMu"], "eMu"],
    GUTTURAL: ["eMu", "eMu"],
    CORONAL: ["eMu", "eMu"],
    LINGUAL: ["eMu", "eMu"],
  },
  // these are collapsed with round 仙 in kan-on summary table
  // though in the combined kan-go table,
  // only LABIAL and GUTTURAL are attested for round 先
  先h: {
    LABIAL: [["eMu", "*iMu"], "eMu"],
    GUTTURAL: ["uweMu", "uweMu"],
  },
  先4: {
    LABIAL: ["etu", "etu"],
    GUTTURAL: ["etu", ["etu", "eti"]],
    CORONAL: ["etu", ["etu", "eti"]],
    // unattested; generalizing from above
    LINGUAL: ["?etu", null],
  },
  先h4: {
    LABIAL: ["etu", "etu"],
    GUTTURAL: ["uwetu", ["uwetu", "uweti"]],
  },
} as const;
const she8效: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 效 ****************/
  // she4 called 効 in table
  // 效豪
  豪: {
    LABIAL: [
      ["ou", "*au"],
      ["ou", "*au", "*o"],
    ],
    GUTTURAL: ["au", "au"],
    CORONAL: ["au", "au"],
    LINGUAL: ["au", "au"],
  },

  // 效肴
  肴: {
    LABIAL: ["au", ["eu", "au"]],
    GUTTURAL: ["au", "eu"],
    CORONAL: ["au", ["eu", "au"]],
    LINGUAL: ["au", "eu"],
  },

  // 效宵A
  // 效宵B
  宵: ieuYeuEu,

  // 效蕭
  蕭: ieuYeuEu,
} as const;
const she9果: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 果 ****************/

  // 果歌
  歌: {
    LABIAL: ["a", "a"],
    GUTTURAL: ["a", "a"],
    CORONAL: ["a", ["a", "*iYa"]],
    LINGUAL: ["a", "a"],
  },

  // 果歌戈
  歌h: {
    LABIAL: ["a", "a"],
    GUTTURAL: ["uWa", "uWa"],
    CORONAL: ["a", "a"],
    LINGUAL: ["a", "a"],
  },
  歌3: { GUTTURAL: ["iYa", ["iYa", "a"]] },
  歌3h: {
    GUTTURAL: ["uWa", null],
    CORONAL: ["?a", null],
    LINGUAL: ["?a", null],
  },
} as const;
const she10假: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 假 ****************/

  // 假麻
  麻: {
    LABIAL: ["a", ["a", "e"]],
    GUTTURAL: ["a", ["e", "a"]],
    CORONAL: ["a", ["iYa", "*a"]],
    LINGUAL: ["a", "a"],
  },
  麻h: {
    LABIAL: ["a", ["a", "e"]],
    GUTTURAL: ["uWa", ["uwe", "uWa"]],
    CORONAL: ["a", ["iYa", "*a"]],
    LINGUAL: ["a", "a"],
  },
  麻3: {
    以: ["iYa", "iYa"],
    CORONAL: ["iYa", "iYa"],
    LINGUAL: ["?iYa", null],
    LABIAL: ["?iYa", null],
  },
} as const;
const she11宕: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 宕 ****************/
  // 宕唐 鐸
  唐: {
    LABIAL: ["au", "au"],
    GUTTURAL: ["au", "au"],
    CORONAL: ["au", "au"],
    LINGUAL: ["au", "au"],
  },
  唐h: {
    LABIAL: ["au", "au"],
    CORONAL: ["au", "au"],
    GUTTURAL: ["uWau", "uWau"],
    LINGUAL: ["au", "au"],
  },
  唐4: {
    LABIAL: ["aku", ["aku", "*iYaku"]],
    GUTTURAL: ["aku", "aku"],
    CORONAL: ["aku", ["aku", "*iYaku"]],
    LINGUAL: ["aku", ["aku", "*iYaku"]],
  },
  唐h4: {
    LABIAL: ["aku", ["aku", "*iYaku"]],
    CORONAL: ["?aku", null],
    LINGUAL: ["?aku", null],
    GUTTURAL: ["uWaku", "uWaku"],
  },

  // 宕陽 藥
  陽: {
    LABIAL: ["au", ["au", "*ou"]],
    GUTTURAL: ["iYau", "au"],
    以: ["iYau", "au"],
    RETROFLEX: ["au", ["iYau", "*au"]],
    PALATAL: ["iYau", "iYau"],
    ALVEOLAR: [
      ["iYau", "*au"],
      ["au", "iYau"],
    ],
    日: ["iYau", null],
    LINGUAL: ["iYau", "iYau"],
    來: ["iYau", ["iYau", "au"]],
  },
  陽h: {
    LABIAL: ["au", ["au", "*ou"]],
    GUTTURAL: [
      ["iYau", "uwiYau"],
      ["iYau", "uwiYau", "uWau"],
    ],
    影: ["uWau", "uWau"],
    云: ["uWau", "uWau"],
  },
  陽4: {
    LABIAL: ["aku", "aku"],
    GUTTURAL: ["iYaku", ["iYaku", "*aku"]],
    以: ["iYaku", "iYaku"],
    PALATAL: ["iYaku", "iYaku"],
    ALVEOLAR: [
      ["iYaku", "*aku"],
      ["iYaku", "aku"],
    ],
    RETROFLEX: ["?aku", null],
    日: ["iYaku", "iYaku"],
    LINGUAL: ["iYaku", "iYaku"],
  },
  陽h4: {
    LABIAL: ["aku", "aku"],
    [VELAR]: [["uWaku", "uwiYaku"], "uWaku"],
    // unattested ?
    [PHARYNGEAL]: ["?uWaku", null],
  },
} as const;
const she12梗: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 梗 ****************/
  // 梗庚 陌
  庚: aengArng,
  庚h: waengWarng,
  庚3: yiengIeng,
  庚3h: {
    LABIAL: ["ei", "iYau"],
    // 庚韻三等
    GUTTURAL: [
      ["uwei", "*ei"],
      ["iYau", "uwiYau"],
    ],
  },
  庚4: aekArk,
  庚h4: waekWark,
  庚34: ierkYek,
  庚3h4: {
    GUTTURAL: ["uweki", null],
  },

  // 梗耕 麥
  耕: aengArng,
  耕h: waengWarng,
  耕4: aekArk,
  耕h4: waekWark,

  // 梗清 昔
  清: yiengIeng,
  清h: {
    LABIAL: ["ei", "iYau"],
    CORONAL: ["?ei", null],
    GUTTURAL: ["ei", ["iYau", "uwiYau"]],
  },
  清4: ierkYek,
  清h4: {
    GUTTURAL: ["?eki", null],
    CORONAL: ["?eki", null],
    LABIAL: ["eki", "iYaku"],
    以: ["eki", "iYaku"],
  },

  // 梗青 錫
  青: {
    LABIAL: ["ei", "iYau"],
    GUTTURAL: ["ei", "iYau"],
    CORONAL: ["ei", "iYau"],
    LINGUAL: ["ei", "iYau"],
  },
  青h: {
    LABIAL: ["ei", "iYau"],
    GUTTURAL: [
      ["uwei", "*ei"],
      ["iYau", "uwiYau"],
    ],
  },
  青4: {
    LABIAL: ["eki", "iYaku"],
    GUTTURAL: ["eki", "iYaku"],
    CORONAL: ["eki", "iYaku"],
    LINGUAL: ["eki", "iYaku"],
  },
  青h4: {
    LABIAL: ["eki", "iYaku"],
    GUTTURAL: ["uweki", null],
  },
} as const;
const she13曾: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 曾 ****************/
  // 曾登 德

  登: {
    // oeng
    LABIAL: ["ou", "ou"],
    GUTTURAL: ["ou", ["ou", "*au"]],
    CORONAL: ["ou", ["ou", "*o"]],
    LINGUAL: ["ou", "ou"],
  },
  登h: {
    LABIAL: ["ou", "ou"],
    GUTTURAL: ["ou", ["ou", "*u"]],
  },
  登4: {
    LABIAL: ["oku", "oku"],
    GUTTURAL: ["oku", "oku"],
    CORONAL: ["oku", "oku"],
    LINGUAL: ["oku", "oku"],
  },
  登h4: {
    LABIAL: ["oku", "oku"],
    GUTTURAL: ["oku", ["oku", "uWaku"]],
  },

  // 曾蒸 職
  蒸: {
    LABIAL: ["iYou", "iYou"],
    GUTTURAL: [
      ["iYou", "*uwiYou"],
      ["iYou", "ou"],
    ],
    PALATAL: ["iYou", "iYou"],
    ALVEOLAR: [["iYou", "ou"], "iYou"],
    RETROFLEX: [["?iYou", "?ou"], "iYou"],
    日: ["iYou", null],
    LINGUAL: ["iYou", "iYou"],
  },
  蒸4: {
    LABIAL: ["iYoku", null],
    // kan-go document gives oku as kan'on for 億
    // but daikanwa says it's yoku.
    // going for daikanwa for consistency with homonyms
    GUTTURAL: ["iYoku", "oku"],
    以: ["iYoku", "iYoku"],
    [RETROFLEX]: [["iYoku", "oku"], "iki"],
    PALATAL: ["iYoku", "iki"],
    ALVEOLAR: ["iYoku", "oku"],
    [LINGUAL]: ["iYoku", ["iki", "*iYoku", "*oku"]],
  },
  蒸h4: {
    LABIAL: ["iYoku", null],
    GUTTURAL: [["iYoku", "*uwiki"], "uwiki"],
  },
} as const;
const she14流: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 流 ****************/
  // 流尤
  尤: {
    LABIAL: [["u", "uu"], "u"],
    明: ["ou", "u"],
    GUTTURAL: ["iu", ["u", "*o"]],
    以: ["iu", "iYu"],
    RETROFLEX: [["iu", "*uu"], "iYu"],
    PALATAL: ["iu", ["iYu", "*u"]],
    ALVEOLAR: ["iu", "iYu"],
    日: ["iu", "iu"],
    LINGUAL: ["iu", "iu"],
  },

  // 流侯
  侯: {
    LABIAL: [
      ["ou", "o"],
      ["u", "o"],
    ],
    GUTTURAL: ["ou", ["u", "o", "*ou", "*au"]],
    CORONAL: ["ou", "ou"],
    LINGUAL: [
      ["ou", "*o"],
      ["u", "o", "*iu"],
    ],
  },

  // 流幽
  幽: {
    LABIAL: [["iu", "eu"], "eu"],
    CORONAL: [["?iu", "?eu"], null],
    LINGUAL: [["?iu", "?eu"], null],
    GUTTURAL: [
      ["iu", "*eu"],
      ["eu", "iu", "*u"],
    ],
    來: ["iu", null],
  },
} as const;
const she15深: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 深 ****************/

  // 深侵A 緝
  // 深侵B 緝
  侵: imYim,
  侵4: ipYip,
} as const;
const she16咸: Partial<Record<FinalCode, FinalsSet>> = {
  /**************** 咸 ****************/

  // 咸談 盍
  談: {
    LABIAL: ["?aMu", null],
    GUTTURAL: ["aMu", "aMu"],
    CORONAL: ["aMu", "aMu"],
    LINGUAL: ["aMu", "aMu"],
  },
  談4: {
    GUTTURAL: ["apu", "apu"],
    CORONAL: ["apu", null],
    LINGUAL: ["apu", "apu"],
  },

  // 咸嚴 業
  嚴: yermYwarm,
  嚴4: yepYwexp,

  // 咸凡 乏
  凡: yermYwarm,
  凡4: yepYwexp,

  // 咸銜 狎
  銜: aemArm,
  銜4: aepArp,

  // 咸咸 洽
  咸: aemArm,
  咸4: aepArp,

  // 咸鹽A 葉
  // 咸鹽B 葉
  鹽: emIemYem,
  鹽4: epIepYep,

  // 咸添 帖
  添: emIemYem,
  添4: epIepYep,

  // 咸覃 合
  覃: {
    GUTTURAL: ["aMu", ["aMu", "oMu"]],
    CORONAL: ["aMu", "aMu"],
    LINGUAL: ["aMu", ["aMu", "oMu"]],
  },
  覃4: {
    GUTTURAL: ["apu", ["apu", "opu"]],
    CORONAL: ["apu", "apu"],
    LINGUAL: ["apu", "apu"],
  },
} as const;

export const attestedFinals: Partial<Record<FinalCode, FinalsSet>> = {
  ...she1通,
  ...she2江,
  ...she3止,
  ...she4遇,
  ...she5蟹,
  ...she6臻,
  ...she7山,
  ...she8效,
  ...she9果,
  ...she10假,
  ...she11宕,
  ...she12梗,
  ...she13曾,
  ...she14流,
  ...she15深,
  ...she16咸,
};
