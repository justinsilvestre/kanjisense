import { SbgyXiaoyun } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import YAML from "yaml";

import { LABIAL_INITIALS } from "prisma/external/getYuntuJson";
import _kanjikaiReadings from "~/features/curate/kanjikaiReadings.json";
import _sbgyNotes from "~/lib/dic/sbgyNotes.json";
import { QysInitial } from "~/lib/qys/QysInitial";
import { Kaihe, QysSyllableProfile } from "~/lib/qys/QysSyllableProfile";

import {
  alwaysDentilabializationFinals,
  noMDentilabializationFinals,
} from "../dictionary/QysHints";
import { sbgyXiaoyunToQysSyllableProfile } from "../dictionary/sbgyXiaoyunToQysSyllableProfile";
import { transcribeSbgyXiaoyun } from "../dictionary/transcribeSbgyXiaoyun";

import {
  getGuangyunCycleHead,
  getGuangyunFinal,
} from "./getGuangyunRhymeCycleHead";

const sbgyNotes = _sbgyNotes as unknown as Record<
  string,
  Record<number, string>
>;

const kanjikaiReadings = _kanjikaiReadings.readings as unknown as Record<
  string,
  KanjikaiReadingsJson[] | undefined
>;

export type KanjikaiReadingsJson = [
  oldNormalizedCharacter: string,
  guangyun: string | null,
  readingLetter: string | 0,
  pinyin: string | 0,
  onyomi: string[],
];
// prettier-ignore
type KanjikaiInitial = "影"| "渓"| "清"| "端"| "知"| "匣"| "心"| "禅"| "澄"| "微"| "明"| "以"| "見"| "徹"| "非"| "滂"| "従"| "精"| "書"| "幫"| "章"| "来"| "並"| "敷"| "群"| "昌"| "疑"| "泥"| "透"| "奉"| "崇"| "船"| "日"| "荘"| "云"| "定"| "暁"| "邪"| "生"| "初"| "娘";
const kanjikaiInitials = new Set(
  _kanjikaiReadings.allInitials as KanjikaiInitial[],
);
function isKanjikaiInitial(char: string): char is KanjikaiInitial {
  return kanjikaiInitials.has(char as KanjikaiInitial);
}
const initialConversion = {
  俟: "崇",
  孃: "娘",
  常: "禅",
  從: "従",
  曉: "暁",
  來: "来",
  溪: "渓",
  莊: "荘",
  羣: "群",
} as const;

