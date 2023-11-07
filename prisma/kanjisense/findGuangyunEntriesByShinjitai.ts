import { PrismaClient } from "@prisma/client";

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
  newToOld: Map<string, string[]>,
  newToZVariants14: Map<string, string[]>,
  shinjitai: string,
) {
  const entries = new Map<
    number,
    {
      xiaoyun: number;
      chars: string[];
    }
  >();

  const kyuujitaiForms = toKyuujitai(newToOld, shinjitai);
  const kyuujitaiEntries = await prisma.sbgyXiaoyun.findMany({
    where: {
      exemplars: { hasSome: kyuujitaiForms },
    },
  });
  for (const kyuujitaiEntry of kyuujitaiEntries) {
    const { xiaoyun, exemplars } = kyuujitaiEntry;
    for (const char of exemplars) {
      addEntry(xiaoyun, char);
    }
  }

  if (!entries.size) {
    const zVariantForms = newToZVariants14.get(shinjitai);
    if (zVariantForms) {
      const zVariantEntries = await prisma.sbgyXiaoyun.findMany({
        where: {
          exemplars: { hasSome: zVariantForms },
        },
      });
      for (const zVariantEntry of zVariantEntries) {
        const { xiaoyun, exemplars } = zVariantEntry;
        for (const char of exemplars) {
          addEntry(xiaoyun, char);
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
        const { xiaoyun, exemplars } = backupEntry;
        for (const char of exemplars) {
          addEntry(xiaoyun, char);
        }
      }
    }
  }
  return entries;

  function addEntry(xiaoyun: number, char: string) {
    if (!entries.has(xiaoyun)) entries.set(xiaoyun, { xiaoyun, chars: [] });
    entries.get(xiaoyun)!.chars.push(char);
  }
}
function toKyuujitai(newToOld: Map<string, string[]>, shinjitai: string) {
  return newToOld.get(shinjitai) ?? [];
}
