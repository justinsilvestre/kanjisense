import { couldBeRomaji, toModifiedHepburn } from "./romajiHelpers";
describe("couldBeRomaji", () => {
  it("should return true for a string that could be romaji", () => {
    const potentiallyRomajiStrings = `a
ka
kanban
shimbun
sinbun
niti
kohsei
ōyama
jyagaimo
zyagaimo
iwan'ya`.split("\n");
    expect(
      potentiallyRomajiStrings
        .map((str) => (couldBeRomaji(str) ? null : str))
        .filter(Boolean),
    ).toEqual([]);
  });
  it("should return false for a string that could not be romaji", () => {
    const notRomajiStrings = `あ
street
かんばん
ay
q
`.split("\n");
    expect(
      notRomajiStrings
        .map((str) => (couldBeRomaji(str) ? str : null))
        .filter(Boolean),
    ).toEqual([]);
  });
});

describe("toModifiedHepburn", () => {
  it("should return a string in modified hepburn", () => {
    const romaji = `a
ka
kanban
shimbun
sinbun
niti
kohsei
ōyama
jyagaimo
zyagaimo
ii
omou
souzou
huro
huku
an'ya
anya
iwanya`.split("\n");

    expect(romaji.map(toModifiedHepburn)).toEqual([
      ["a"],
      ["ka"],
      ["kanban"],
      ["shinbun"],
      ["shinbun"],
      ["nichi"],
      ["kōsei"],
      ["ōyama"],
      ["jagaimo"],
      ["jagaimo"],
      ["ī", "ii"],
      ["omō", "omou"],
      ["sōzō", "sōzou"],
      ["furo"],
      ["fuku"],
      ["an'ya"],
      ["anya", "an'ya"],
      ["iwanya", "iwan'ya"],
    ]);
  });
});