// prettier-ignore
type KanjikaiFinal =  "質" |"晧" |"青" |"耕" |"馬" |"禡" |"談" |"闞" |"漾" |"養" |"願" |"徳" |"語" |"御" |"魚" |"泰" |"有" |"物" |"脂" |"虞" |"尤" |"銑" |"模" |"祭" |"梗" |"蒸" |"迥" |"宕" |"混" |"麻" |"箇" |"怪" |"陌" |"東" |"送" |"鍾" |"諫" |"線" |"麌" |"桓" |"之" |"寒" |"静" |"感" |"屑" |"廃" |"海" |"緝" |"鐸" |"乏" |"隠" |"侵" |"支" |"卦" |"皆" |"證" |"迄" |"未" |"斉" |"換" |"仙" |"月" |"篠" |"諍" |"志" |"至" |"燭" |"文" |"姥" |"暮" |"嶝" |"職" |"侯" |"陽" |"唐" |"昔" |"肴" |"庚" |"旱" |"尾" |"魂" |"真" |"黠" |"遇" |"没" |"止" |"震" |"先" |"歌" |"代" |"勁" |"清" |"紙" |"獮" |"沁" |"屋" |"宥" |"哿" |"戈" |"候" |"艶" |"塩" |"過" |"薺" |"霰" |"冬" |"径" |"緩" |"微" |"佳" |"灰" |"咍" |"末" |"用" |"巧" |"登" |"很" |"稕" |"蕭" |"宵" |"董" |"隊" |"諄" |"帖" |"霽" |"慁" |"笑" |"寝" |"腫" |"映" |"琰" |"耿" |"錫" |"蕩" |"葉" |"覚" |"号" |"果" |"阮" |"寘" |"厚" |"薛" |"準" |"賄" |"㮇" |"効" |"豪" |"覃" |"勘" |"潸" |"沃" |"翰" |"問" |"軫" |"咸" |"陥" |"儼" |"元" |"小" |"旨" |"添" |"合" |"麦" |"拯" |"凡" |"范" |"洽" |"術" |"鎋" |"吻" |"删" |"薬" |"曷" |"釅" |"産" |"業" |"欣" |"狎" |"江" |"嘯" |"痕" |"幽" |"夬" |"敢" |"盍" |"忝" |"銜" |"山" |"焮" |"蟹" |"宋" |"豏" |"絳" |"梵" |"襉" |"幼" |"恨" |"鑑" |"講" |"櫛" |"駭" |"厳" |"臻" |"檻" |"等" |"黝"
const kanjikaiFinals = new Set(_kanjikaiReadings.allFinals as KanjikaiFinal[]);
function isKanjikaiFinal(char: string): char is KanjikaiFinal {
  return kanjikaiFinals.has(char as KanjikaiFinal);
}
const finalConversion: Record<string, KanjikaiFinal> = {
  湩: "腫",
  覺: "覚",
  齊: "斉",
  眞: "真",
  隱: "隠",
  䰟: "魂",
  沒: "没",
  麧: "没",
  刪: "删",
  效: "効",
  藥: "薬",
  麥: "麦",
  淸: "清",
  靜: "静",
  靑: "青",
  徑: "径",
  德: "徳",
  寑: "寝",
  鹽: "塩",
  豔: "艶",
  怗: "帖",
  陷: "陥",
  嚴: "厳",
  廢: "廃",
};

export function getKanjikaiGuangyunFanqie(syllableProfile: QysSyllableProfile) {
  const kanjisenseInitial = dentilabializeInitial(
    syllableProfile.initial,
    syllableProfile,
  );

  const qieyunCycleHead = syllableProfile.cycleHead;

  const guangyunFinal = getGuangyunFinal(
    qieyunCycleHead,
    syllableProfile.initial,
    syllableProfile.kaihe,
    syllableProfile.dengOrChongniu,
    syllableProfile.tone,
  );

  const initial: KanjikaiInitial = isKanjikaiInitial(kanjisenseInitial)
    ? kanjisenseInitial
    : initialConversion[kanjisenseInitial];
  const final: KanjikaiFinal = isKanjikaiFinal(guangyunFinal)
    ? guangyunFinal
    : finalConversion[guangyunFinal];

  return `${initial}${final}`;
}

type MultiReadingCharactersJson = Record<
  string,
  | {
      notes: string;
      defs: Record<string, string | null>[];
      kanjikaiNotInGuangyun?: Record<string, string>[];
    }
  | undefined
>;
function dentilabializeInitial(
  kanjisenseInitial: QysInitial,
  syllableProfile: QysSyllableProfile,
) {
  if (
    syllableProfile.cycleHead === "東" &&
    syllableProfile.dengOrChongniu != "三"
  )
    return kanjisenseInitial;
  if (
    kanjisenseInitial === "明" &&
    alwaysDentilabializationFinals.has(syllableProfile.cycleHead)
  ) {
    return "微" as const;
  } else if (
    (LABIAL_INITIALS.has(kanjisenseInitial) &&
      noMDentilabializationFinals.has(syllableProfile.cycleHead)) ||
    alwaysDentilabializationFinals.has(syllableProfile.cycleHead)
  ) {
    if (kanjisenseInitial === "幫") return "非" as const;
    else if (kanjisenseInitial === "滂") return "敷" as const;
    else if (kanjisenseInitial === "並") return "奉" as const;
  }
  return kanjisenseInitial;
}

