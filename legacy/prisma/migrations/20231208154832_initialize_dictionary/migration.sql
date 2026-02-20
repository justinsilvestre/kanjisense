-- CreateEnum
CREATE TYPE "KanjisenseFigureImageType" AS ENUM ('Kvg', 'GlyphWiki');

-- CreateEnum
CREATE TYPE "KanjisenseComponentUseTag" AS ENUM ('directMeaningless', 'directMeaninglessSound', 'meaningfulIndirect', 'meaningfulIndirectSound', 'sound');

-- CreateEnum
CREATE TYPE "KanjiDbVariantType" AS ENUM ('VariationSelectorVariant', 'CjkviVariant', 'OldStyle', 'NewStyle', 'Borrowed', 'TwEduVariant', 'HanyuDaCidianVariant', 'HanyuDaCidianVariantReverse');

-- CreateEnum
CREATE TYPE "FigureSearchPropertyType" AS ENUM ('KEY', 'VARIANT', 'ONYOMI_KANA', 'ONYOMI_LATIN', 'KUNYOMI_KANA', 'KUNYOMI_LATIN', 'KUNYOMI_KANA_WITH_OKURIGANA', 'KUNYOMI_LATIN_WITH_OKURIGANA', 'KUNYOMI_KANA_MINUS_OKURIGANA', 'KUNYOMI_LATIN_MINUS_OKURIGANA', 'TRANSLATION_ENGLISH', 'MNEMONIC_ENGLISH');

-- CreateTable
CREATE TABLE "Setup" (
    "step" TEXT NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("step")
);

