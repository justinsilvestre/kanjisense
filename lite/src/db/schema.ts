import { relations } from "drizzle-orm";
import {
	foreignKey,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const kanjisenseFigure = sqliteTable(
	"kanjisense_figure",
	{
		key: text().notNull(),
		version: integer().notNull(),
		keyword: text().notNull(),
		isPriority: integer({ mode: "boolean" }).notNull(),
		isStandaloneCharacter: integer({
			mode: "boolean",
		})
			.notNull()
			.default(false),
		isPriorityComponent: integer({ mode: "boolean" }).notNull().default(false),
		isPrioritySoundMark: integer({ mode: "boolean" }).notNull().default(false),
		listsAsComponent: text({ mode: "json" }).$type<string[]>(),
		listsAsCharacter: text({ mode: "json" }).$type<string[]>(),
		shinjitaiInBaseKanji: text(),
		aozoraAppearances: integer().notNull(),
		activeSoundMarkValue: text(),
		variantGroupId: text(),
		componentsTree: text({ mode: "json" }),
		shuowenImageId: text(),
		mnemonicKeyword: text(),
		activeSoundMarkId: text(),
		readingId: text(),
	},
	(table) => [
		primaryKey({ columns: [table.key, table.version] }),
		uniqueIndex("kanjisense_figure_reading_id_unique").on(table.readingId),
	],
);

export const kanjisenseFigureMeaning = sqliteTable(
	"kanjisense_figure_meaning",
	{
		key: text().notNull(),
		version: integer().notNull(),
		unihanDefinition: text(),
		kanjidicEnglish: text({ mode: "json" }).$type<string[]>().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.key, table.version] }),
		foreignKey({
			columns: [table.key, table.version],
			foreignColumns: [kanjisenseFigure.key, kanjisenseFigure.version],
			name: "kanjisense_figure_meaning_figure_fkey",
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const kanjisenseFigureRelations = relations(
	kanjisenseFigure,
	({ one }) => ({
		meaning: one(kanjisenseFigureMeaning, {
			fields: [kanjisenseFigure.key, kanjisenseFigure.version],
			references: [
				kanjisenseFigureMeaning.key,
				kanjisenseFigureMeaning.version,
			],
		}),
	}),
);

export const kanjisenseFigureMeaningRelations = relations(
	kanjisenseFigureMeaning,
	({ one }) => ({
		figure: one(kanjisenseFigure, {
			fields: [kanjisenseFigureMeaning.key, kanjisenseFigureMeaning.version],
			references: [kanjisenseFigure.key, kanjisenseFigure.version],
		}),
	}),
);
