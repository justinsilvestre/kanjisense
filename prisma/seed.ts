import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedKanjiDbComposition } from "./prebuild/seedKanjiDbComposition.1";
import { seedKanjiDbSbgyNotes } from "./prebuild/seedKanjiDbSbgyNotes";
import { seedKanjiDbVariants } from "./prebuild/seedKanjiDbVariants";
import { seedKanjidic } from "./prebuild/seedKanjidic";
import { seedUnihan12 } from "./prebuild/seedUnihan12";
import { seedUnihan14 } from "./prebuild/seedUnihan14";
import { seedUnihan15 } from "./prebuild/seedUnihan15";

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
