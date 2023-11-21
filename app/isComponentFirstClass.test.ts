import { isComponentFirstClass } from "prisma/kanjisense/isComponentFirstClass";
import { getFiguresToVariantGroupsIds } from "prisma/kanjisense/seedKanjisenseFigures";
import { prisma } from "~/db.server";

describe("isComponentFirstClass", () => {
  it("works with CDP-8CAB (left of 歸)", async () => {
    const priorityFiguresIds = await prisma.kanjisenseFigure
      .findMany({
        where: {
          isPriority: true,
        },
      })
      .then((fs) => fs.map((f) => f.id));
    const parent = "歸";
    const component = "CDP-8CAB";
    const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>([
      ["CDP-8CAB", new Set(["帰"])],
    ]);
    const figuresToVariantGroupIds = await getFiguresToVariantGroupsIds(prisma);
    const result = isComponentFirstClass(
      new Set(priorityFiguresIds),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroupIds,
    );
    expect(result).toEqual(false);
  });

  it("works with 𠚍", async () => {
    const priorityFiguresIds = await prisma.kanjisenseFigure
      .findMany({
        where: {
          isPriority: true,
        },
      })
      .then((fs) => fs.map((f) => f.id));
    const parent = "鬯";
    const component = "𠚍";
    const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>([
      ["𠚍", new Set(["鬯", "𡕰"])],
      ["鬯", new Set(["鬱"])],
    ]);
    const figuresToVariantGroupIds = await getFiguresToVariantGroupsIds(prisma);
    const result = isComponentFirstClass(
      new Set(priorityFiguresIds),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroupIds,
    );
    expect(result).toEqual(false);
  });
});
