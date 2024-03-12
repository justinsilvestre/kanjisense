/*
  Warnings:

  - Made the column `key` on table `GlyphImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseComponent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseFigure` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseFigureImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseFigureMeaning` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseFigureReading` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseFigureRelation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KanjisenseVariantGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GlyphImage" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseComponent" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseFigure" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseFigureImage" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseFigureMeaning" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseFigureReading" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseFigureRelation" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KanjisenseVariantGroup" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "version" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ShuowenImage" ALTER COLUMN "version" DROP DEFAULT;
