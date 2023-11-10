import {
  InferredOnyomiType,
  Kaihe,
  QysSyllableProfile,
  Tone,
  inferOnyomi,
  toModernKatakana,
} from "./inferOnyomi";

describe("getAttestedOnFinals", () => {
  it("infers onyomi from 生 in default format", () => {
    const syllable: QysSyllableProfile = {
      // 884,生,所,庚,生開三庚平,生魚上,見開二庚平
      initial: "生",
      cycleHead: "庚",
      dengOrChongniu: "三",
      tone: Tone.平,
      kaihe: Kaihe.Open,
    };
    const inferredOnReadings = inferOnyomi(syllable);
    expect(Object.fromEntries(inferredOnReadings)).toEqual({
      [InferredOnyomiType.AttestedKan]: ["sei"],
      [InferredOnyomiType.AttestedGo]: ["siYau"],
    });
  });

  it("infers onyomi from 生 in modern format", () => {
    const syllable: QysSyllableProfile = {
      // 884,生,所,庚,生開三庚平,生魚上,見開二庚平
      initial: "生",
      cycleHead: "庚",
      dengOrChongniu: "三",
      tone: Tone.平,
      kaihe: Kaihe.Open,
    };
    const inferredOnReadings = inferOnyomi(syllable, toModernKatakana);
    expect(Object.fromEntries(inferredOnReadings)).toEqual({
      [InferredOnyomiType.AttestedKan]: ["セイ"],
      [InferredOnyomiType.AttestedGo]: ["ショウ"],
    });
  });
});
