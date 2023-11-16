import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedKanjiDbComposition } from "./external/seedKanjiDbComposition";
import { seedKanjiDbSbgyNotes } from "./external/seedKanjiDbSbgyNotes";
import { seedKanjiDbVariants } from "./external/seedKanjiDbVariants";
import { seedKanjidic } from "./external/seedKanjidic";
import { seedSbgy } from "./external/seedSbgy";
import { seedScriptinAozoraFrequencies } from "./external/seedScriptinAozoraFrequencies";
import { seedUnihan12 } from "./external/seedUnihan12";
import { seedUnihan14 } from "./external/seedUnihan14";
import { seedUnihan15 } from "./external/seedUnihan15";
import { executeAndLogTime } from "./kanjisense/executeAndLogTime";
import { seedKanjiDbCharacterDerivations } from "./kanjisense/seedKanjiDbCharacterDerivations";
import { seedKanjisenseActiveSoundMarks } from "./kanjisense/seedKanjisenseActiveSoundMarks";
import { seedKanjisenseActiveSoundMarkValues } from "./kanjisense/seedKanjisenseActiveSoundMarkValues";
import { seedFigureImages } from "./kanjisense/seedKanjisenseFigureImages";
import { seedKanjisenseFigureReadings } from "./kanjisense/seedKanjisenseFigureReadings";
import { seedKanjisenseFigureRelation } from "./kanjisense/seedKanjisenseFigureRelation";
import { seedKanjisenseFigures } from "./kanjisense/seedKanjisenseFigures";
import { seedKanjisenseVariantGroups } from "./kanjisense/seedKanjisenseVariantGroups";
import { seedJMDict } from "./seedJMDict";

const prisma = new PrismaClient();

async function seed() {
  const startTime = Date.now();
  try {
    await executeAndLogTime("seeding kanjidic", () => seedKanjidic(prisma));
    await executeAndLogTime("seeding unihan15", () => seedUnihan15(prisma));
    await executeAndLogTime("seeding unihan14", () => seedUnihan14(prisma));
    await executeAndLogTime("seeding unihan12", () => seedUnihan12(prisma));
    await executeAndLogTime("seeding kanjiDB composition data", () =>
      seedKanjiDbComposition(prisma),
    );
    await executeAndLogTime("seeding kanjiDB variants", () =>
      seedKanjiDbVariants(prisma),
    );
    await executeAndLogTime("seeding sbgynotes", () =>
      seedKanjiDbSbgyNotes(prisma),
    );
    await executeAndLogTime("seeding sbgy", () => seedSbgy(prisma));
    await executeAndLogTime("seeding aozora frequencies", () =>
      seedScriptinAozoraFrequencies(prisma),
    );
    await executeAndLogTime("seeding kanjisense variant groups", () =>
      seedKanjisenseVariantGroups(prisma),
    );
    await executeAndLogTime("seeding kanjisense figure relations", () =>
      seedKanjisenseFigureRelation(prisma, false),
    );
    await executeAndLogTime("seeding kanjidb character derivations", () =>
      seedKanjiDbCharacterDerivations(prisma, false),
    );
    await executeAndLogTime("seeding kanjisense figures", () =>
      seedKanjisenseFigures(prisma, false),
    );
    await executeAndLogTime("seeding kanjisense active sound marks", () =>
      seedKanjisenseActiveSoundMarks(prisma, false),
    );
    await executeAndLogTime("seeding JMDict", () => seedJMDict(prisma));

    await executeAndLogTime("seeding kanjisense figure readings", () =>
      seedKanjisenseFigureReadings(prisma, false),
    );

    await executeAndLogTime("seeding kanjisense active sound mark values", () =>
      seedKanjisenseActiveSoundMarkValues(prisma, false),
    );

    await executeAndLogTime("seed figure images", () =>
      seedFigureImages(prisma, false),
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

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