export function getMultiReadingCharactersYml(
  charactersWithReadings: {
    id: string;
    sbgyXiaoyunsMatchingExemplars: JsonValue;
    sbgyXiaoyuns: {
      sbgyXiaoyun: SbgyXiaoyun;
    }[];
  }[],
  excludeCharacters?: Set<string>,
  filledInYmlString?: string,
): string {
  const filledInYml = filledInYmlString
    ? (YAML.parse(filledInYmlString) as MultiReadingCharactersJson)
    : {};
  const json = charactersWithReadings.reduce(
    (
      map,
      {
        id: shinjitaiCharacter,
        sbgyXiaoyuns: guangyunReadingsForShinjitaiCharacter,
        sbgyXiaoyunsMatchingExemplars,
      },
    ) => {
      // const characters = [
      //   ...new Set(sbgyXiaoyuns.flatMap((sp) => sp.exemplars || [])),
      // ];
      const characters = [
        ...new Set(
          Object.values(
            sbgyXiaoyunsMatchingExemplars as Record<number, string[]>,
          ).flatMap((x) => x),
        ),
      ];
      const guangyunReadingsWithSources = Object.entries(
        sbgyXiaoyunsMatchingExemplars as Record<number, string[]>,
      ).map(([xiaoyunNumberString, sourceCharacters]) => ({
        xiaoyunNumber: +xiaoyunNumberString,
        xiaoyun: guangyunReadingsForShinjitaiCharacter.find(
          (r) => r.sbgyXiaoyun.xiaoyun === +xiaoyunNumberString,
        )!,
        sourceCharacters,
      }));

      const kanjikaiReadingsMissingFromGuangyun = characters.flatMap((char) => {
        const kanjikaiReadingsForCharacter = kanjikaiReadings[char];
        const characterReadingsWithoutGyEntry =
          kanjikaiReadingsForCharacter?.filter((readingJson) => {
            return !guangyunReadingsForShinjitaiCharacter.some(
              ({ sbgyXiaoyun }) =>
                getKanjikaiGuangyunFanqie(
                  sbgyXiaoyunToQysSyllableProfile(sbgyXiaoyun),
                ) === readingJson[1],
            );
          });
        return characterReadingsWithoutGyEntry || [];
      });

      const overwrittenNotes = filledInYml[shinjitaiCharacter]?.notes
        .split("\n")
        .slice(guangyunReadingsForShinjitaiCharacter.length)
        .join("\n");

      map[shinjitaiCharacter] = {
        notes:
          guangyunReadingsForShinjitaiCharacter
            .map(({ sbgyXiaoyun: guangyunReading }) => {
              const kanjikaiFanqie = getKanjikaiGuangyunFanqie(
                sbgyXiaoyunToQysSyllableProfile(guangyunReading),
              );

              const profile = sbgyXiaoyunToQysSyllableProfile(guangyunReading);
              const matchingChars = guangyunReadingsWithSources.flatMap(
                (reading) =>
                  reading.xiaoyunNumber === guangyunReading.xiaoyun
                    ? reading.sourceCharacters
                    : [],
              );

              const matchingCharsWithNote = matchingChars.filter(
                (c) => sbgyNotes[c],
              );
              const note =
                matchingCharsWithNote.length > 1
                  ? matchingCharsWithNote
                      .map(
                        (c) =>
                          `${c}->${sbgyNotes[c][guangyunReading.xiaoyun]} `,
                      )
                      .join(" ")
                  : sbgyNotes[matchingCharsWithNote[0]]?.[
                      guangyunReading.xiaoyun
                    ];
              const formattedNote = note?.replace(/\s/g, "");

              if (shinjitaiCharacter === "万")
                console.log("wan", {
                  matchingChars,
                  profile,
                  sbgyXiaoyunForShinjitai: guangyunReading,
                  kanjikaiReadingText: kanjikaiFanqie,
                });
              const matchingKanjikaiReadings = [
                ...new Set(
                  [...new Set([shinjitaiCharacter, ...matchingChars])].flatMap(
                    (char) =>
                      kanjikaiReadings[char]?.filter(
                        ([, guangyunFanqie]) =>
                          guangyunFanqie === kanjikaiFanqie,
                      ) || [],
                  ),
                ),
              ];
              const readingAndTranscription = `${getKanjikaiGuangyunFanqie(
                profile,
              )} ${transcribeSbgyXiaoyun(guangyunReading)}`.padEnd(6, " ");
              const kanjikaiCharacterMatches = new Set(
                matchingKanjikaiReadings.map(([c]) => c),
              );
              const kanjikaiMatchesNotes = matchingKanjikaiReadings
                .map(([oldNormalizedCharacter, , readingLetter, pinyin]) => {
                  const tag =
                    kanjikaiCharacterMatches.size > 1
                      ? oldNormalizedCharacter
                      : "";
                  return `${
                    readingLetter
                      ? `${tag}${readingLetter}`
                      : `[${oldNormalizedCharacter}]`
                  } ${pinyin || "---"}`;
                })
                .join(", ")
                .padStart(20, " ");

              return `${readingAndTranscription} ${`${kanjikaiMatchesNotes} ${matchingChars.join(
                ",",
              )}`}  ${
                formattedNote?.startsWith("上同")
                  ? `${formattedNote} https://ytenx.org/zim?dzih=${matchingCharsWithNote[0]}&dzyen=1&jtkb=1&jtkd=1&jtdt=1&jtgt=1`
                  : formattedNote
              }`;
            })
            .join("\n") + (overwrittenNotes ? "\n" + overwrittenNotes : ""),

        defs: guangyunReadingsWithSources.map(
          ({ sourceCharacters, xiaoyun }) => {
            const key = dictionaryEntryKey(
              sourceCharacters.join(","),
              sbgyXiaoyunToQysSyllableProfile(xiaoyun.sbgyXiaoyun),
            );
            return {
              [key]:
                filledInYml[shinjitaiCharacter]?.defs.find((d) => d[key])?.[
                  key
                ] || null,
            };
          },
        ),
        kanjikaiNotInGuangyun: kanjikaiReadingsMissingFromGuangyun?.length
          ? kanjikaiReadingsMissingFromGuangyun.map((json) => {
              return {
                [`${json[0]}-${json[1]}`]:
                  filledInYml[shinjitaiCharacter]?.kanjikaiNotInGuangyun?.find(
                    (d) => d[`${json[0]}-${json[1]}`],
                  )?.[`${json[0]}-${json[1]}`] ||
                  `(漢字海 ${json[2]}; not in GY) ${[json[4], json[3]].join(
                    " / ",
                  )}`,
              };
            })
          : undefined,
      };

      return map;
    },
    {} as MultiReadingCharactersJson,
  );
  for (const ch of excludeCharacters || []) {
    delete json[ch];
  }
  return YAML.stringify(json, {
    simpleKeys: true,
    blockQuote: "literal",
    lineWidth: 4000,
  });
}
function dictionaryEntryKey(char: string, sp: QysSyllableProfile) {
  const guangyunCycleHead = getGuangyunCycleHead(
    sp.cycleHead,
    sp.initial,
    sp.kaihe,
    sp.dengOrChongniu,
  );
  const guangyunFinal = getGuangyunFinal(
    sp.cycleHead,
    sp.initial,
    sp.kaihe,
    sp.dengOrChongniu,
    sp.tone,
  );
  const kaiheInvariant =
    guangyunCycleHead === "戈" ||
    guangyunCycleHead === "桓" ||
    guangyunCycleHead === "諄";
  return `${char}-${sp.initial}${guangyunFinal}${
    !kaiheInvariant && sp.kaihe === Kaihe.Closed ? sp.kaihe : ""
  }${sp.dengOrChongniu === "三" ? sp.dengOrChongniu : ""}`;
}
