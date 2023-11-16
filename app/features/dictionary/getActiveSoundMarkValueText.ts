import { SbgyXiaoyun } from "@prisma/client";

import { OnReadingToTypeToXiaoyuns } from "prisma/kanjisense/seedKanjisenseFigureReadings";
import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

export function serializeXiaoyunProfile(xiaoyun: SbgyXiaoyun) {
  return `${xiaoyun.initial}${xiaoyun.kaihe || "x"}${
    xiaoyun.dengOrChongniu || "x"
  }${xiaoyun.cycleHead}${xiaoyun.tone}`;
}

export function deserializeXiaoyunProfile(profile: string) {
  const [initial, kaihe, dengOrChongniu, cycleHead, tone] = profile.split("");
  return {
    initial,
    kaihe: kaihe === "x" ? null : kaihe,
    dengOrChongniu: dengOrChongniu === "x" ? null : dengOrChongniu,
    cycleHead,
    tone,
  };
}

export function getActiveSoundMarkValueText(activeSoundMarkValue: {
  katakana: string;
  priority?: {
    priority: number;
    xiaoyunsByMatchingType: OnReadingToTypeToXiaoyuns[string];
  } | null;
}) {
  if (!activeSoundMarkValue) return null;

  return activeSoundMarkValue
    ? `${activeSoundMarkValue.katakana}${
        activeSoundMarkValue.priority
          ? ` ${JSON.stringify(
              Object.fromEntries(
                Object.entries(
                  activeSoundMarkValue.priority.xiaoyunsByMatchingType,
                ).map(([type, xiaoyuns]) => [
                  type,
                  xiaoyuns.map((x) => `${x.xiaoyun}.${x.profile}`),
                ]),
              ),
            )}`
          : ""
      }`
    : null;
}

export function parseActiveSoundMarkValue(activeSoundMarkValueText: string) {
  const [katakana, priorityText] = activeSoundMarkValueText.split(" ");
  const xiaoyunsByMatchingTypeRaw = priorityText
    ? (JSON.parse(priorityText) as Record<InferredOnyomiType, string[]>)
    : null;

  const xiaoyunsByMatchingType: OnReadingToTypeToXiaoyuns[string] | null =
    xiaoyunsByMatchingTypeRaw && {};
  if (xiaoyunsByMatchingTypeRaw && xiaoyunsByMatchingType)
    Object.entries(xiaoyunsByMatchingTypeRaw).forEach(
      ([type, xiaoyunStrings]) => {
        xiaoyunsByMatchingType[type as InferredOnyomiType] = xiaoyunStrings.map(
          (xiaoyunString) => {
            const [number, profileString] = xiaoyunString.split(".");
            return {
              xiaoyun: +number,
              profile: profileString,
            };
          },
        );
      },
    );

  return {
    katakana,
    xiaoyunsByMatchingType,
  };
}

export function transcribeSerializedXiaoyunProfile(profileText: string) {
  const profile = deserializeXiaoyunProfile(profileText);
  return transcribeSbgyXiaoyun(
    profile as Pick<
      SbgyXiaoyun,
      "cycleHead" | "dengOrChongniu" | "initial" | "kaihe" | "tone"
    >,
  );
}
