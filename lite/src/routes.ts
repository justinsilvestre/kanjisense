export const index = () => "/" as const;

export const about = () => "/about" as const;

export const search = () => "/search" as const;

export const dict = <S extends string>(figureKey: S) =>
	`/dict/${figureKey}` as const;
export const dictAnalyze = <S extends string>(figureKey: S) =>
	`/dict/${figureKey}/analyze` as const;
export const dictPreview = <S extends string>(figureKey: S) =>
	`/dict/${figureKey}/preview` as const;
export const dictUses = <S extends string>(figureKey: S) =>
	`/dict/${figureKey}/uses` as const;

export const browseAtomicComponents = () =>
	"/browse/atomic-components" as const;
export const browseCharacters = () => "/browse/characters" as const;
export const browseCompoundComponents = () =>
	"/browse/compound-components" as const;
export const browseSoundComponents = () => "/browse/sound-components" as const;
