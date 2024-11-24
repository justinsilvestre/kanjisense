import { baseKanji } from "~/lib/baseKanji";
import { KanjiListCode, listCodes } from "~/lib/dic/KanjiListCode";
import {
  joyo,
  jinmeiyo,
  hyogai,
  kyoiku1,
  kyoiku2,
  kyoiku3,
  kyoiku4,
  kyoiku5,
  kyoiku6,
} from "./seedKanjisenseFigureRelation";

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
