import { CharacterOriginType } from "./seedKanjiDbCharacterDerivations";

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
