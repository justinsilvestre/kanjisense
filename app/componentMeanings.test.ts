import { getFiguresToVariantGroups } from "prisma/kanjisense/seedKanjisenseFigures";
import { prisma } from "~/db.server";

import { shouldComponentBeAssignedMeaning } from "../prisma/kanjisense/componentMeanings";

describe("shouldComponentBeAssignedMeaning", () => {
  it("works with 圼", async () => {
    const { figuresToVariantGroups, priorityCandidatesIds } = await setup();
    const result = await shouldComponentBeAssignedMeaning(
      figuresToVariantGroups,
      new Map([["圼", new Set(["涅", "捏"])]]),
      priorityCandidatesIds,
      "圼",
    );

    expect(result).toEqual({
      result: true,
      reason: "used in 涅 捏",
    });
  });

  it("works with 詹", async () => {
    const { figuresToVariantGroups, priorityCandidatesIds } = await setup();
    const result = await shouldComponentBeAssignedMeaning(
      figuresToVariantGroups,
      new Map([
        [
          "詹",
          new Set([
            "擔",
            "膽",
            "儋",
            "幨",
            "憺",
            "檐",
            "澹",
            "瞻",
            "簷",
            "舚",
            "蟾",
            "襜",
            "譫",
            "贍",
          ]),
        ],
      ]),
      priorityCandidatesIds,
      "詹",
    );

    expect(result).toEqual({
      result: true,
      reason: "used in 擔 膽",
    });
  });

  it("works with 旡", async () => {
    const { figuresToVariantGroups, priorityCandidatesIds } = await setup();
    const result = await shouldComponentBeAssignedMeaning(
      figuresToVariantGroups,
      new Map([
        ["旡", new Set(["既", "炁"])],
        ["兂", new Set(["兓"])],
      ]),
      priorityCandidatesIds,
      "旡",
    );

    expect(result).toEqual({
      result: true,
      reason: "used in 既 兓",
    });
  });
});
async function setup() {
  const figuresToVariantGroups = await getFiguresToVariantGroups(prisma);
  const priorityCandidatesIds = new Set(
    await prisma.kanjisenseFigureRelation
      .findMany({
        where: {
          isPriorityCandidate: true,
        },
      })
      .then((fs) => fs.map((f) => f.id)),
  );
  return { figuresToVariantGroups, priorityCandidatesIds };
}
