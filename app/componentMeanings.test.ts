import { prisma } from "~/db.server";

import { shouldComponentBeAssignedMeaning } from "../prisma/kanjisense/componentMeanings";

describe("shouldComponentBeAssignedMeaning", () => {
  it("works with 圼", async () => {
    const result = await shouldComponentBeAssignedMeaning(
      prisma,
      (await prisma.kanjisenseFigureRelation.findUnique({
        where: { id: "圼" },
      }))!,
    );

    expect(result).toEqual({
      result: true,
      reason: "used in 捏 涅",
    });
  });

  it("works with 詹", async () => {
    const result = await shouldComponentBeAssignedMeaning(
      prisma,
      (await prisma.kanjisenseFigureRelation.findUnique({
        where: { id: "詹" },
      }))!,
    );

    expect(result).toEqual({
      result: true,
      reason: "used in 膽 擔",
    });
  });
});
