export async function inBatchesOf<T, U>(
  count: number,
  collection: (Iterable<T> & { size: number }) | T[],
  action: (batch: T[]) => Promise<U>,
) {
  const collectionSize =
    "length" in collection ? collection.length : collection.size;
  const totalStartTime = Date.now() / 1000;
  const totalBatches = Math.ceil(collectionSize / count);

  let itemIndex = 0;
  let batchIndex = 0;
  let batch: T[] = [];
  for (const item of collection) {
    batch.push(item);
    itemIndex++;

    if (batch.length === count || itemIndex === collectionSize) {
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
