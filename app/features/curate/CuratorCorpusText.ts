export type BaseCorpus = Record<TextId, CuratorCorpusText>;
export type TextId = string;

export class CuratorCorpusText {
  title: string | null;
  author: string | null;
  source: string;
  section?: string;
  dynasty?: string;
  urls?: string[] | null;
  text: string;
  uniqueChars: string;
  normalizedText: string;

  constructor(
    jsonProps: {
      title: string | null;
      author: string | null;
      source: string;
      section?: string;
      dynasty?: string;
      urls: string[];
      text: string;
      uniqueChars: string;
    },
    normalizedText: string,
  ) {
    this.title = jsonProps.title;
    this.author = jsonProps.author;
    this.source = jsonProps.source;
    this.section = jsonProps.section;
    this.dynasty = jsonProps.dynasty;
    this.urls = jsonProps.urls;
    this.text = jsonProps.text;
    this.uniqueChars = jsonProps.uniqueChars;
    this.normalizedText = normalizedText;
  }

  toJSON() {
    return {
      title: this.title,
      author: this.author,
      source: this.source,
      section: this.section,
      dynasty: this.dynasty,
      urls: this.urls,
      text: this.text,
      uniqueChars: this.uniqueChars,
      normalizedText: this.normalizedText,
    };
  }
}
