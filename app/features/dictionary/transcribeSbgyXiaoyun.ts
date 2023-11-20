import type { SbgyXiaoyun } from "@prisma/client";

import { Kaihe } from "~/lib/qys/inferOnyomi";
import { QysInitial } from "~/lib/qys/QysInitial";
import {
  QysTranscriptionProfile,
  transcribe,
  TranscriptionOptions,
} from "~/lib/qys/transcribeXiaoyun";

export function transcribeSbgyXiaoyun(
  sbgyXiaoyun: Pick<
    SbgyXiaoyun,
    "cycleHead" | "dengOrChongniu" | "initial" | "kaihe" | "tone"
  >,
  options?: TranscriptionOptions,
) {
  const transcriptionProfile: QysTranscriptionProfile = {
    is合口: sbgyXiaoyun.kaihe === Kaihe.Closed,
    canonical母: sbgyXiaoyun.initial as QysInitial,
    tone聲: sbgyXiaoyun.tone as QysTranscriptionProfile["tone聲"],
    is重紐A類: sbgyXiaoyun.dengOrChongniu === "A",
    qieyunCycleHead韻: sbgyXiaoyun.cycleHead,
    contrastiveRow等: sbgyXiaoyun.dengOrChongniu,
  };
  return transcribe(transcriptionProfile, options);
}
