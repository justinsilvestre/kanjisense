import { isComponentFirstClass } from "prisma/kanjisense/isComponentFirstClass";
import { getFiguresToVariantGroups } from "prisma/kanjisense/seedKanjisenseFigures";
import { prisma } from "~/db.server";

import { ComponentUse } from "./features/dictionary/ComponentUse";
import { FIGURES_VERSION } from "./models/figure";

describe("isComponentFirstClass", () => {
  const figuresToComponentTrees = new Map<string, ComponentUse[]>(
    (
      [
        [
          "歸",
          [
            ["歸", "CDP-8CAB"],
            ["CDP-8CAB", "𠂤"],
            ["𠂤", "丿"],
            ["𠂤", "㠯"],
            ["CDP-8CAB", "止"],
            ["歸", "帚"],
            ["帚", "⺕"],
            ["帚", "冖"],
            ["帚", "巾"],
          ],
        ],
        [
          "𠚍",
          [
            ["𠚍", "𠂭"],
            ["𠚍", "凵"],
          ],
        ],
        ["旡", []],
        [
          "CDP-8CAB",
          [
            ["CDP-8CAB", "𠂤"],
            ["𠂤", "丿"],
            ["𠂤", "㠯"],
            ["CDP-8CAB", "止"],
          ],
        ],
        [
          "卂",
          [
            ["卂", "乙"],
            ["卂", "十"],
          ],
        ],
      ] as [string, [string, string][]][]
    ).map(([id, ct]) => [id, ct.map((c) => new ComponentUse(c[0], c[1]))]),
  );

  it("works with CDP-8CAB (left of 歸)", async () => {
    const priorityFiguresKeys = await prisma.kanjisenseFigure
      .findMany({
        where: {
          version: FIGURES_VERSION,
          isPriority: true,
        },
      })
      .then((fs) => fs.map((f) => f.key!));
    const parent = "歸";
    const component = "CDP-8CAB";
    const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>([
      ["CDP-8CAB", new Set(["帰"])],
    ]);
    const figuresToVariantGroups = await getFiguresToVariantGroups(
      prisma,
      FIGURES_VERSION,
    );
    const result = isComponentFirstClass(
      new Set(priorityFiguresKeys),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroups,
      figuresToComponentTrees,
    );
    expect(result).toEqual(false);
  });

  it("works with 𠚍", async () => {
    const priorityFiguresKeys = await prisma.kanjisenseFigure
      .findMany({
        where: {
          version: FIGURES_VERSION,
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
    const figuresToVariantGroups = await getFiguresToVariantGroups(
      prisma,
      FIGURES_VERSION,
    );
    const result = isComponentFirstClass(
      new Set(priorityFiguresKeys),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroups,
      figuresToComponentTrees,
    );
    expect(result).toEqual(false);
  });

  it("works with 旡", async () => {
    const priorityFiguresKeys = await prisma.kanjisenseFigure
      .findMany({
        where: {
          version: FIGURES_VERSION,
          isPriority: true,
        },
      })
      .then((fs) => fs.map((f) => f.id));
    const parent = "既";
    const component = "旡";
    const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>([
      ["旡", new Set(["既", "炁"])],
      ["兂", new Set(["兓"])],
    ]);
    const figuresToVariantGroups = await getFiguresToVariantGroups(
      prisma,
      FIGURES_VERSION,
    );
    const result = isComponentFirstClass(
      new Set(priorityFiguresKeys),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroups,
      figuresToComponentTrees,
    );
    expect(result).toEqual(true);
  });

  it("works with 卂", async () => {
    const priorityFiguresKeys = await prisma.kanjisenseFigure
      .findMany({
        where: {
          version: FIGURES_VERSION,
          isPriority: true,
        },
      })
      .then((fs) => fs.map((f) => f.id));
    const parent = "迅";
    const component = "卂";
    const componentsToDirectUsesPrimaryVariants = new Map<string, Set<string>>([
      ["卂", new Set(["迅", "㷀", "嬴", "巩", "煢"])],
      ["GWS-U5342-VAR-001", new Set(["訊", "汛", "蝨"])],
    ]);
    const figuresToVariantGroups = await getFiguresToVariantGroups(
      prisma,
      FIGURES_VERSION,
    );
    const result = isComponentFirstClass(
      new Set(priorityFiguresKeys),
      parent,
      component,
      componentsToDirectUsesPrimaryVariants,
      figuresToVariantGroups,
      figuresToComponentTrees,
    );
    expect(result).toEqual(true);
  });
});
