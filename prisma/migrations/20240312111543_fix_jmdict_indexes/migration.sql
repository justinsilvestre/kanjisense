-- DropIndex
DROP INDEX "JmDictEntry_head_readingText_idx";

-- CreateIndex
CREATE INDEX "JmDictEntry_head_idx" ON "JmDictEntry"("head");

-- CreateIndex
CREATE INDEX "JmDictEntry_readingText_idx" ON "JmDictEntry"("readingText");
