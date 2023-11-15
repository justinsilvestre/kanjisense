import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

export function getActiveSoundMarkValueText(activeSoundMarkValue: {
  katakana: string;
  priority: {
    priority: number;
    xiaoyunsByMatchingType: Partial<Record<InferredOnyomiType, number[]>>;
  } | null;
}) {
  if (!activeSoundMarkValue) return null;

  return activeSoundMarkValue
    ? `${activeSoundMarkValue.katakana}${
        activeSoundMarkValue.priority
          ? ` ${JSON.stringify(
              activeSoundMarkValue.priority.xiaoyunsByMatchingType,
            )}`
          : ""
      }`
    : null;
}

export function parseActiveSoundMarkValue(activeSoundMarkValueText: string) {
  const [katakana, priorityText] = activeSoundMarkValueText.split(" ");
  const xiaoyunsByMatchingType = priorityText
    ? (JSON.parse(priorityText) as Record<InferredOnyomiType, number[]>)
    : null;

  return {
    katakana,
    xiaoyunsByMatchingType,
  };
}