-- CreateTable
CREATE TABLE "KanjidicEntry" (
    "id" TEXT NOT NULL,
    "onReadings" TEXT[],
    "kunReadings" TEXT[],
    "tag" TEXT,
    "definitions" TEXT[],
    "meta" JSONB,

    CONSTRAINT "KanjidicEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unihan15" (
    "id" TEXT NOT NULL,
    "kDefinition" TEXT,
    "kCantonese" TEXT[],
    "kHangul" TEXT[],
    "kHanyuPinlu" TEXT[],
    "kHanyuPinyin" TEXT[],
    "kJapaneseKun" TEXT[],
    "kJapaneseOn" TEXT[],
    "kKorean" TEXT[],
    "kMandarin" TEXT[],
    "kTang" TEXT[],
    "kTGHZ2013" TEXT[],
    "kVietnamese" TEXT[],
    "kXHC1983" TEXT[],
    "kRSAdobe_Japan1_6" TEXT[],
    "kRSUnicode" TEXT[],

    CONSTRAINT "Unihan15_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unihan12" (
    "id" TEXT NOT NULL,
    "kZVariant" TEXT[],

    CONSTRAINT "Unihan12_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unihan14" (
    "id" TEXT NOT NULL,
    "kSemanticVariant" TEXT[],
    "kSimplifiedVariant" TEXT[],
    "kSpecializedSemanticVariant" TEXT[],
    "kTraditionalVariant" TEXT[],
    "kZVariant" TEXT[],

    CONSTRAINT "Unihan14_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiDbComposition" (
    "id" TEXT NOT NULL,
    "ids" TEXT,
    "etymology" TEXT,
    "sbgySyllables" INTEGER[],

    CONSTRAINT "KanjiDbComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiDbSbgyNote" (
    "character" TEXT NOT NULL,
    "syllable" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "KanjiDbSbgyNote_pkey" PRIMARY KEY ("character","syllable")
);

-- CreateTable
CREATE TABLE "KanjiDbVariant" (
    "variant" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "variantType" "KanjiDbVariantType" NOT NULL,

    CONSTRAINT "KanjiDbVariant_pkey" PRIMARY KEY ("variant","base","variantType")
);

-- CreateTable
CREATE TABLE "SbgyXiaoyun" (
    "xiaoyun" INTEGER NOT NULL,
    "exemplars" TEXT[],
    "fanqie" TEXT NOT NULL,
    "initial" TEXT NOT NULL,
    "cycleHead" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "kaihe" TEXT,
    "note" TEXT,
    "dengOrChongniu" TEXT,

    CONSTRAINT "SbgyXiaoyun_pkey" PRIMARY KEY ("xiaoyun")
);

-- CreateTable
CREATE TABLE "ScriptinAozoraFrequency" (
    "character" TEXT NOT NULL,
    "appearances" INTEGER NOT NULL,
    "fraction" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "ScriptinAozoraFrequency_pkey" PRIMARY KEY ("character")
);

-- CreateTable
CREATE TABLE "KanjisenseVariantGroup" (
    "id" TEXT NOT NULL,
    "variants" TEXT[],
    "hasStandaloneCharacter" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KanjisenseVariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjisenseFigureRelation" (
    "id" TEXT NOT NULL,
    "variantGroupId" TEXT,
    "directUses" TEXT[],
    "listsAsComponent" TEXT[],
    "isPriorityCandidate" BOOLEAN NOT NULL,
    "idsText" TEXT NOT NULL,
    "selectedIdsComponents" TEXT[],

    CONSTRAINT "KanjisenseFigureRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiDbCharacterDerivation" (
    "character" TEXT NOT NULL,
    "chain" JSONB NOT NULL,
    "phoneticOrigins" TEXT[],

    CONSTRAINT "KanjiDbCharacterDerivation_pkey" PRIMARY KEY ("character")
);

-- CreateTable
CREATE TABLE "KanjisenseFigure" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "isPriority" BOOLEAN NOT NULL,
    "isStandaloneCharacter" BOOLEAN NOT NULL DEFAULT false,
    "isPriorityComponent" BOOLEAN NOT NULL DEFAULT false,
    "isPrioritySoundMark" BOOLEAN NOT NULL DEFAULT false,
    "listsAsComponent" TEXT[],
    "listsAsCharacter" TEXT[],
    "shinjitaiInBaseKanji" TEXT,
    "aozoraAppearances" INTEGER NOT NULL,
    "activeSoundMarkValue" TEXT,
    "variantGroupId" TEXT,
    "componentsTree" JSONB,
    "shuowenImageId" TEXT,
    "mnemonicKeyword" TEXT,
    "activeSoundMarkId" TEXT,
    "readingId" TEXT,

    CONSTRAINT "KanjisenseFigure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjisenseComponent" (
    "id" TEXT NOT NULL,

    CONSTRAINT "KanjisenseComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjisenseComponentUse" (
    "componentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "indexInTree" INTEGER NOT NULL,
    "appearanceInParent" INTEGER NOT NULL,

    CONSTRAINT "KanjisenseComponentUse_pkey" PRIMARY KEY ("componentId","parentId","appearanceInParent")
);

-- CreateTable
CREATE TABLE "KanjisenseFigureReading" (
    "id" TEXT NOT NULL,
    "sbgyXiaoyunsMatchingExemplars" JSONB,
    "inferredOnReadingCandidates" JSONB NOT NULL,
    "kanjidicEntryId" TEXT,
    "unihan15Id" TEXT,
    "selectedOnReadings" TEXT[],

    CONSTRAINT "KanjisenseFigureReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjisenseFigureReadingToSbgyXiaoyun" (
    "figureReadingId" TEXT NOT NULL,
    "sbgyXiaoyunId" INTEGER NOT NULL,

    CONSTRAINT "KanjisenseFigureReadingToSbgyXiaoyun_pkey" PRIMARY KEY ("figureReadingId","sbgyXiaoyunId")
);

-- CreateTable
CREATE TABLE "KanjisenseFigureMeaning" (
    "id" TEXT NOT NULL,
    "unihanDefinition" TEXT,
    "kanjidicEnglish" TEXT[],

    CONSTRAINT "KanjisenseFigureMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjisenseFigureImage" (
    "id" TEXT NOT NULL,
    "type" "KanjisenseFigureImageType" NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "KanjisenseFigureImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShuowenImage" (
    "id" TEXT NOT NULL,
    "paths" TEXT[],

    CONSTRAINT "ShuowenImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlyphImage" (
    "id" TEXT NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "GlyphImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JmDictEntry" (
    "id" SERIAL NOT NULL,
    "head" TEXT NOT NULL,
    "readingText" TEXT NOT NULL,

    CONSTRAINT "JmDictEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FigureSearchProperty" (
    "type" "FigureSearchPropertyType" NOT NULL,
    "text" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "FigureSearchProperty_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SearchPropertiesOnFigure" (
    "figureId" TEXT NOT NULL,
    "searchPropertyKey" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "SearchPropertiesOnFigure_pkey" PRIMARY KEY ("figureId","searchPropertyKey")
);

-- CreateTable
CREATE TABLE "_allComponents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KanjisenseFigure_readingId_key" ON "KanjisenseFigure"("readingId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjisenseFigureReading_kanjidicEntryId_key" ON "KanjisenseFigureReading"("kanjidicEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "KanjisenseFigureReading_unihan15Id_key" ON "KanjisenseFigureReading"("unihan15Id");

-- CreateIndex
CREATE INDEX "JmDictEntry_head_readingText_idx" ON "JmDictEntry"("head", "readingText");

-- CreateIndex
CREATE UNIQUE INDEX "FigureSearchProperty_type_text_display_key" ON "FigureSearchProperty"("type", "text", "display");

-- CreateIndex
CREATE UNIQUE INDEX "_allComponents_AB_unique" ON "_allComponents"("A", "B");

-- CreateIndex
CREATE INDEX "_allComponents_B_index" ON "_allComponents"("B");

-- AddForeignKey
ALTER TABLE "KanjisenseFigure" ADD CONSTRAINT "KanjisenseFigure_activeSoundMarkId_fkey" FOREIGN KEY ("activeSoundMarkId") REFERENCES "KanjisenseComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigure" ADD CONSTRAINT "KanjisenseFigure_id_fkey" FOREIGN KEY ("id") REFERENCES "KanjisenseFigureRelation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigure" ADD CONSTRAINT "KanjisenseFigure_shuowenImageId_fkey" FOREIGN KEY ("shuowenImageId") REFERENCES "ShuowenImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigure" ADD CONSTRAINT "KanjisenseFigure_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "KanjisenseVariantGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigure" ADD CONSTRAINT "KanjisenseFigure_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "KanjisenseFigureReading"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "KanjisenseComponent" ADD CONSTRAINT "KanjisenseComponent_id_fkey" FOREIGN KEY ("id") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseComponentUse" ADD CONSTRAINT "KanjisenseComponentUse_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseComponentUse" ADD CONSTRAINT "KanjisenseComponentUse_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureReading" ADD CONSTRAINT "KanjisenseFigureReading_kanjidicEntryId_fkey" FOREIGN KEY ("kanjidicEntryId") REFERENCES "KanjidicEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureReading" ADD CONSTRAINT "KanjisenseFigureReading_unihan15Id_fkey" FOREIGN KEY ("unihan15Id") REFERENCES "Unihan15"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureReadingToSbgyXiaoyun" ADD CONSTRAINT "KanjisenseFigureReadingToSbgyXiaoyun_figureReadingId_fkey" FOREIGN KEY ("figureReadingId") REFERENCES "KanjisenseFigureReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureReadingToSbgyXiaoyun" ADD CONSTRAINT "KanjisenseFigureReadingToSbgyXiaoyun_sbgyXiaoyunId_fkey" FOREIGN KEY ("sbgyXiaoyunId") REFERENCES "SbgyXiaoyun"("xiaoyun") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureMeaning" ADD CONSTRAINT "KanjisenseFigureMeaning_id_fkey" FOREIGN KEY ("id") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjisenseFigureImage" ADD CONSTRAINT "KanjisenseFigureImage_id_fkey" FOREIGN KEY ("id") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlyphImage" ADD CONSTRAINT "GlyphImage_id_fkey" FOREIGN KEY ("id") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchPropertiesOnFigure" ADD CONSTRAINT "SearchPropertiesOnFigure_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchPropertiesOnFigure" ADD CONSTRAINT "SearchPropertiesOnFigure_searchPropertyKey_fkey" FOREIGN KEY ("searchPropertyKey") REFERENCES "FigureSearchProperty"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allComponents" ADD CONSTRAINT "_allComponents_A_fkey" FOREIGN KEY ("A") REFERENCES "KanjisenseComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allComponents" ADD CONSTRAINT "_allComponents_B_fkey" FOREIGN KEY ("B") REFERENCES "KanjisenseFigure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
