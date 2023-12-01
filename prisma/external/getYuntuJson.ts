import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

export async function getYuntuJson(
  overrides: Record<number, XiaoyunCategoriesJson>,
) {
  const json: Record<number, XiaoyunCategoriesJson> = {};
  let firstSeen = false;
  await forEachLine(files.nk2028GuangyunYuntu, (line) => {
    if (!line || line.startsWith("#")) return;
    if (!firstSeen) {
      firstSeen = true;
      return;
    }
    // 小韻號,小韻首字,上字,下字,被切字音韻描述們,上字音韻描述們,下字音韻描述們
    const [number, , , , categories] = line.split(",");

    const matchData = categories.match(
      /^(.)([開合]?)([一二三AB]?)(.)([平上去入])$/u,
    );
    if (!matchData) {
      console.error(categories);
      return;
    }
    const [
      ,
      initial,
      kaiheWhenContrastiveInRhyme,
      chongniuLetterOrDeng,
      guangyunRhymeWithoutTone,
      tone,
    ] = matchData;
    json[+number] = [
      initial as CanonicalInitial,
      guangyunRhymeWithoutTone,
      tone,
      (!LABIAL_INITIALS.has(initial) && kaiheWhenContrastiveInRhyme) || null,
      chongniuLetterOrDeng || null,
    ];
  });
  return { ...json, ...overrides };
}
export const LABIAL_INITIALS = new Set("幫滂並明");
export type XiaoyunCategoriesJson = [
  initial: CanonicalInitial,
  guangyunRhymeCycleHead: string,
  tone: string,
  kaihe: string | null,
  chongniuLetterOrDeng: string | null,
];
export type CanonicalInitial =
  | "幫"
  | "滂"
  | "並"
  | "明"
  | "端"
  | "透"
  | "定"
  | "泥"
  | "來"
  | "知"
  | "徹"
  | "澄"
  | "孃"
  | "精"
  | "清"
  | "從"
  | "心"
  | "邪"
  | "莊"
  | "初"
  | "崇"
  | "生"
  | "俟"
  | "章"
  | "昌"
  | "常"
  | "書"
  | "船"
  | "日"
  | "見"
  | "溪"
  | "羣"
  | "疑"
  | "影"
  | "曉"
  | "匣"
  | "云"
  | "以";
