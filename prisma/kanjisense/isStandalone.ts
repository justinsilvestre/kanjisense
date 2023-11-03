import { baseKanji } from "~/lib/baseKanji";

export function isStandalone(
  baseKanjiVariants: string[][],
  key: string,
  directUses: Set<string>,
) {
  return (
    Boolean(!directUses.size || baseKanji.includes(key)) ||
    baseKanjiVariants.some((group) => group.includes(key))
  );
}
