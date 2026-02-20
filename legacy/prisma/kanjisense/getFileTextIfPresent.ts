import { readFile } from "fs/promises";

export async function getFileTextIfPresent(path: string | null) {
  if (!path) return null;
  try {
    return await readFile(path, "utf-8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if ((error as unknown as { code: string }).code === "ENOENT") {
        return null;
      } else {
        throw error;
      }
    }
  }
}
