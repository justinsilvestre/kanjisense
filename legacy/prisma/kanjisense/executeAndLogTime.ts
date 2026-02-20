export async function executeAndLogTime<T>(
  label: string,
  fn: () => Promise<T>,
) {
  const startTime = Date.now();
  console.log(label, "...");
  const result = await fn();
  console.log(
    `${(Date.now() - startTime) / 1000}s.`.padStart(label.length + 8),
  );
  return result;
}
