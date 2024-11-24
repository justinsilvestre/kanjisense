import {
  baseKanji,
  hyogaiKanji,
  jinmeiyoKanji,
  joyoKanji,
  kyoikuKanji,
} from "~/lib/baseKanji";
import { KanjiListCode, listCodes } from "~/lib/dic/KanjiListCode";

export const joyo = new Set(joyoKanji);
export const jinmeiyo = new Set(jinmeiyoKanji);
export const hyogai = new Set(hyogaiKanji);

export const kyoiku1 = new Set(kyoikuKanji[0]);
export const kyoiku2 = new Set(kyoikuKanji[1]);
export const kyoiku3 = new Set(kyoikuKanji[2]);
export const kyoiku4 = new Set(kyoikuKanji[3]);
export const kyoiku5 = new Set(kyoikuKanji[4]);
export const kyoiku6 = new Set(kyoikuKanji[5]);

export function getListsMembership(figure: string) {
  const lists = new Set<KanjiListCode>();
  if (!baseKanji.includes(figure)) return lists;

  if (joyo.has(figure)) lists.add(listCodes.joyo);
  if (jinmeiyo.has(figure)) lists.add(listCodes.jinmeiyo);
  if (hyogai.has(figure)) lists.add(listCodes.hyogai);
  if (kyoiku1.has(figure)) lists.add(listCodes.kyoiku1);
  if (kyoiku2.has(figure)) lists.add(listCodes.kyoiku2);
  if (kyoiku3.has(figure)) lists.add(listCodes.kyoiku3);
  if (kyoiku4.has(figure)) lists.add(listCodes.kyoiku4);
  if (kyoiku5.has(figure)) lists.add(listCodes.kyoiku5);
  if (kyoiku6.has(figure)) lists.add(listCodes.kyoiku6);

  return lists;
}
