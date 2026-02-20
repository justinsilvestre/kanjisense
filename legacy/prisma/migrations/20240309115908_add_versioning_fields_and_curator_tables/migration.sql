-- AlterTable
ALTER TABLE "GlyphImage" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseComponent" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseFigure" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseFigureImage" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseFigureMeaning" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseFigureReading" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseFigureRelation" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KanjisenseVariantGroup" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ShuowenImage" ADD COLUMN     "key" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BaseCorpusText" (
    "id" INTEGER NOT NULL,
    "course" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "author" TEXT,
    "source" TEXT NOT NULL,
    "section" TEXT,
    "dynasty" TEXT,
    "urls" TEXT[],
    "text" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "normalizedLength" INTEGER NOT NULL,
    "nonPriorityCharactersCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BaseCorpusText_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterUsagesOnBaseCorpusText" (
    "character" TEXT NOT NULL,
    "baseCorpusTextId" INTEGER NOT NULL,
    "frequencyScore" INTEGER NOT NULL,
    "baseCorpusTextLength" INTEGER NOT NULL,
    "baseCorpusUniqueCharactersCount" INTEGER NOT NULL,
    "baseCorpusUniqueComponentsCount" INTEGER NOT NULL,
    "baseCorpusTextNonPriorityCharactersCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CharacterUsagesOnBaseCorpusText_pkey" PRIMARY KEY ("baseCorpusTextId","character")
);

-- CreateTable
CREATE TABLE "ComponentUsagesOnBaseCorpusText" (
    "figureKey" TEXT NOT NULL,
    "baseCorpusTextId" INTEGER NOT NULL,
    "frequencyScore" INTEGER NOT NULL,
    "baseCorpusTextLength" INTEGER NOT NULL,
    "baseCorpusUniqueCharactersCount" INTEGER NOT NULL,
    "baseCorpusUniqueComponentsCount" INTEGER NOT NULL,

    CONSTRAINT "ComponentUsagesOnBaseCorpusText_pkey" PRIMARY KEY ("baseCorpusTextId","figureKey")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seenTexts" JSONB,
    "normalizedTextSearchQuery" TEXT NOT NULL DEFAULT '',
    "wantedCharacters" TEXT NOT NULL DEFAULT '',
    "minLength" INTEGER,
    "maxLength" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CharacterUsagesOnBaseCorpusText" ADD CONSTRAINT "CharacterUsagesOnBaseCorpusText_baseCorpusTextId_fkey" FOREIGN KEY ("baseCorpusTextId") REFERENCES "BaseCorpusText"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentUsagesOnBaseCorpusText" ADD CONSTRAINT "ComponentUsagesOnBaseCorpusText_baseCorpusTextId_fkey" FOREIGN KEY ("baseCorpusTextId") REFERENCES "BaseCorpusText"("id") ON DELETE CASCADE ON UPDATE CASCADE;
