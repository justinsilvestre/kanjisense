import { LABIAL_INITIALS } from "prisma/external/getYuntuJson";
import { QieyunRhymeCycleHead } from "~/lib/qys/QieyunRhymeCycleHead";
import { QysInitial } from "~/lib/qys/QysInitial";
import { DengOrChongniu, Kaihe, Tone } from "~/lib/qys/QysSyllableProfile";

export function getGuangyunCycleHead(
  qieyunCycleHead: QieyunRhymeCycleHead,
  initial: QysInitial,
  kaihe: Kaihe | null,
  deng: DengOrChongniu | null,
): GuangyunCycleHead {
  if (qieyunCycleHead === "眞" && kaihe === Kaihe.Closed && deng !== "A")
    return "諄";

  if (
    qieyunCycleHead === "寒" &&
    (kaihe === Kaihe.Closed || LABIAL_INITIALS.has(initial))
  )
    return "桓";

  if (
    qieyunCycleHead === "歌" &&
    (kaihe === Kaihe.Closed || LABIAL_INITIALS.has(initial) || deng === "三")
  )
    return "戈";

  return qieyunCycleHead;
}

export function getGuangyunFinal(
  qieyunCycleHead: QieyunRhymeCycleHead,
  initial: QysInitial,
  kaihe: Kaihe | null,
  deng: DengOrChongniu | null,
  tone: Tone,
) {
  const cycle = getGuangyunCycle(qieyunCycleHead, initial, kaihe, deng);
  if (!cycle)
    throw new Error(`無廣韻韻目： ${qieyunCycleHead}${kaihe}${deng}${tone}`);
  if (tone === Tone.平) return cycle[0];
  if (tone === Tone.上) return cycle[1];
  if (tone === Tone.去) return cycle[2];
  if (tone === Tone.入) return cycle[3]!;
  throw new Error(`無廣韻韻目： ${qieyunCycleHead}${kaihe}${deng}${tone}`);
}

export function getGuangyunCycle(
  qieyunCycleHead: QieyunRhymeCycleHead,
  initial: QysInitial,
  kaihe: Kaihe | null,
  deng: DengOrChongniu | null,
) {
  const guangyunCycleHead = getGuangyunCycleHead(
    qieyunCycleHead,
    initial,
    kaihe,
    deng,
  );
  return prettySbgyRhymeCycles.find((c) => c.includes(guangyunCycleHead));
}

type GuangyunCycleHead = QieyunRhymeCycleHead | "諄" | "桓" | "戈";

const prettySbgyRhymeCycles: (
  | [GuangyunCycleHead, string, string]
  | [GuangyunCycleHead, string, string, string]
  | ["", "", GuangyunCycleHead]
)[] = [
  ["東", "董", "送", "屋"],
  ["冬", "湩", "宋", "沃"],
  ["鍾", "腫", "用", "燭"],
  ["江", "講", "絳", "覺"],
  ["支", "紙", "寘"],
  ["脂", "旨", "至"],
  ["之", "止", "志"],
  ["微", "尾", "未"],
  ["魚", "語", "御"],
  ["虞", "麌", "遇"],
  ["模", "姥", "暮"],
  ["齊", "薺", "霽"],
  ["佳", "蟹", "卦"],
  ["皆", "駭", "怪"],
  ["灰", "賄", "隊"],
  ["咍", "海", "代"],
  ["眞", "軫", "震", "質"],
  ["諄", "準", "稕", "術"],
  ["臻", "", "", "櫛"],
  ["文", "吻", "問", "物"],
  ["欣", "隱", "焮", "迄"],
  ["元", "阮", "願", "月"],
  ["魂", "混", "慁", "沒"],
  ["痕", "很", "恨", "麧"],
  ["寒", "旱", "翰", "曷"],
  ["桓", "緩", "換", "末"],
  ["刪", "潸", "諫", "鎋"],
  ["山", "産", "襉", "黠"],
  ["先", "銑", "霰", "屑"],
  ["仙", "獮", "線", "薛"],
  ["蕭", "篠", "嘯"],
  ["宵", "小", "笑"],
  ["肴", "巧", "效"],
  ["豪", "晧", "号"],
  ["歌", "哿", "箇"],
  ["戈", "果", "過"],
  ["麻", "馬", "禡"],
  ["陽", "養", "漾", "藥"],
  ["唐", "蕩", "宕", "鐸"],
  ["庚", "梗", "映", "陌"],
  ["耕", "耿", "諍", "麥"],
  ["清", "靜", "勁", "昔"],
  ["青", "迥", "徑", "錫"],
  ["蒸", "拯", "證", "職"],
  ["登", "等", "嶝", "德"],
  ["尤", "有", "宥"],
  ["侯", "厚", "候"],
  ["幽", "黝", "幼"],
  ["侵", "寑", "沁", "緝"],
  ["覃", "感", "勘", "合"],
  ["談", "敢", "闞", "盍"],
  ["鹽", "琰", "豔", "葉"],
  ["添", "忝", "㮇", "怗"],
  ["咸", "豏", "陷", "洽"],
  ["銜", "檻", "鑑", "狎"],
  ["嚴", "儼", "釅", "業"],
  ["凡", "范", "梵", "乏"],
  ["", "", "祭"],
  ["", "", "泰"],
  ["", "", "夬"],
  ["", "", "廢"],
];
