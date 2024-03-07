import { KanjiDbVariantType, Prisma, PrismaClient } from "@prisma/client";

import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { registerSeeded } from "../seedUtils";

// this reading isn't in modern usage,
// i.e. the simplified form was borrowed from an existing character
const suppressedOldVariants = new Set("糸虫万");

export async function seedKanjiDbVariants(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjiDbVariant" },
  });
  if (seeded && !force) console.log(`KanjiDbVariant already seeded. 🌱`);
  else {
    await prisma.kanjiDbVariant.deleteMany({});

    console.log(`seeding KanjiDbVariant...`);

    console.log("getting old-style variants");
    await getOldStyleDbVariants(prisma);
    console.log("getting borrowed variants");
    await getKanjiDbBorrowedVariant(prisma);
    console.log("getting twedu variants");
    await getKanjiDbTwEduVariants(prisma);
    console.log("getting hanyu dacidian variants");
    await getKanjiDbHanyuDaCidianVariants(prisma);

    await registerSeeded(prisma, "KanjiDbVariant");

    console.log(`KanjiDbVariant seeded. 🌱`);
  }
}

function getKanjiDbVariantTmpId(
  variantType: KanjiDbVariantType,
  variant: string,
  base: string,
) {
  return `${variant}@${base}@${variantType}`;
}
function registerVariant(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
  variant: string,
  base: string,
  variantType: KanjiDbVariantType,
) {
  dbInput.set(getKanjiDbVariantTmpId(variantType, variant, base), {
    variant,
    base,
    variantType,
  });
}

async function getOldStyleDbVariants(prisma: PrismaClient) {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await getkanjiDbOldStyleDbInput(dbInput);
  await getHyogaiDbInput();
  await getJinmeiDbInput(dbInput);
  await prisma.kanjiDbVariant.createMany({
    data: Array.from(dbInput, ([, { variant, base, variantType }]) => ({
      variant,
      base,
      variantType,
    })),
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

async function getkanjiDbOldStyleDbInput(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
) {
  await forEachLine(files.kanjiDbOldStyle, async (lineWithComments) => {
    if (
      !lineWithComments ||
      lineWithComments.startsWith("#") ||
      lineWithComments.startsWith("jp")
    )
      return;
    const line = lineWithComments.split(/\s#\s/)[0];
    const [, newChar, rest] = line.match(/^(\S).*\t(.+)/u) || [];
    if (!newChar) throw new Error(`Problem reading line ${line}`);
    const oldForms = rest.split("\t");
    for (const text of oldForms) {
      const [oldChar] = [...text];
      if (oldChar === "渚") console.log({ newChar, oldChar });
      if (oldChar) {
        registerOldAndNewVariants(dbInput, oldChar, newChar);
      }
    }
  });

  // given traditional form is a secondary variant
  deregisterOldAndNewVariants(dbInput, "羨");
  deregisterOldAndNewVariants(dbInput, "紋");
  //given traditional form doesnt seem valid
  deregisterOldAndNewVariants(dbInput, "棚");

  // 簾 and 廉 seem to be clearly distinguished in modern Japanese;
  // must have actually been mistake for 廉
  deregisterOldAndNewVariants(dbInput, "簾");
  // we don't want 欲 to be considered a component
  // if its only usage as a component is in a variant of itself
  // and that variant isn't even a base character (from our lists of important kanji).
  deregisterOldAndNewVariants(dbInput, "欲");

  // "擔" as old variant for "栃" is probably a mistake
  deregisterOldAndNewVariants(dbInput, "栃");

  // perhaps same as above (reading not in modern usage/simplified form borrowed from existing character)
  // except existing character has same meaning + diff pronunciation
  registerOldAndNewVariants(dbInput, "舉", "挙");

  // missing
  registerOldAndNewVariants(dbInput, "雞", "鶏");
  registerOldAndNewVariants(dbInput, "眾", "衆");
  registerOldAndNewVariants(dbInput, "榆", "楡");
  registerOldAndNewVariants(dbInput, "喻", "喩");
  registerOldAndNewVariants(dbInput, "溼", "湿");
  registerOldAndNewVariants(dbInput, "鄉", "郷");
  registerOldAndNewVariants(dbInput, "儘", "侭");

  registerOldAndNewVariants(dbInput, "吞", "呑");
  registerOldAndNewVariants(dbInput, "噓", "嘘");
  registerOldAndNewVariants(dbInput, "姸", "妍");
  registerOldAndNewVariants(dbInput, "繫", "繋");
  registerOldAndNewVariants(dbInput, "䟽", "疏");
}

async function getHyogaiDbInput() {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await forEachLine(files.kanjiDbHyogaiVariants, (line) => {
    if (!line || line.startsWith("#") || line.startsWith("hyo")) return;

    const [, oldChar, newVariant] =
      line.match(/(.),hyogai\/variant,(.)/u) || [];
    if (!oldChar) throw new Error(`Problem reading line ${line}`);

    registerOldAndNewVariants(dbInput, oldChar, newVariant);
  });
}

async function getJinmeiDbInput(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
) {
  await forEachLine(files.kanjiDbJinmeiVariants, (line) => {
    if (!line || line.startsWith("#") || line.startsWith("jin")) return;

    const [, newForm, oldForm] = line.match(/(.),jinmei\d\/variant,(.)/u) || [];
    if (!newForm) throw new Error(`Problem reading line ${line}`);

    registerOldAndNewVariants(dbInput, oldForm, newForm);
  });
}

function registerOldAndNewVariants(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
  oldForm: string,
  newForm: string,
) {
  if (oldForm === newForm && !suppressedOldVariants.has(oldForm)) {
    registerVariant(
      dbInput,
      oldForm,
      oldForm,
      KanjiDbVariantType.VariationSelectorVariant,
    );
  } else {
    registerVariant(dbInput, oldForm, newForm, KanjiDbVariantType.OldStyle);
    registerVariant(dbInput, newForm, oldForm, KanjiDbVariantType.NewStyle);
  }
}
function deregisterOldAndNewVariants(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
  newForm: string,
) {
  const oldForms = Object.entries(dbInput).filter(
    ([, { base, variantType }]) =>
      base === newForm && variantType === KanjiDbVariantType.OldStyle,
  );
  for (const [, { variant: oldForm }] of oldForms) {
    dbInput.delete(
      getKanjiDbVariantTmpId(KanjiDbVariantType.OldStyle, oldForm, newForm),
    );
    dbInput.delete(
      getKanjiDbVariantTmpId(KanjiDbVariantType.NewStyle, newForm, oldForm),
    );
  }
}
