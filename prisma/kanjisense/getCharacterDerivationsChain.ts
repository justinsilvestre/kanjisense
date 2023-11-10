import {
  CharacterOriginReference,
  parseEtymologyText,
} from "./parseEtymologyText";

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
