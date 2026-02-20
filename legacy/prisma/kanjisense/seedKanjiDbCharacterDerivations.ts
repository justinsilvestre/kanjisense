import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";

import { runSetupStep } from "../seedUtils";

import {
  getCharacterDerivationsChain,
  CharacterOriginReference,
  parseEtymologyText,
} from "./getCharacterDerivationsChain";
import { inBatchesOf } from "./inBatchesOf";

export async function seedKanjiDbCharacterDerivations(
  prisma: PrismaClient,
  figuresVersion: number,
  force = false,
) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    version: "KEYLESS STEP",
    force,
    step: "KanjiDbCharacterDerivation",
    async setup() {
      const dbInput = new Map<string, CreateSoundMarkInput>();

      const figuresKeys = (
        await prisma.kanjisenseFigureRelation.findMany({
          where: { version: figuresVersion },
          select: { key: true },
        })
      ).map(({ key }) => key);
      const kanjiDbEtymologies = await prisma.kanjiDbComposition.findMany({
        where: { id: { in: figuresKeys }, etymology: { not: null } },
      });
      const kanjiDbEtymologiesCache = new Map<string, string>(
        kanjiDbEtymologies.map(({ id, etymology }) => [id, etymology!]),
      );

      kanjiDbEtymologiesCache.set("录", "→彔");
      kanjiDbEtymologiesCache.set("虽", "→虽");
      kanjiDbEtymologiesCache.set("叱", "→𠮟");
      kanjiDbEtymologiesCache.set("𠮟", "⿰口七	七聲");
      kanjiDbEtymologiesCache.set("教", "⿰孝攵	孝聲");
      kanjiDbEtymologiesCache.set("少", "⿰小丿	小聲");
      kanjiDbEtymologiesCache.set("摒", "⿰扌屛	屛聲");
      kanjiDbEtymologiesCache.set("將", "⿰爿⿱肉寸	會意	0890030"); // comment threw parsing off: # 【字通】醬聲はありえない
      kanjiDbEtymologiesCache.set("㓞", "⿰丰刀	會意");
      kanjiDbEtymologiesCache.set("雧", "⿱雥木	會意"); // 木 doesn't fit as phonetic

      for (const { id, etymology: etymologyText } of kanjiDbEtymologies) {
        const originCharacter = parseEtymologyText(id, etymologyText!);
        if (originCharacter) {
          const chain: CharacterOriginReference[] =
            await getCharacterDerivationsChain(id, originCharacter, (id) =>
              lookUpKanjiDbEtymology(prisma, kanjiDbEtymologiesCache, id),
            );
          dbInput.set(id, {
            character: id,
            chain,
          });
        }
      }

      await prisma.kanjiDbCharacterDerivation.deleteMany({});

      await inBatchesOf({
        batchSize: 500,
        collection: dbInput,
        getBatchItem: ([, { character, chain }]) => ({
          character,
          chain: chain.map((o) => o.toJSON()),
          phoneticOrigins: chain.flatMap((o) =>
            o.isPhonetic() ? [o.source] : [],
          ),
        }),
        action: async (batch) => {
          await prisma.kanjiDbCharacterDerivation.createMany({
            data: batch,
          });
        },
      });
    },
  });
}

class CreateSoundMarkInput {
  constructor(
    public character: string,
    public chain: CharacterOriginReference[],
  ) {}
}

async function lookUpKanjiDbEtymology(
  prisma: PrismaClient,
  cache: Map<string, string>,
  id: string,
) {
  if (cache.has(id)) {
    return cache.get(id)!;
  } else {
    const kanjiDbEtymology = await prisma.kanjiDbComposition.findUnique({
      where: { id },
    });
    if (kanjiDbEtymology) {
      cache.set(id, kanjiDbEtymology.etymology!);
      return kanjiDbEtymology.etymology!;
    } else {
      return null;
    }
  }
}
