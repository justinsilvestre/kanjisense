import { PrismaClient } from "@prisma/client";

import { baseKanji } from "~/lib/baseKanji";

export async function getBaseKanjiVariantGroups(prisma: PrismaClient) {
  return Object.fromEntries(
    (
      await prisma.kanjisenseVariantGroup.findMany({
        where: { id: { in: [...baseKanji] } },
      })
    ).map((g) => [g.id, g]),
  );
}
