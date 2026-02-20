// models with versioning and persistent key
// - KanjisenseFigure
// - KanjisenseFigureReading
// - KanjisenseFigureMeaning
// - KanjisenseFigureImage
// - KanjisenseVariantGroup
// - KanjisenseFigureRelation
// - KanjisenseComponent
// - GlyphImage // maybe can delete those fields
// models with versioning
// - ShuowenImage
// uses versioned data but currently has no version, may need one at some point
// - KanjiDbCharacterDerivation

import { PrismaClient } from "@prisma/client";

import { executeAndLogTime } from "prisma/kanjisense/executeAndLogTime";

export async function deleteOldFiguresData(
  prisma: PrismaClient,
  currentVersion: number,
) {
  const oldVersion = currentVersion - 1;
  console.log("deleting old figures data for version", oldVersion);

  await executeAndLogTime("delete old KanjisenseFigures", async () =>
    console.log(
      await prisma.kanjisenseFigure.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseFigureReadings", async () =>
    console.log(
      await prisma.kanjisenseFigureReading.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseFigureMeanings", async () =>
    console.log(
      await prisma.kanjisenseFigureMeaning.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseFigureImages", async () =>
    console.log(
      await prisma.kanjisenseFigureImage.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseVariantGroups", async () =>
    console.log(
      await prisma.kanjisenseVariantGroup.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseFigureRelations", async () =>
    console.log(
      await prisma.kanjisenseFigureRelation.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old KanjisenseComponents", async () =>
    console.log(
      await prisma.kanjisenseComponent.deleteMany({
        where: { version: oldVersion },
      }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old GlyphImages", async () =>
    console.log(
      await prisma.glyphImage.deleteMany({ where: { version: oldVersion } }),
      "deleted",
    ),
  );
  await executeAndLogTime("delete old ShuowenImages", async () =>
    console.log(
      await prisma.shuowenImage.deleteMany({ where: { version: oldVersion } }),
      "deleted",
    ),
  );
}
