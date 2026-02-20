import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

import { getFigureId } from "./figure";

export async function getFigureById(
  prisma: PrismaClient,
  id: string,
): Promise<KanjisenseFigureRelation> {
  const figure = await prisma.kanjisenseFigureRelation.findUnique({
    where: { id },
  });
  if (!figure) throw new Error(`figure ${id} not found`);
  return figure;
}

export async function getFigureByKey(
  prisma: PrismaClient,
  version: number,
  key: string,
): Promise<KanjisenseFigureRelation> {
  return getFigureById(prisma, getFigureId(version, key));
}
