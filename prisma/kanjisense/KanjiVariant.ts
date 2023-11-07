import { KanjiDbVariantType, PrismaClient } from "@prisma/client";

import {
  Unihan14VariantFieldName,
  unihan14VariantFieldNames,
} from "../external/seedUnihan14";

export type KanjiVariant =
  | {
      character: string;
      variantType: Unihan14VariantFieldName;
      source: "Unihan14";
    }
  | {
      character: string;
      variantType: KanjiDbVariantType;
      source: "KanjiDb";
    }
  | {
      character: string;
      variantType: "kZVariant";
      source: "Unihan12";
    };

export async function lookUpVariants(
  prisma: PrismaClient,
  baseCharacters: string[],
): Promise<KanjiVariant[]> {
  const variants: KanjiVariant[] = [];

  const kanjiDbVariants = await prisma.kanjiDbVariant.findMany({
    where: { base: { in: baseCharacters } },
  });
  for (const { variant, variantType } of kanjiDbVariants) {
    variants.push({ character: variant, variantType, source: "KanjiDb" });
  }

  const unihan14Variants = await prisma.unihan14.findFirst({
    where: { id: { in: baseCharacters } },
  });
  if (unihan14Variants) {
    for (const variantType of unihan14VariantFieldNames) {
      for (const variant of unihan14Variants[variantType]) {
        variants.push({ character: variant, variantType, source: "Unihan14" });
      }
    }
  }

  const unihan12Variants = await prisma.unihan12.findFirst({
    where: { id: { in: baseCharacters } },
  });
  if (unihan12Variants) {
    for (const variant of unihan12Variants.kZVariant) {
      variants.push({
        character: variant,
        variantType: "kZVariant",
        source: "Unihan12",
      });
    }
  }

  return variants;
}
