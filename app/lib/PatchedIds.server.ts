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
      type: "ALL_FIGURES_EXCEPT";
      figuresToExclude: Set<string>;
      pattern: string;
      replacement: string;
    };

export class PatchedIds {
  _transforms: IdsTransform[] = [];
  _additions: Set<FigureKey> = new Set<FigureKey>();
  _forcedAtomic = new Set<FigureKey>(); // allow analyzing form of atomic kanjijump components for comparison with similar components, though we don't analyze components' meanings

  _lookupCache = new Map<FigureKey, string>();

  constructor(
    private getOriginalIds: (key: FigureKey) => Promise<string | null>,
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

    for (const transform of this._transforms) {
      try {
        transformed = await applyTransform(transform, transformed, key);
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

  extractFigure(ids: string, extractedFigureId: string) {
    return this.addIdsAfterTransforms(extractedFigureId, ids).replaceEverywhere(
      ids,
      encodeFigure(extractedFigureId),
    );
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

  replaceComponentOfAllFiguresExcept(
    figuresToExclude: Iterable<string>,
    componentIds: string,
    replacement: string,
  ) {
    return this.transform({
      type: "ALL_FIGURES_EXCEPT",
      figuresToExclude: new Set(figuresToExclude),
      pattern: componentIds,
      replacement,
    });
  }

  extractFigureFromIdsSegment({
    componentIdsSegment,
    replacementIdsSegment,
    extractedFigureId,
    newCompleteIds,
  }: {
    componentIdsSegment: string | RegExp;
    replacementIdsSegment: string;
    extractedFigureId: string;
    newCompleteIds?: string;
  }) {
    if (newCompleteIds)
      this.addIdsAfterTransforms(extractedFigureId, newCompleteIds);

    this.replaceEverywhere(
      componentIdsSegment as string,
      replacementIdsSegment,
    );

    return this;
  }

  forceAtomic(figures: Iterable<string>) {
    for (const figure of figures) {
      this.addAtomicIdsLine(figure);
    }

    return this;
  }
}

async function applyTransform(
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
    case "ALL_FIGURES_EXCEPT":
      if (!transform.figuresToExclude.has(key))
        return transformed.replaceAll(transform.pattern, transform.replacement);
      return transformed;
  }
}

function encodeFigure(key: string) {
  return key.match(/^[A-Z]+-/) ? `&${key};` : key;
}
