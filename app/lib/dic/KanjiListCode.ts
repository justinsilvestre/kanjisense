export const listCodes = {
  kyoiku1: "1",
  kyoiku2: "2",
  kyoiku3: "3",
  kyoiku4: "4",
  kyoiku5: "5",
  kyoiku6: "6",
  joyo: "j",
  jinmeiyo: "m",
  hyogai: "h",
} as const;

export type KanjiListCode = typeof listCodes[keyof typeof listCodes];
