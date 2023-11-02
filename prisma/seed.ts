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
import { seedKanjisenseVariantGroups } from "./kanjisense/seedKanjisenseVariantGroups";

const prisma = new PrismaClient();

async function seed() {
  const startTime = Date.now();

  await seedKanjidic(prisma);
  await seedUnihan15(prisma);
  await seedUnihan14(prisma);
  await seedUnihan12(prisma);
  await seedKanjiDbComposition(prisma);
  await seedKanjiDbVariants(prisma);
  await seedKanjiDbSbgyNotes(prisma);
  await seedSbgy(prisma);
  await seedScriptinAozoraFrequencies(prisma);
  await seedKanjisenseVariantGroups(prisma);

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
  console.log(`Took ${endTime - startTime}ms.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
