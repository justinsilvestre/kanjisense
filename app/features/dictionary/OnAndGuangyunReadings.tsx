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
  if (!katakanaOn && !guangyun) return null;

  if (hasSoundMarkHighlight) {
    return (
      <span
        className={`whitespace-nowrap rounded border border-solid border-yellow-400 bg-yellow-100 bg-opacity-50 p-1 text-sm ${className}`}
      >
        {katakanaOn}
        {guangyun ? <> {guangyun}</> : null}
      </span>
    );
  }

  return (
    <span className={`text-sm ${className}`}>
      {katakanaOn}
      {guangyun ? <> {guangyun}</> : null}
    </span>
  );
}
