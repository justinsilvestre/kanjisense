import { PrismaClient } from "@prisma/client";

export type SetupStep =
  | "KanjidicEntry"
  | "JMDictEntry"
  | "KanjiDbComposition"
  | "KanjiDbSbgyNote"
  | "KanjiDbVariant"
  | "KanjisenseFigureMeaning"
  | "KanjisenseFigureReading"
  | "KanjisenseFigureRelation"
  | "KanjisenseFigure"
  | "KanjiDbCharacterDerivation"
  | "KanjisenseActiveSoundMark"
  | "KanjisenseActiveSoundMarkValue"
  | "SbgyXiaoyun"
  | "SbgyXiaoyun"
  | "ScriptinAozoraFrequency"
  | "Unihan12"
  | "Unihan12"
  | "Unihan14"
  | "Unihan14"
  | "Unihan15"
  | "Unihan15"
  | "KanjisenseFigureImage"
  | "ShuowenImage"
  | "GlyphImage"
  | "KanjisenseVariantGroup";

export async function registerSeeded(prisma: PrismaClient, step: SetupStep) {
  if (!(await prisma.setup.findUnique({ where: { step } })))
    await prisma.setup.create({ data: { step } });
}
