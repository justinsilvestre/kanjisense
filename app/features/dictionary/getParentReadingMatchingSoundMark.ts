import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

import { parseActiveSoundMarkValue } from "./getActiveSoundMarkValueText";

export function getParentReadingMatchingSoundMark(
  soundMarkValueText: DictionaryPageFigureWithPriorityUses["firstClassUses"][number]["parent"]["activeSoundMarkValue"],
  soundMarkReadings:
    | Pick<
        NonNullable<DictionaryPageFigureWithPriorityUses["reading"]>,
        "sbgyXiaoyuns"
      >
    | null
    | undefined,
  parentReadings: DictionaryPageFigureWithPriorityUses["firstClassUses"][number]["parent"]["reading"],
) {
  if (!parentReadings)
    return {
      katakanaOn: "BOOP",
      guangyun: null,
    };
  const parentGuangyunReadings = parentReadings.sbgyXiaoyuns.map(
    ({ sbgyXiaoyun }) => ({
      sbgyXiaoyun,
      ascii: transcribeSbgyXiaoyun(sbgyXiaoyun, { ascii: true }),
      pretty: transcribeSbgyXiaoyun(sbgyXiaoyun),
    }),
  );
  const soundMarkGuangyunReadings = new Map(
    soundMarkReadings?.sbgyXiaoyuns.map(({ sbgyXiaoyun }) => [
      sbgyXiaoyun.xiaoyun,
      {
        sbgyXiaoyun,
        ascii: transcribeSbgyXiaoyun(sbgyXiaoyun, { ascii: true }),
      },
    ]),
  );

  if (!soundMarkValueText) return null;
  const { katakana: soundMarkKatakanaOnReading, xiaoyunsByMatchingType } =
    parseActiveSoundMarkValue(soundMarkValueText);
  const soundMarkXiaoyuns = xiaoyunsByMatchingType
    ? [...new Set(Object.values(xiaoyunsByMatchingType).flat())]
    : [];

  const matchingKatakanaOnReading =
    parentReadings.selectedOnReadings?.find(
      (r) => r === soundMarkKatakanaOnReading,
    ) ||
    parentReadings.kanjidicEntry?.onReadings?.find(
      (r) => r === soundMarkKatakanaOnReading,
    );
  const parentKatakanaOnReading =
    matchingKatakanaOnReading ||
    parentReadings.selectedOnReadings?.[0] ||
    parentReadings.kanjidicEntry?.onReadings?.[0];

  const parentGuangyunReadingsByLevenshteinDistance =
    parentGuangyunReadings.sort((a, b) => {
      const aDistance = Math.min(
        ...soundMarkXiaoyuns.map((soundMarkXiaoyunId) =>
          getLevenshteinDistance(
            a.ascii,
            soundMarkGuangyunReadings.get(soundMarkXiaoyunId)!.ascii,
          ),
        ),
      );
      const bDistance = Math.min(
        ...soundMarkXiaoyuns.map((soundMarkXiaoyunId) =>
          getLevenshteinDistance(
            b.ascii,
            soundMarkGuangyunReadings.get(soundMarkXiaoyunId)!.ascii,
          ),
        ),
      );
      return aDistance - bDistance;
    });

  return {
    katakanaOn: parentKatakanaOnReading,
    guangyun: parentGuangyunReadingsByLevenshteinDistance.length
      ? transcribeSbgyXiaoyun(
          parentGuangyunReadingsByLevenshteinDistance[0].sbgyXiaoyun,
        )
      : null,
  };
}
function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= b.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= a.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + indicator,
      );
    }
  }

  return matrix[a.length][b.length];
}
