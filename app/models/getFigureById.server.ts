import { KanjisenseFigureRelation, PrismaClient } from "@prisma/client";

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
