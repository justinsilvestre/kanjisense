import { PrismaClient } from "@prisma/client";

import { inBatchesOf } from "prisma/kanjisense/inBatchesOf";
import { files } from "~/lib/files.server";
import { forEachLine } from "~/lib/forEachLine.server";

import { registerSeeded } from "../seedUtils";

export type Unihan14VariantFieldName =
  | "kSemanticVariant"
  | "kSimplifiedVariant"
  | "kSpecializedSemanticVariant"
  | "kTraditionalVariant"
  | "kZVariant";
export const unihan14VariantFieldNames = new Set<Unihan14VariantFieldName>([
  "kSemanticVariant",
  "kSimplifiedVariant",
  "kSpecializedSemanticVariant",
  "kTraditionalVariant",
  "kZVariant",
]);
function fieldNameIsValid(
  fieldName: string,
): fieldName is Unihan14VariantFieldName {
  return unihan14VariantFieldNames.has(
    fieldName as unknown as Unihan14VariantFieldName,
  );
}

export async function seedUnihan14(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "Unihan14" },
  });
  if (seeded && !force) console.log(`Unihan14 already seeded. 🌱`);
  else {
    console.log(`seeding Unihan14...`);

    await prisma.unihan14.deleteMany({});

    const dbInput = new Map<string, Record<string, string[]>>();

    await forEachLine(files.unihanVariants14, async (line) => {
      if (!line || line.startsWith("#")) return;

      const { uCode, fieldName, body } =
        /U\+(?<uCode>[A-Z0-9]+)\s+(?<fieldName>\w+)\s+(?<body>.+)/u.exec(line)!
          .groups!;
      const head = charFromUCode(uCode);

      if (!fieldNameIsValid(fieldName)) return;

      const variants = body.split(" ").flatMap((entry) => {
        const match = entry.match(/U\+([A-Z0-9]{4,9})<?/u)!;
        if (!match) throw new Error(line + "\n" + entry);
        const code = match[1];
        return charFromUCode(code);
      });

      for (const variant of variants) {
        registerVariant(dbInput, head, fieldName, variant);
      }
    });

    // guangyun only has the variant form.
    registerVariant(dbInput, "嶋", "kSemanticVariant", "㠀");
    registerVariant(dbInput, "㠀", "kSemanticVariant", "嶋");
    registerVariant(dbInput, "既", "kSemanticVariant", "旣");
    registerVariant(dbInput, "旣", "kSemanticVariant", "既");

    // https://glyphwiki.org/wiki/Group:%e6%8b%a1%e5%bc%b5%e6%96%b0%e6%97%a7
    // http://www.asahi-net.or.jp/~ax2s-kmtn/ref/jis2000-2004.html
    registerVariant(dbInput, "倶", "kZVariant", "俱");
    registerVariant(dbInput, "俱", "kZVariant", "倶");

    await inBatchesOf(1000, dbInput, async (batch) => {
      await prisma.unihan14.createMany({
        data: Array.from(batch, ([id, fields]) => ({
          id,
          kSemanticVariant: fields.kSemanticVariant || [],
          kSimplifiedVariant: fields.kSimplifiedVariant || [],
          kSpecializedSemanticVariant: fields.kSpecializedSemanticVariant || [],
          kTraditionalVariant: fields.kTraditionalVariant || [],
          kZVariant: fields.kZVariant || [],
        })),
      });
    });

    await registerSeeded(prisma, "Unihan14");

    console.log(`Unihan14 seeded. 🌱`);
  }
}

function registerVariant(
  json: Map<string, Record<string, string[]>>,
  id: string,
  fieldName:
    | "kSemanticVariant"
    | "kSimplifiedVariant"
    | "kSpecializedSemanticVariant"
    | "kTraditionalVariant"
    | "kZVariant",

  body: string,
) {
  const entry = json.get(id) || {};
  entry[fieldName] = entry[fieldName] || [];
  entry[fieldName].push(body);
  json.set(id, entry);
}

function charFromUCode(uCode: string) {
  return String.fromCodePoint(parseInt(uCode, 16));
}
