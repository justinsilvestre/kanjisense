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

  it("works for 青", async () => {
    const chain = await getCharacterDerivationsChain(
      "青",
      new CharacterOriginReference(
        "青",
        "靑",
        CharacterOriginType.simplification,
      ),
      async (id) => {
        const map = new Map<string, string>([
          ["青", "→靑"],
          ["靑", "→𤯞		1760010"],
          ["𤯞", "⿱生丹	生聲"],
          ["生", "象形	2150010"],
        ]);
        return map.get(id) ?? null;
      },
    );
    console.log(chain);
    expect(chain).toEqual([
      new CharacterOriginReference(
        "青",
        "靑",
        CharacterOriginType.simplification,
      ),
      new CharacterOriginReference(
        "靑",
        "𤯞",
        CharacterOriginType.simplification,
      ),
      new CharacterOriginReference("𤯞", "生", CharacterOriginType.phonetic),
    ]);
  });

  it("works for 党", async () => {
    const chain = await getCharacterDerivationsChain(
      "党",
      new CharacterOriginReference(
        "党",
        "黨",
        CharacterOriginType.simplification,
      ),
      async (id) => {
        const map = new Map<string, string>([
          ["党", "→黨	簡体"],
          ["黨", "⿰黑尚	尚聲	3840230"],
        ]);
        return map.get(id) ?? null;
      },
    );
    console.log(chain);
    expect(chain).toEqual([
      new CharacterOriginReference(
        "党",
        "黨",
        CharacterOriginType.simplification,
      ),
      new CharacterOriginReference("黨", "尚", CharacterOriginType.phonetic),
    ]);
  });
});
