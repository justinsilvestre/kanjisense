import { XiaoyunCategoriesJson } from "./getYuntuJson";

export const overrides: Record<number, XiaoyunCategoriesJson> = {
  // no homophones so no fanqie was given
  1919: ["章", "蒸", "上", null, null], // 拯
  3177: ["影", "銜", "去", null, null], // 𪒠

  // rhyme classes differ from http://suzukish.s252.xrea.com/search/inkyo/yunzi/<CHARACTER>
  // and in ytenx.org guangyun scans
  392: ["並", "咍", "平", null, null], // 𤗏
  400: ["滂", "咍", "平", null, null], // 𡜊
  1452: ["滂", "咍", "上", null, null], // 啡 listed as homophonous to 俖; see next line
  1458: ["幫", "咍", "上", null, null], // 俖 has unaspirated P yunjing, also Jiyun lists that as possible reading.
  1456: ["明", "咍", "上", null, null], // 䆀
  1465: ["並", "咍", "上", null, null], // 倍
  2530: ["明", "咍", "去", null, null], // 䆀
  2381: ["透", "齊", "去", "開", "三"], // 𥱻

  // some atypical initial/final combos
  // were made more typical
  1310: ["泥", "之", "上", null, null], // 伱
  2886: ["泥", "麻", "去", "開", "二"], //䏧
  1871: ["端", "庚", "上", "開", "二"], // 打
  574: ["從", "山", "平", "開", null], // 虥

  // apparently corrections, judging by unt  https://www.zhihu.com/question/490585553/answer/2157640006
  1763: ["精", "歌", "上", "合", "一"], // 硰,
};
