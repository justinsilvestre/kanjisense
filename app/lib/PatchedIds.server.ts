type FigureKey = string;

type IdsTransform =
  | { type: "REPLACE_SINGLE_IDS"; key: string; newIds: string }
  | { type: "EVERYWHERE"; pattern: string | RegExp; replacement: string }
  | {
      type: "SOME_FIGURES";
      figures: Set<string>;
      pattern: string;
      replacement: string;
    }
  | {
      type: "NON_SIMPLIFIED_FIGURES";
      pattern: string | RegExp;
      replacement: string;
    }
  | {
      type: "SIMPLIFIED_FIGURES";
      pattern: string | RegExp;
      replacement: string;
    };

export class PatchedIds {
  _transforms: IdsTransform[] = [];
  _additions: Set<FigureKey> = new Set<FigureKey>();
  _forcedAtomic = new Set<FigureKey>(); // allow analyzing form of atomic kanjijump components for comparison with similar components, though we don't analyze components' meanings

  _lookupCache = new Map<FigureKey, string>();

  constructor(
    // use shorthand for this.getOriginalIds
    private getOriginalIds: (key: FigureKey) => Promise<string | null>,
    private variantsHelpers: {
      figureIsSimplifiedInStandardForm: (key: FigureKey) => Promise<boolean>;
      figureIsNonSimplified: (key: FigureKey) => Promise<boolean>;
    },
  ) {}

  private cache(key: FigureKey, ids: string) {
    this._lookupCache.set(key, ids);
    return ids;
  }

  async getIds(key: FigureKey) {
    const cached = this._lookupCache.get(key);
    if (cached) {
      return cached;
    }

    const originalIds = await this.getOriginalIds(key);

    if (!originalIds) throw new Error(`No ids found in original for ${key}`);
    let transformed = originalIds;

    const figureIsSimplifiedInStandardFormCache = new Map<FigureKey, boolean>();
    const figureIsNonSimplifiedCache = new Map<FigureKey, boolean>();

    const memoizedVariantsHelpers = {
      figureIsSimplifiedInStandardForm: async (key: FigureKey) => {
        if (figureIsSimplifiedInStandardFormCache.has(key))
          return figureIsSimplifiedInStandardFormCache.get(key)!;
        const result =
          await this.variantsHelpers.figureIsSimplifiedInStandardForm(key);
        figureIsSimplifiedInStandardFormCache.set(key, result);
        return result;
      },
      figureIsNonSimplified: async (key: FigureKey) => {
        if (figureIsNonSimplifiedCache.has(key))
          return figureIsNonSimplifiedCache.get(key)!;
        const result = await this.variantsHelpers.figureIsNonSimplified(key);
        figureIsNonSimplifiedCache.set(key, result);
        return result;
      },
    };

    for (const transform of this._transforms) {
      try {
        transformed = await applyTransform(
          memoizedVariantsHelpers,
          transform,
          transformed,
          key,
        );
      } catch (err) {
        console.error(err);
        throw new Error(
          `Problem applying transform ${
            transform.type
          } to ${key} : ${JSON.stringify(transform)}`,
        );
      }
    }

    return this.cache(key, transformed);
  }

  addIdsAfterTransforms(figure: FigureKey, ids: string) {
    if (this._additions.has(figure))
      throw new Error(`IDS for ${figure} was already added.`);
    this._additions.add(figure);
    this._lookupCache.set(figure, ids);

    return this;
  }

  addAtomicIdsLine(figure: FigureKey) {
    return this.addIdsAfterTransforms(figure, encodeFigure(figure));
  }

  transform(transform: IdsTransform) {
    this._transforms.push(transform);
    return this;
  }

  replaceIds(figure: string, ids: string) {
    return this.transform({
      type: "REPLACE_SINGLE_IDS",
      key: figure,
      newIds: ids,
    });
  }

  replaceManyIds(idsSequences: [figure: string, ids: string][]) {
    for (const [figure, ids] of idsSequences) {
      this.replaceIds(figure, ids);
    }
    return this;
  }

  extractFigure(ids: string, extractedFigureKey: string) {
    return this.addIdsAfterTransforms(
      extractedFigureKey,
      ids,
    ).replaceEverywhere(ids, encodeFigure(extractedFigureKey));
  }

  replaceEverywhere(pattern: string | RegExp, replacement: string) {
    return this.transform({
      type: "EVERYWHERE",
      pattern: pattern,
      replacement: replacement,
    });
  }

  replaceComponentOfFigures(
    figures: Iterable<string>,
    componentIds: string,
    replacement: string,
  ) {
    return this.transform({
      type: "SOME_FIGURES",
      figures: new Set(figures),
      pattern: componentIds,
      replacement,
    });
  }

  extractFigureFromIdsSegment({
    componentIdsSegment,
    replacementIdsSegment,
    extractedFigureKey,
    newCompleteIds,
  }: {
    componentIdsSegment: string | RegExp;
    replacementIdsSegment: string;
    extractedFigureKey: string;
    newCompleteIds?: string;
  }) {
    if (newCompleteIds)
      this.addIdsAfterTransforms(extractedFigureKey, newCompleteIds);

    this.replaceEverywhere(
      componentIdsSegment as string,
      replacementIdsSegment,
    );

    return this;
  }

  replaceComponentOfNonSimplifiedCharacters(
    pattern: string,
    replacement: string,
  ) {
    return this.transform({
      type: "NON_SIMPLIFIED_FIGURES",
      pattern,
      replacement,
    });
  }

  replaceComponentOfSimplifiedCharacters(pattern: string, replacement: string) {
    return this.transform({
      type: "SIMPLIFIED_FIGURES",
      pattern,
      replacement,
    });
  }

  forceAtomic(figures: Iterable<string>) {
    for (const figure of figures) {
      this.addAtomicIdsLine(figure);
    }

    return this;
  }
}

async function applyTransform(
  variantsHelpers: {
    figureIsSimplifiedInStandardForm: (key: FigureKey) => Promise<boolean>;
    figureIsNonSimplified: (key: FigureKey) => Promise<boolean>;
  },
  transform: IdsTransform,
  transformed: string,
  key: string,
) {
  switch (transform.type) {
    case "EVERYWHERE":
      return transformed.replaceAll(transform.pattern, transform.replacement);
    case "REPLACE_SINGLE_IDS":
      if (transform.key === key) transformed = transform.newIds;
      return transformed;
    case "SOME_FIGURES":
      if (transform.figures.has(key))
        return transformed.replaceAll(transform.pattern, transform.replacement);
      return transformed;
    case "NON_SIMPLIFIED_FIGURES": {
      if (await variantsHelpers.figureIsNonSimplified(key)) {
        return transformed.replaceAll(transform.pattern, transform.replacement);
      }
      return transformed;
    }
    case "SIMPLIFIED_FIGURES": {
      if (await variantsHelpers.figureIsSimplifiedInStandardForm(key)) {
        return transformed.replaceAll(transform.pattern, transform.replacement);
      }
    }
  }

  return transformed;
}

function encodeFigure(key: string) {
  return key.match(/^[A-Z]+-/) ? `&${key};` : key;
}
