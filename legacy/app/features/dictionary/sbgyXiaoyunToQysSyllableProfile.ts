import type { SbgyXiaoyun } from "@prisma/client";

import { QieyunRhymeCycleHead } from "~/lib/qys/QieyunRhymeCycleHead";
import { QysInitial } from "~/lib/qys/QysInitial";
import { Kaihe, QysSyllableProfile, Tone } from "~/lib/qys/QysSyllableProfile";

export function sbgyXiaoyunToQysSyllableProfile(
  xiaoyun: SbgyXiaoyun,
): QysSyllableProfile {
  const initial = xiaoyun.initial as QysInitial;
  return {
    initial,
    cycleHead: xiaoyun.cycleHead as QieyunRhymeCycleHead,
    tone: xiaoyun.tone as Tone,
    kaihe: xiaoyun.kaihe as Kaihe | null,
    dengOrChongniu:
      xiaoyun.dengOrChongniu as QysSyllableProfile["dengOrChongniu"],
  };
}
