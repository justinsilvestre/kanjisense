import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

export type OnReadingToTypeToXiaoyuns = Record<
  string,
  Partial<Record<InferredOnyomiType, { xiaoyun: number; profile: string }[]>>
>;
