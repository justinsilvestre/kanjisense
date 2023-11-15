import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import {
  XiaoyunCategoriesJson,
  CanonicalInitial,
  LABIAL_INITIALS,
  overrides,
} from "./seedSbgy";

export async function getYuntuJson() {
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
