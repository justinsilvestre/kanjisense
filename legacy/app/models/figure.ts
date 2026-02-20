export const FIGURES_VERSION = 2;

export type FigureKey = string;

export function getFigureId(version: number, key: FigureKey) {
  if (version === 0) return key;
  return `${version}@${key}`;
}

export function getLatestFigureId(key: FigureKey) {
  return getFigureId(FIGURES_VERSION, key);
}

export function parseFigureId(id: string) {
  if (!id.includes("@")) return { version: 0, key: id };
  const [version, key] = id.split("@");
  return { version: parseInt(version, 10), key };
}
