import { getFigureSearchProperties } from "prisma/kanjisense/getFigureSearchProperties";
import { SearchPropertySpecs } from "prisma/kanjisense/SearchPropertySpecs";

describe("getFigureSearchProperties", () => {
  // works with nuno KIN
  it("should return the correct search properties for a figure", () => {
    expect(
      Object.values(
        getFigureSearchProperties("巾", {
          kunyomi: ["おお.い", "ちきり", "きれ"],
          onyomi: ["キン", "フク"],
          english: [
            "towel",
            "hanging scroll",
            "width",
            "cloth radical (no. 50)",
          ],
          mnemonic: null,
          variants: [],
        }),
      ).flat(),
    ).toEqual([
      SearchPropertySpecs.create("KEY", "巾", 0),
      SearchPropertySpecs.create(
        "KUNYOMI_KANA_WITH_OKURIGANA",
        "おおい",
        0,
        "い",
      ),
      SearchPropertySpecs.create("KUNYOMI_KANA_MINUS_OKURIGANA", "おお", 0),
      SearchPropertySpecs.create("KUNYOMI_LATIN_WITH_OKURIGANA", "ōi", 0, "i"),
      SearchPropertySpecs.create("KUNYOMI_LATIN_MINUS_OKURIGANA", "ō", 0),
      SearchPropertySpecs.create("KUNYOMI_KANA", "ちきり", 1),
      SearchPropertySpecs.create("KUNYOMI_KANA", "きれ", 2),
      SearchPropertySpecs.create("KUNYOMI_LATIN", "chikiri", 1),
      SearchPropertySpecs.create("KUNYOMI_LATIN", "kire", 2),
      SearchPropertySpecs.create("ONYOMI_KANA", "きん", 0),
      SearchPropertySpecs.create("ONYOMI_KANA", "ふく", 1),
      SearchPropertySpecs.create("ONYOMI_LATIN", "kin", 0),
      SearchPropertySpecs.create("ONYOMI_LATIN", "fuku", 1),
      SearchPropertySpecs.create("TRANSLATION_ENGLISH", "towel", 0),
      SearchPropertySpecs.create("TRANSLATION_ENGLISH", "hanging scroll", 1),
      SearchPropertySpecs.create("TRANSLATION_ENGLISH", "width", 2),
      SearchPropertySpecs.create(
        "TRANSLATION_ENGLISH",
        "cloth radical (no. 50)",
        3,
      ),
    ]);
  });
});
