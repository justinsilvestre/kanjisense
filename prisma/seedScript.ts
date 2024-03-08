import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedKanjiDbComposition } from "./external/seedKanjiDbComposition";
import { seedKanjiDbVariants } from "./external/seedKanjiDbVariants";
import { seedKanjidic } from "./external/seedKanjidic";
import { seedSbgy } from "./external/seedSbgy";
import { seedScriptinAozoraFrequencies } from "./external/seedScriptinAozoraFrequencies";
import { seedUnihan12 } from "./external/seedUnihan12";
import { seedUnihan14 } from "./external/seedUnihan14";
import { seedUnihan15 } from "./external/seedUnihan15";
import { executeAndLogTime } from "./kanjisense/executeAndLogTime";
import { seedFigureSearchProperties } from "./kanjisense/seedFigureSearchProperties";
import { seedGlyphImages } from "./kanjisense/seedGlyphImages";
import { seedKanjiDbCharacterDerivations } from "./kanjisense/seedKanjiDbCharacterDerivations";
import { seedKanjisenseActiveSoundMarks } from "./kanjisense/seedKanjisenseActiveSoundMarks";
import { seedKanjisenseActiveSoundMarkValues } from "./kanjisense/seedKanjisenseActiveSoundMarkValues";
import { seedFigureImages } from "./kanjisense/seedKanjisenseFigureImages";
import { seedKanjisenseFigureReadings } from "./kanjisense/seedKanjisenseFigureReadings";
import { seedKanjisenseFigureRelation } from "./kanjisense/seedKanjisenseFigureRelation";
import { seedKanjisenseFigures } from "./kanjisense/seedKanjisenseFigures";
import { seedKanjisenseFigureBadgeProps } from "./kanjisense/seedKanjisenseFiguresBadgeProps";
import { seedKanjisenseVariantGroups } from "./kanjisense/seedKanjisenseVariantGroups";
import { seedShuowenImages } from "./kanjisense/seedShuowenImages";
import { seedJMDict } from "./seedJMDict";

export async function seed(prisma: PrismaClient) {
  const startTime = Date.now();
  try {
    console.log(
      "disk usage before:",
      await prisma.$queryRaw`SELECT datname as db_name, pg_size_pretty(pg_database_size(datname)) as db_usage FROM pg_database`,
    );

    await executeAndLogTime("seeding kanjidic", () =>
      seedKanjidic(prisma, false),
    );
    await executeAndLogTime("seeding unihan15", () =>
      seedUnihan15(prisma, false),
    );
    await executeAndLogTime("seeding unihan14", () =>
      seedUnihan14(prisma, false),
    );
    await executeAndLogTime("seeding unihan12", () =>
      seedUnihan12(prisma, false),
    );
    await executeAndLogTime("seeding kanjiDB composition data", () =>
      seedKanjiDbComposition(prisma, false),
    );
    await executeAndLogTime("seeding kanjiDB variants", () =>
      seedKanjiDbVariants(prisma, false),
    );
    await executeAndLogTime("seeding sbgy", () => seedSbgy(prisma, false));
    await executeAndLogTime("seeding aozora frequencies", () =>
      seedScriptinAozoraFrequencies(prisma, false),
    );
    await executeAndLogTime("seeding kanjisense variant groups", () =>
      seedKanjisenseVariantGroups(prisma, false),
    );
    await executeAndLogTime("seeding kanjisense figure relations", () =>
      seedKanjisenseFigureRelation(prisma, false),
    );
    await executeAndLogTime("seeding kanjidb character derivations", () =>
      seedKanjiDbCharacterDerivations(prisma, false),
    );
    await executeAndLogTime("seeding kanjisense figures", () =>
      seedKanjisenseFigures(prisma, true),
    );
    await executeAndLogTime("seeding kanjisense active sound marks", () =>
      seedKanjisenseActiveSoundMarks(prisma, true),
    );
    await executeAndLogTime("seeding kanjisense figure badge props", () =>
      seedKanjisenseFigureBadgeProps(prisma, true, false),
    );
    await executeAndLogTime("seeding JMDict", () => seedJMDict(prisma));

    await executeAndLogTime("seeding kanjisense figure readings", () =>
      seedKanjisenseFigureReadings(prisma, true),
    );

    await executeAndLogTime("seeding kanjisense active sound mark values", () =>
      seedKanjisenseActiveSoundMarkValues(prisma, true),
    );

    await executeAndLogTime("seed figure images", () =>
      seedFigureImages(prisma, true),
    );

    await executeAndLogTime("seeding shuowen images", () =>
      seedShuowenImages(prisma, true),
    );
    await executeAndLogTime("seeding glyph images", () =>
      seedGlyphImages(prisma, true),
    );

    await executeAndLogTime("seeding kanjisense figure search properties", () =>
      seedFigureSearchProperties(prisma, 100, true),
    );

    console.log(
      "disk usage after:",
      await prisma.$queryRaw`SELECT datname as db_name, pg_size_pretty(pg_database_size(datname)) as db_usage FROM pg_database`,
    );
  } catch (error) {
    console.log(`❌ ${(Date.now() - startTime) / 1000}s.`);
    throw error;
  }
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const endTime = Date.now();

  console.log(`Database has been seeded. 🌱`);
  console.log(`Finished in ${(endTime - startTime) / 1000}s.`);
}
