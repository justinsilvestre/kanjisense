import { describe, it, expect } from "vitest";

import { getOldStyleDbVariants } from "./getOldStyleDbVariants";

describe("getOldStyleDbVariants", () => {
  let dbInput: Awaited<ReturnType<typeof getOldStyleDbVariants>>;

  beforeAll(async () => {
    dbInput = await getOldStyleDbVariants();
  });

  it("should register valid variants", () => {
    expect(dbInput.values()).toContainEqual({
      // 隠󠄀	隱󠄀
      base: "隠",
      variant: "隱",
      variantType: "OldStyle",
    });
  });

  it("should not register invalid variants with `簾󠄀	廉󠄀`", () => {
    expect(dbInput.values()).not.toContainEqual({
      base: "簾",
      variant: "廉",
      variantType: "OldStyle",
    });
  });

  // 棚󠄀	栅󠄀
  it("should not register invalid variants with `棚󠄀	栅󠄀`", () => {
    expect(dbInput.values()).not.toContainEqual({
      base: "棚",
      variant: "栅",
      variantType: "OldStyle",
    });
  });

  // 欲󠄀	慾󠄀
  it("should not register invalid variants with `欲󠄀	慾󠄀`", () =>
    expect(dbInput.values()).not.toContainEqual({
      base: "欲",
      variant: "慾",
      variantType: "OldStyle",
    }));
});
