import { PrismaClient } from "@prisma/client";

import { baseKanji } from "~/lib/baseKanji";
import { FIGURES_VERSION } from "~/models/figure";

/** variant group head key to all variants */
export async function getBaseKanjiVariantGroups(prisma: PrismaClient) {
  return Object.fromEntries(
    (
      await prisma.kanjisenseVariantGroup.findMany({
        where: { key: { in: [...baseKanji] }, version: FIGURES_VERSION },
      })
    ).map((g) => [g.key, g]),
  );
}
