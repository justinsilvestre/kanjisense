import { KanjiDbVariantType, Prisma } from "@prisma/client";

import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

// this reading isn't in modern usage,
// i.e. the simplified form was borrowed from an existing character
export const suppressedOldVariants = new Set("糸虫万");

export async function getOldStyleDbVariants() {
  const dbInput = new Map<string, Prisma.KanjiDbVariantCreateManyInput>();
  await getkanjiDbOldStyleDbInput(dbInput);
  await amendOldStyleVariants(dbInput);
  await getHyogaiDbInput(dbInput);
  await getJinmeiDbInput(dbInput);

  return dbInput;
}

export async function getkanjiDbOldStyleDbInput(
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
      if (oldChar) {
        registerOldAndNewVariants(dbInput, oldChar, newChar);
      }
    }
  });
}

async function getHyogaiDbInput(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
) {
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

export function amendOldStyleVariants(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
) {
  deregisterOldAndNewVariants(dbInput, "紋");
  //given traditional form doesnt seem valid
  deregisterOldAndNewVariants(dbInput, "棚");

  // 簾 and 廉 seem to be clearly distinguished in modern Japanese;
  // must have actually been mistake for 廉
  deregisterOldAndNewVariants(dbInput, "簾");
  // deregisterOldAndNewVariants(dbInput, "廉");
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

  return dbInput;
}
export function deregisterOldAndNewVariants(
  dbInput: Map<string, Prisma.KanjiDbVariantCreateManyInput>,
  newForm: string,
) {
  const oldForms = [...dbInput.values()].filter(
    ({ base, variantType }) =>
      base === newForm && variantType === KanjiDbVariantType.OldStyle,
  );
  for (const { variant: oldForm } of oldForms) {
    dbInput.delete(
      getKanjiDbVariantTmpId(KanjiDbVariantType.OldStyle, oldForm, newForm),
    );
    dbInput.delete(
      getKanjiDbVariantTmpId(KanjiDbVariantType.NewStyle, newForm, oldForm),
    );
  }
}
export function registerOldAndNewVariants(
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
export function getKanjiDbVariantTmpId(
  variantType: KanjiDbVariantType,
  variant: string,
  base: string,
) {
  return `${variant}@${base}@${variantType}`;
}
export function registerVariant(
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
