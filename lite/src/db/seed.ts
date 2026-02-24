import type { Db } from "./db";
import { kanjisenseFigure, kanjisenseFigureMeaning } from "./schema";

export async function seed(db: Db) {
	if (await db.select().from(kanjisenseFigure).limit(1).execute()) {
		return "Seed data already exists. No new data inserted.";
	}

	await db.insert(kanjisenseFigure).values({
		key: "一",
		version: 1,
		keyword: "one",
		isPriority: true,
		isStandaloneCharacter: false,
		isPriorityComponent: false,
		isPrioritySoundMark: false,
		listsAsComponent: ["component1", "component2"],
		listsAsCharacter: ["character1", "character2"],
		shinjitaiInBaseKanji: null,
		aozoraAppearances: 0,
		activeSoundMarkValue: null,
		variantGroupId: null,
		componentsTree: null,
		shuowenImageId: null,
		mnemonicKeyword: null,
		activeSoundMarkId: null,
		readingId: null,
	});

	await db.insert(kanjisenseFigureMeaning).values({
		key: "一",
		version: 1,
		unihanDefinition: "one; a, an; alone",
		kanjidicEnglish: ["one", "single", "alone"],
	});

	return "Seed data inserted successfully.";
}
