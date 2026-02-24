CREATE TABLE `kanjisense_figure` (
	`key` text NOT NULL,
	`version` integer NOT NULL,
	`keyword` text NOT NULL,
	`is_priority` integer NOT NULL,
	`is_standalone_character` integer DEFAULT false NOT NULL,
	`is_priority_component` integer DEFAULT false NOT NULL,
	`is_priority_sound_mark` integer DEFAULT false NOT NULL,
	`lists_as_component` text,
	`lists_as_character` text,
	`shinjitai_in_base_kanji` text,
	`aozora_appearances` integer NOT NULL,
	`active_sound_mark_value` text,
	`variant_group_id` text,
	`components_tree` text,
	`shuowen_image_id` text,
	`mnemonic_keyword` text,
	`active_sound_mark_id` text,
	`reading_id` text,
	PRIMARY KEY(`key`, `version`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kanjisense_figure_reading_id_unique` ON `kanjisense_figure` (`reading_id`);--> statement-breakpoint
CREATE TABLE `kanjisense_figure_meaning` (
	`key` text NOT NULL,
	`version` integer NOT NULL,
	`unihan_definition` text,
	`kanjidic_english` text NOT NULL,
	PRIMARY KEY(`key`, `version`),
	FOREIGN KEY (`key`,`version`) REFERENCES `kanjisense_figure`(`key`,`version`) ON UPDATE cascade ON DELETE cascade
);
