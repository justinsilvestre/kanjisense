import type { DictionaryPageFigureWithPriorityUses } from "~/features/dictionary/getDictionaryPageFigure.server";
import { transcribeSbgyXiaoyun } from "~/features/dictionary/transcribeSbgyXiaoyun";
import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

type ElementOf<T> = T extends (infer E)[] ? E : never;

export function getReadingMatchingSoundMark(
  firstClassUse: DictionaryPageFigureWithPriorityUses["firstClassUses"][number],
) {
  if (!firstClassUse.parent.activeSoundMarkId) return null;
  const onKatakana =
    firstClassUse.parent.reading?.kanjidicEntry?.onReadings?.[0];

  const qysTranscriptions = firstClassUse.parent.reading?.sbgyXiaoyuns
    ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
    ?.join(", ");

  return [onKatakana, qysTranscriptions].filter(Boolean).join(" ");
}

export function displayActiveSoundMark(
  firstClassComponent: ElementOf<
    DictionaryPageFigureWithPriorityUses["firstClassComponents"]
  >,
) {
  const activeSoundMarkValue = firstClassComponent.parent.activeSoundMarkValue;
  if (!activeSoundMarkValue) return null;

  const [katakana, sbgyJsonText] = activeSoundMarkValue.split(" ");
  const onyomiTypesToXiaoyunNumbers = sbgyJsonText
    ? (JSON.parse(sbgyJsonText) as Record<InferredOnyomiType, number[]>)
    : null;
  const xiaoyunNumbers =
    onyomiTypesToXiaoyunNumbers &&
    Object.values(onyomiTypesToXiaoyunNumbers).flat();

  const xiaoyun = xiaoyunNumbers
    ? firstClassComponent.component.reading?.sbgyXiaoyuns.find(
        ({ sbgyXiaoyun }) => xiaoyunNumbers.includes(sbgyXiaoyun.xiaoyun),
      )
    : firstClassComponent.component.reading?.sbgyXiaoyuns?.[0];
  if (!xiaoyun) return katakana;

  const transcription = transcribeSbgyXiaoyun(xiaoyun.sbgyXiaoyun);
  return `${katakana}${transcription ? ` (${transcription})` : ""}`;
}
