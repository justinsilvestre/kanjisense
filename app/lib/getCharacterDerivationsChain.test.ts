import { getCharacterDerivationsChain } from "../../prisma/kanjisense/getCharacterDerivationsChain";
import { CharacterOriginReference } from "../../prisma/kanjisense/parseEtymologyText";
import { CharacterOriginType } from "../../prisma/kanjisense/seedKanjiDbCharacterDerivations";

describe("getCharacterDerivationsChain", () => {
  it("works for 星", async () => {
    const chain = await getCharacterDerivationsChain(
      "星",
      new CharacterOriginReference(
        "星",
        "曐",
        CharacterOriginType.simplification,
      ),
      async (id) => {
        const map = new Map<string, string>([
          ["曐", "⿱晶生	生聲	2360020"],
          ["生", "象形	2150010"],
        ]);
        return map.get(id) ?? null;
      },
    );
    expect(chain).toEqual([
      new CharacterOriginReference(
        "星",
        "曐",
        CharacterOriginType.simplification,
      ),
      new CharacterOriginReference("曐", "生", CharacterOriginType.phonetic),
    ]);
  });
});
