export function OnAndGuangyunReadings({
  katakanaOn,
  guangyun,
  hasSoundMarkHighlight,
}: {
  katakanaOn?: string | null;
  guangyun?: string | null;
  hasSoundMarkHighlight?: boolean;
}) {
  if (!katakanaOn && !guangyun) return null;

  if (hasSoundMarkHighlight) {
    return (
      <span className="text-sm rounded border border-solid border-yellow-400 bg-yellow-100 bg-opacity-50 p-1">
        {katakanaOn}
        {guangyun ? <> {guangyun}</> : null}
      </span>
    );
  }

  return (
    <span className="text-sm">
      {katakanaOn}
      {guangyun ? <> {guangyun}</> : null}
    </span>
  );
}
