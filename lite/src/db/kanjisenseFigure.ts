import { and, eq } from "drizzle-orm";
import type { Db } from "./db";
import { kanjisenseFigure } from "./schema";

export type KanjisenseFigure = typeof kanjisenseFigure.$inferSelect;

export type DictKanjisenseFigure = NonNullable<
	Awaited<ReturnType<typeof getKanjisenseFigureWithMeaningByKey>>
>;

export const LATEST_VERSION = 1;

export const getKanjisenseFigureByKey = async (db: Db, key: string) => {
	const figure = await db
		.select()
		.from(kanjisenseFigure)
		.where(
			and(
				eq(kanjisenseFigure.key, key),
				eq(kanjisenseFigure.version, LATEST_VERSION),
			),
		)
		.limit(1);

	return figure[0] || null;
};

export const getKanjisenseFigureWithMeaningByKey = async (
	db: Db,
	key: string,
) => {
	const figure = await db.query.kanjisenseFigure.findFirst({
		where: (fig) => and(eq(fig.key, key), eq(fig.version, LATEST_VERSION)),
		with: {
			meaning: true,
		},
	});
	return figure || null;
};
