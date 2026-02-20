import { KanjiDbVariantType, Prisma, PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { runSetupStep } from "../seedUtils";

import {
  getOldStyleDbVariants,
  registerVariant,
} from "./getOldStyleDbVariants";

export async function seedKanjiDbVariants(prisma: PrismaClient, force = false) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    step: "KanjiDbVariant",
    force,
    version: "KEYLESS STEP",
    async setup() {
      await prisma.kanjiDbVariant.deleteMany({});

      console.log("getting old-style variants");
      const oldStyleDbVariants = await getOldStyleDbVariants();

      await prisma.kanjiDbVariant.createMany({
        data: Array.from(
          oldStyleDbVariants,
          ([, { variant, base, variantType }]) => ({
            variant,
            base,
            variantType,
          }),
        ),
      });
      console.log("getting borrowed variants");
      await getKanjiDbBorrowedVariant(prisma);
      console.log("getting twedu variants");
      await getKanjiDbTwEduVariants(prisma);
      console.log("getting hanyu dacidian variants");
      await getKanjiDbHanyuDaCidianVariants(prisma);
    },
  });
}

async function getKanjiDbBorrowedVariant(prisma: PrismaClient) {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await forEachLine(files.kanjiDbBorrowedInput, (line) => {
    if (!line || line.startsWith("#") || line.startsWith("jp")) return;

    const [, char, variant] = line.match(/(.),jp\/borrowed,(.)/u) || [];
    if (!char) throw new Error(`Problem reading line "${line}"`);

    registerVariant(dbInput, char, variant, KanjiDbVariantType.Borrowed);
  });

  await prisma.kanjiDbVariant.createMany({
    data: Array.from(dbInput, ([, { variant, base, variantType }]) => ({
      variant,
      base,
      variantType,
    })),
  });
}

async function getKanjiDbTwEduVariants(prisma: PrismaClient) {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await forEachLine(files.kanjiDbTwEduVariants, (line) => {
    if (!line || line.startsWith("#") || line.startsWith("tw")) return;

    const [, char, variant] = line.match(/(.),twedu\/variant,(.)$/u) || [];
    if (!char) throw new Error(`Problem reading line "${line}"`);

    registerVariant(dbInput, char, variant, KanjiDbVariantType.TwEduVariant);
  });

  await prisma.kanjiDbVariant.createMany({
    data: Array.from(dbInput, ([, { variant, base, variantType }]) => ({
      variant,
      base,
      variantType,
    })),
  });
}

async function getKanjiDbHanyuDaCidianVariants(prisma: PrismaClient) {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await forEachLine(files.kanjiDbHanyuDaCidianVariants, (line) => {
    if (!line || line.startsWith("#") || line.startsWith("hy")) return;

    const [, char, variantType, variant] =
      line.match(/(.),(.+\/.+),(.)/u) || [];
    if (!char) throw new Error(`Problem reading line ${line}`);
    if (variantType !== "hydzd/variant") return;
    if (!char) throw new Error(`Problem reading line "${line}"`);

    registerVariant(
      dbInput,
      char,
      variant,
      KanjiDbVariantType.HanyuDaCidianVariant,
    );

    registerVariant(
      dbInput,
      variant,
      char,
      KanjiDbVariantType.HanyuDaCidianVariantReverse,
    );
  });

  await prisma.kanjiDbVariant.createMany({
    data: Array.from(dbInput, ([, { variant, base, variantType }]) => ({
      variant,
      base,
      variantType,
    })),
  });
}
