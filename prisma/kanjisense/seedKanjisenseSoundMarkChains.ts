import { PrismaClient } from "@prisma/client";

import { registerSeeded } from "../seedUtils";

export async function seedKanjisenseSoundMarkChains(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseSoundMark" },
  });
  if (seeded && !force) console.log(`KanjisenseSoundMark already seeded. 🌱`);
  else {
    console.log(`seeding KanjisenseSoundMark...`);

    const dbInput = new Map<string, CreateSoundMarkInput>();

    // first pass: find provisional sound marks
    const figuresIds = (await prisma.kanjisenseFigureRelation.findMany()).map(
      ({ id }) => id,
    );
    const kanjiDbEtymologies = await prisma.kanjiDbComposition.findMany({
      where: { id: { in: figuresIds }, etymology: { not: null } },
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

    for (const { id, etymology: etymologyText } of kanjiDbEtymologies) {
      const originCharacter = parseEtymologyText(id, etymologyText!);
      if (originCharacter) {
        const chain: CharacterOriginReference[] = [];
        let nextInChain: CharacterOriginReference | null = originCharacter;
        if (nextInChain)
          do {
            chain.push(nextInChain);
          } while (
            (nextInChain = await getNextInEtymologyChain(
              prisma,
              kanjiDbEtymologiesCache,
              nextInChain,
            ))
          );
        dbInput.set(id, {
          character: id,
          chain,
        });
      }
    }

    await prisma.kanjisenseSoundMark.deleteMany({});
    await prisma.kanjisenseSoundMark.createMany({
      data: [...dbInput.values()].map(({ character, chain }) => ({
        character,
        chain: chain.map((item) => item.toJSON()),
      })),
    });

    await registerSeeded(prisma, "KanjisenseSoundMark");
  }

  console.log(`KanjisenseSoundMark seeded. 🌱`);
}

class CreateSoundMarkInput {
  constructor(
    public character: string,
    public chain: CharacterOriginReference[],
  ) {}
}

enum CharacterOriginType {
  phonetic,
  simplification,
}

class CharacterOriginReference {
  char: string;
  source: string;
  type: CharacterOriginType;
  constructor(char: string, source: string, type: CharacterOriginType) {
    this.char = char;
    this.source = source;
    this.type = type;
  }

  isPhonetic() {
    return this.type === CharacterOriginType.phonetic;
  }

  isSimplification() {
    return this.type === CharacterOriginType.simplification;
  }

  toJSON() {
    const { char, source, type } = this;
    return [char, source, type === CharacterOriginType.phonetic ? "p" : "s"];
  }
  static fromJSON(json: ReturnType<CharacterOriginReference["toJSON"]>) {
    const [char, source, typeCode] = json;
    return new CharacterOriginReference(
      char,
      source,
      typeCode === "p"
        ? CharacterOriginType.phonetic
        : CharacterOriginType.simplification,
    );
  }
}

function parseEtymologyText(character: string, text: string) {
  const [, parentMatch] = text.match(/^→(\S+)[^簡体]*(?<comment>#.+)?$/u) || [];
  if (parentMatch) {
    return new CharacterOriginReference(
      character,
      parentMatch,
      CharacterOriginType.simplification,
    );
  }

  const [, soundMarkMatch] =
    text.match(/[\s】／]([^形])[省亦]?[聲声](.*)?$/u) || [];
  if (soundMarkMatch) {
    return new CharacterOriginReference(
      character,
      soundMarkMatch,
      CharacterOriginType.phonetic,
    );
  }

  return null;
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

async function getNextInEtymologyChain(
  prisma: PrismaClient,
  etymologiesCache: Map<string, string>,
  item: CharacterOriginReference,
): Promise<CharacterOriginReference | null> {
  if (item.isPhonetic()) {
    const etymologyText = await lookUpKanjiDbEtymology(
      prisma,
      etymologiesCache,
      item.source,
    );
    if (!etymologyText) return null;
    const etymology = parseEtymologyText(item.source, etymologyText);
    return etymology;
  }
  return null;
}
