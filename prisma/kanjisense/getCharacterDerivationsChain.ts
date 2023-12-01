export async function getCharacterDerivationsChain(
  id: string,
  originCharacter: CharacterOriginReference,
  lookUpEtymology: (id: string) => Promise<string | null>,
) {
  const chain: CharacterOriginReference[] = [];
  const visitedCharacters = new Set<string>([id]);
  let nextInChain: CharacterOriginReference | null = originCharacter;
  if (nextInChain)
    do {
      chain.push(nextInChain);
    } while (
      (nextInChain = await getNextInEtymologyChain(
        (id) => lookUpEtymology(id),
        nextInChain,
        visitedCharacters,
      ))
    );
  return chain;
}

async function getNextInEtymologyChain(
  lookUpEtymology: (id: string) => Promise<string | null>,
  item: CharacterOriginReference,
  visitedCharacters: Set<string>,
): Promise<CharacterOriginReference | null> {
  if (visitedCharacters.has(item.source)) {
    console.error(`cycle detected: ${item.source}`);
    return null;
  }
  visitedCharacters.add(item.source);
  const etymologyText = await lookUpEtymology(item.source);
  if (!etymologyText) return null;

  const etymology = parseEtymologyText(item.source, etymologyText);
  return etymology;
}
export enum CharacterOriginType {
  phonetic,
  simplification,
}
export class CharacterOriginReference {
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
    return [
      char,
      source,
      type === CharacterOriginType.phonetic ? "p" : "s",
    ] as [char: string, source: string, type: "p" | "s"];
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
export function parseEtymologyText(character: string, text: string) {
  if (text.includes("	或字	")) return null;

  const [, parentMatch] = text.match(/^→(\S+)(\t(簡体))?/u) || [];
  if (parentMatch) {
    return new CharacterOriginReference(
      character,
      parentMatch,
      CharacterOriginType.simplification,
    );
  }

  const [, soundMarkMatch] =
    text.match(/^\S+[\s】／]([^形])[省亦]?[聲声](.*)?$/u) || [];
  if (soundMarkMatch) {
    return new CharacterOriginReference(
      character,
      soundMarkMatch,
      CharacterOriginType.phonetic,
    );
  }

  if (text === "象形") return null;
  if (/^\S+\t(象形|指事|指示|會意)([\t].+)?/.test(text)) return null;

  if (/^←\S+/.test(text)) return null;

  if (/^</.test(text)) return null;

  // ⿰亻志	国字
  if (/^\S+\t(\S+\t)?国字/.test(text)) return null;

  //單	闕	0240050
  if (/^\S+\t闕(\t|$)/.test(text)) return null;

  if (/^\S(\t\d+)?/.test(text)) return null;

  console.error(`Problem parsing etym text for ${character} ${text}`);
  return null;
}
