import { PrismaClient, SbgyXiaoyun } from "@prisma/client";

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

export async function findGuangyunEntriesByShinjitai(
  prisma: PrismaClient,
  newToOldFiguresIds: Map<string, string[]>,
  oldFiguresToXiaoYuns: Map<string, SbgyXiaoyun[]>,
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

  const kyuujitaiForms = newToOldFiguresIds.get(shinjitai) || [];

  for (const kyuujitaiForm of kyuujitaiForms) {
    const kyuujitaiXiaoyuns = oldFiguresToXiaoYuns.get(kyuujitaiForm) || [];
    for (const kyuujitaiXiaoyun of kyuujitaiXiaoyuns) {
      addEntry(kyuujitaiXiaoyun, kyuujitaiForm);
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
    const backupVariants = (
      await lookUpVariants(prisma, [shinjitai, ...kyuujitaiForms])
    )
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