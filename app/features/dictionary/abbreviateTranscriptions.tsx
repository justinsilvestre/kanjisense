export function abbreviateTranscriptions(transcriptions: string[]) {
  const tonelessTranscriptionsToTones = new Map<string, string[]>();
  for (const transcription of transcriptions) {
    const toneMark = /[ˬˎ]/.test(transcription.at(-1) || "")
      ? transcription.at(-1) || ""
      : "";
    const tonelessTranscription = toneMark
      ? transcription.slice(0, -1)
      : transcription;
    const tones =
      tonelessTranscriptionsToTones.get(tonelessTranscription) ?? [];
    tonelessTranscriptionsToTones.set(tonelessTranscription, tones);
    tones.push(toneMark);
  }
  const abbreviated: string[] = [];
  for (const [tonelessTranscription, tones] of tonelessTranscriptionsToTones) {
    if (tones.length === 1) {
      abbreviated.push(tonelessTranscription + tones[0]);
    } else {
      const withParens =
        tones.length > 1 && tones.includes("")
          ? (toneMarks: string) => `₍${toneMarks}₎`
          : (toneMarks: string) => toneMarks;

      abbreviated.push(`${tonelessTranscription}${withParens(tones.join(""))}`);
    }
  }

  return abbreviated.join(" ");
}
