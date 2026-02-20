export type BatchCollection<T> =
  | (Iterable<T> & {
      size: number;
    })
  | T[];

interface BatchOptions<T, V, U> {
  batchSize: number;
  collection: BatchCollection<T>;
  getBatchItem?: (item: T) => U;
  action: (batch: U[]) => Promise<V>;
}

export async function inBatchesOf<T, V, U = T>({
  batchSize,
  collection,
  getBatchItem = (x: T): U => x as unknown as U,
  action,
}: BatchOptions<T, V, U>) {
  const collectionSize =
    "length" in collection ? collection.length : collection.size;
  const totalStartTime = Date.now() / 1000;
  const totalBatches = Math.ceil(collectionSize / batchSize);

  let itemIndex = 0;
  let batchIndex = 0;
  let batch: U[] = [];
  for (const item of collection) {
    batch.push(getBatchItem(item));
    itemIndex++;

    if (batch.length === batchSize || itemIndex === collectionSize) {
      const batchStartTime = Date.now() / 1000;
      await action(batch);
      console.log(
        `    | batch ${batchIndex + 1} of ${totalBatches} done in ${(
          Date.now() / 1000 -
          batchStartTime
        ).toFixed(2)}s`,
      );
      batch = [];
      batchIndex++;
    }
  }
  console.log(
    `all batches done in ${(Date.now() / 1000 - totalStartTime).toFixed(2)}s`,
  );
}
