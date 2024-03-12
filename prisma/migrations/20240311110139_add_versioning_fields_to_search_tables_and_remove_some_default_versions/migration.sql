/*
  Warnings:

  - The primary key for the `SearchPropertiesOnFigure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type,text,display,version]` on the table `FigureSearchProperty` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FigureSearchProperty_type_text_display_key";

-- AlterTable
ALTER TABLE "FigureSearchProperty" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SearchPropertiesOnFigure" DROP CONSTRAINT "SearchPropertiesOnFigure_pkey",
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "SearchPropertiesOnFigure_pkey" PRIMARY KEY ("figureId", "searchPropertyKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FigureSearchProperty_type_text_display_version_key" ON "FigureSearchProperty"("type", "text", "display", "version");

-- CreateIndex
CREATE INDEX "KanjisenseFigure_version_idx" ON "KanjisenseFigure"("version");
