import { PrismaClient, SbgyXiaoyun } from "@prisma/client";

import { toukeiBetsujiMappings } from "../../app/lib/dic/toukeiBetsujiMappings";

import { KanjiVariant, lookUpVariants } from "./KanjiVariant";

const VARIANT_TYPES_PRIORITY = [
  "NewStyle",
  "kSemanticVariant",
  "kZVariant",
  "kTraditionalVariant",
  "HanyuDaCidianVariant",
  "TwEduVariant",
  "HanyuDaCidianVariantReverse",
  "CjkviVariant",
] as KanjiVariant["variantType"][];
const variantTypesPrioritySet = new Set(VARIANT_TYPES_PRIORITY);

const entrySourceOverrides: Partial<Record<string, string[]>> = {
  罙: ["深"], // was treating 罙 as a variant of 冞,
  様: ["样"], // was taking 橡
  樣: ["样"], // was taking 橡
  体: ["體"], // was taking 体 in addition to 體
  "GWS-U6EA5-VAR-003": ["溥"],
  "GWS-U5C03-VAR-001": ["尃"],
  円: ["圎"], // was taking 元 in addition to 圎
};

export async function findGuangyunEntriesByShinjitai(
  prisma: PrismaClient,
  newToOldFiguresIds: Map<string, string[]>,
  sbgyCharactersToXiaoyunNumbers: Map<string, number[]>,
  newToZVariants14: Map<string, string[]>,
  shinjitai: string,
) {
  const entries = new Map<
    number,
    {
      xiaoyun: SbgyXiaoyun;
      matchingExemplars: string[];
    }
  >();
  const shinkyuuForms =
    entrySourceOverrides[shinjitai] ||
    toukeiBetsujiMappings[shinjitai] ||
    (newToOldFiguresIds.get(shinjitai) || []).concat(shinjitai);

  for (const jiForm of shinkyuuForms) {
    const jiXiaoyunNumbers = sbgyCharactersToXiaoyunNumbers.get(jiForm);

    const jiXiaoyuns = jiXiaoyunNumbers
      ? await prisma.sbgyXiaoyun.findMany({
          where: { xiaoyun: { in: jiXiaoyunNumbers } },
        })
      : [];
    for (const jiXiaoyun of jiXiaoyuns) {
      addEntry(jiXiaoyun, jiForm);
    }
  }

  if (!entries.size) {
    const zVariantForms = newToZVariants14.get(shinjitai);
    if (zVariantForms) {
      for (const zVariantForm of zVariantForms) {
        const zVariantEntries = await prisma.sbgyXiaoyun.findMany({
          where: {
            exemplars: { has: zVariantForm },
          },
        });

        for (const zVariantEntry of zVariantEntries) {
          addEntry(zVariantEntry, zVariantForm);
        }
      }
    }
  }

  if (!entries.size) {
    const backupVariants = (await lookUpVariants(prisma, shinkyuuForms))
      .filter((a) => variantTypesPrioritySet.has(a.variantType))
      .sort((a, b) => {
        const aTypeIndex = VARIANT_TYPES_PRIORITY.indexOf(a.variantType);
        const bTypeIndex = VARIANT_TYPES_PRIORITY.indexOf(b.variantType);
        return aTypeIndex - bTypeIndex;
      });
    for (const variant of backupVariants) {
      const backupEntries = await prisma.sbgyXiaoyun.findMany({
        where: { exemplars: { has: variant.character } },
      });
      for (const backupEntry of backupEntries) {
        addEntry(backupEntry, variant.character);
      }
    }
  }
  return entries;

  function addEntry(xiaoyun: SbgyXiaoyun, char: string) {
    if (!entries.has(xiaoyun.xiaoyun))
      entries.set(xiaoyun.xiaoyun, { xiaoyun, matchingExemplars: [] });
    entries.get(xiaoyun.xiaoyun)!.matchingExemplars.push(char);
  }
}
