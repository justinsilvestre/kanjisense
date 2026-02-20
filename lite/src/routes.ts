export const index = () => "/" as const;

export const about = () => "/about" as const;

export const search = () => "/search" as const;

export const dict = (figureKey: string) => `/dict/${figureKey}` as const;
export const dictAnalyze = (figureKey: string) =>
	`/dict/${figureKey}/analyze` as const;
export const dictPreview = (figureKey: string) =>
	`/dict/${figureKey}/preview` as const;
export const dictUses = (figureKey: string) =>
	`/dict/${figureKey}/uses` as const;

export const browseAtomicComponents = () =>
	"/browse/atomic-components" as const;
export const browseCharacters = () => "/browse/characters" as const;
export const browseCompoundComponents = () =>
	"/browse/compound-components" as const;
export const browseSoundComponents = () => "/browse/sound-components" as const;
