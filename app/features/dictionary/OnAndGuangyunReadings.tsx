import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";

export function OnAndGuangyunReadings({
  parentReadingMatchingSoundMark,
  reading,
}: {
  parentReadingMatchingSoundMark: {
    katakanaOn: string | undefined;
    guangyun: string | null;
  } | null;
  reading: DictionaryPageFigureWithPriorityUses["firstClassUses"][number]["parent"]["reading"];
}) {
  return (
    <>
      {parentReadingMatchingSoundMark ? (
        <span className="text-sm rounded border border-solid border-yellow-400 bg-yellow-100 bg-opacity-50 p-1">
          {parentReadingMatchingSoundMark.katakanaOn}{" "}
          {parentReadingMatchingSoundMark.guangyun}
        </span>
      ) : (
        <span className="text-sm">
          {reading?.selectedOnReadings?.[0] ||
            reading?.kanjidicEntry?.onReadings?.[0] ||
            null}{" "}
          {reading?.sbgyXiaoyuns?.length
            ? transcribeSbgyXiaoyun(reading.sbgyXiaoyuns[0].sbgyXiaoyun)
            : null}
        </span>
      )}
    </>
  );
}
