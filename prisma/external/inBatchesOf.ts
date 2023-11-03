export async function inBatchesOf<T, U>(
  count: number,
  array: T[],
  action: (batch: T[]) => Promise<U>,
) {
  const totalStartTime = Date.now() / 1000;
  for (let i = 0; i < array.length; i += count) {
    const batchStartTime = Date.now() / 1000;
    const batch = array.slice(i, i + count);
    await action(batch);
    console.log(
      `batch ${i / count} of ${array.length / count} done in ${
        Date.now() / 1000 - batchStartTime
      }s`,
    );
  }
  console.log(`all batches done in ${Date.now() / 1000 - totalStartTime}s`);
}
