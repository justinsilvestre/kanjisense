import { PrismaClient } from "@prisma/client";

const RADICAL_ENTRY_REGEX = /radical \(no\.|radical number/;
export async function getFigureMeaningsText(
  prisma: PrismaClient,
  figureId: string,
) {
  const unihanDefinition = prisma.unihan15.findUnique({
    where: { id: figureId },
    select: { kDefinition: true },
  });
  const kanjidicEnglish = prisma.kanjidicEntry.findUnique({
    where: { id: figureId },
    select: { definitions: true },
  });

  return {
    unihanDefinitionText:
      (await unihanDefinition)?.kDefinition?.join("; ") || null,
    kanjidicEnglish:
      (await kanjidicEnglish)?.definitions?.filter(
        (e) => !RADICAL_ENTRY_REGEX.test(e),
      ) || [],
  };
}
