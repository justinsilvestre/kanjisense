export function OnAndGuangyunReadings({
  katakanaOn,
  guangyun,
  hasSoundMarkHighlight,
  className,
}: {
  katakanaOn?: string | null;
  guangyun?: string | null;
  hasSoundMarkHighlight?: boolean;
  className?: string;
}) {
  if (!(katakanaOn && katakanaOn !== "[unavailable]") && !guangyun) return null;

  const availableKatakanaOn =
    katakanaOn === "[unavailable]" ? null : katakanaOn;
  if (hasSoundMarkHighlight) {
    return (
      <span
        className={`whitespace-nowrap rounded border border-solid border-yellow-400 bg-yellow-100 bg-opacity-50 p-1 text-sm ${className}`}
      >
        {availableKatakanaOn}
        {guangyun ? <> {guangyun}</> : null}
      </span>
    );
  }

  return (
    <span className={`text-sm ${className}`}>
      {availableKatakanaOn}
      {guangyun ? <> {guangyun}</> : null}
    </span>
  );
}
