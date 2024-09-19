import {
  JmDictEntry,
  KanjiDbVariant,
  KanjiDbVariantType,
  KanjidicEntry,
  KanjisenseFigure,
  KanjisenseFigureReading,
  Prisma,
  PrismaClient,
  SbgyXiaoyun,
  Unihan12,
  Unihan14,
  Unihan15,
} from "@prisma/client";

import { SetupStep } from "./SetupStep";

export interface SeedInterface {
  wasSeedStepAlreadyCompleted: (
    version: number | "KEYLESS STEP",
    step: SetupStep,
  ) => Promise<boolean>;
  registerSeeded: (
    version: number | "KEYLESS STEP",
    step: SetupStep,
  ) => Promise<void>;
  findManyKanjidicEntryHavingOnReadings: () => Promise<
    Pick<KanjidicEntry, "id" | "onReadings">[]
  >;
  findManyUnihan15: () => Promise<Pick<Unihan15, "id">[]>;
  findManyKanjisenseFigureBeingStandaloneCharacterOrSoundComponent: (
    version: number,
  ) => Promise<Pick<KanjisenseFigure, "key">[]>;
  findManyKanjiDbVariantBeingOldVariantOf: (
    baseCharacters: string[],
  ) => Promise<KanjiDbVariant[]>;
  findManySbgyXiaoyunAll: () => Promise<SbgyXiaoyun[]>;
  findManyUnihan14HavingKZVariantWithin: (
    ids: string[],
  ) => Promise<Pick<Unihan14, "id" | "kZVariant">[]>;
  deleteManyKanjisenseFigureReading: (
    version: number,
  ) => Promise<Prisma.BatchPayload>;
  createManyKanjisenseFigureReading: (
    data: Prisma.KanjisenseFigureReadingCreateManyInput[],
  ) => Promise<Prisma.BatchPayload>;
  findManyKanjisenseFigureReadingSelectIds: (
    version: number,
  ) => Promise<Pick<KanjisenseFigureReading, "id">[]>;
  findManyKanjisenseFigureByIdsSelectIds: (
    version: number,
    ids: string[],
  ) => Promise<Pick<KanjisenseFigure, "id">[]>;
  updateKanjisenseFigureReadingId: (
    id: string,
    newReadingId: string,
  ) => Promise<KanjisenseFigure>;
  checkIfAnyJmdictEntryContains: (string: string) => Promise<number>;
  findManyJmDictEntriesWithHeadContainingStringAndOnReadingMatching: (
    string: string,
    katakanaOnReadings: string[],
    katakanaOnyomiToHiragana: (katakanaOnReading: string) => string,
  ) => Promise<Pick<JmDictEntry, "id" | "head" | "readingText">[]>;
  createManyKanjisenseFigureReadingToSbgyXiaoyun: (
    data: Prisma.KanjisenseFigureReadingToSbgyXiaoyunCreateManyInput[],
  ) => Promise<Prisma.BatchPayload>;
  findManySbgyXiaoyun: (xiaoyunNumbers: number[]) => Promise<SbgyXiaoyun[]>;
  findManySbgyXiaoyunByExemplar: (exemplar: string) => Promise<SbgyXiaoyun[]>;
  findManyKanjiDbVariantWithBaseIn: (
    baseCharacters: string[],
  ) => Promise<KanjiDbVariant[]>;
  findFirstUnihan14WithIdIn: (ids: string[]) => Promise<Unihan14 | null>;
  findFirstUnihan12WithIdIn: (ids: string[]) => Promise<Unihan12 | null>;
}

export function getSeedInterface(prisma: PrismaClient): SeedInterface {
  return {
    wasSeedStepAlreadyCompleted: async (version, step) => {
      const stepWasAlreadyCompleted =
        version === "KEYLESS STEP"
          ? await prisma.setup.findFirst({
              where: { step },
            })
          : await prisma.setup.findUnique({
              where: { step_version: { step, version } },
            });
      return Boolean(stepWasAlreadyCompleted);
    },
    registerSeeded: async (version, step) => {
      if (version === "KEYLESS STEP") {
        if (
          !(await prisma.setup.findFirst({
            where: { step },
          }))
        )
          await prisma.setup.create({ data: { step, version: 0 } });
        return;
      }
      if (
        !(await prisma.setup.findUnique({
          where: { step_version: { step, version } },
        }))
      )
        await prisma.setup.create({ data: { step, version } });
    },
    findManyKanjidicEntryHavingOnReadings: () =>
      prisma.kanjidicEntry.findMany({
        select: { id: true, onReadings: true },
      }),
    findManyUnihan15: () =>
      prisma.unihan15.findMany({
        select: { id: true },
      }),
    findManyKanjisenseFigureBeingStandaloneCharacterOrSoundComponent: (
      version,
    ) =>
      prisma.kanjisenseFigure.findMany({
        select: { key: true },
        where: {
          version,
          OR: [
            {
              isStandaloneCharacter: true,
            },
            {
              asComponent: {
                soundMarkUses: {
                  some: {},
                },
              },
            },
          ],
        },
      }),
    findManyKanjiDbVariantBeingOldVariantOf: (characters) =>
      prisma.kanjiDbVariant.findMany({
        where: {
          variantType: KanjiDbVariantType.OldStyle,
          base: { in: characters },
        },
      }),
    findManySbgyXiaoyunAll: () => prisma.sbgyXiaoyun.findMany(),
    findManyUnihan14HavingKZVariantWithin: (ids) =>
      prisma.unihan14.findMany({
        where: {
          kZVariant: { isEmpty: false },
          id: { in: ids },
        },
        select: { kZVariant: true, id: true },
      }),
    deleteManyKanjisenseFigureReading: (version) =>
      prisma.kanjisenseFigureReading.deleteMany({
        where: { version },
      }),
    createManyKanjisenseFigureReading: (data) =>
      prisma.kanjisenseFigureReading.createMany({
        data,
      }),
    findManyKanjisenseFigureReadingSelectIds: (version) =>
      prisma.kanjisenseFigureReading.findMany({
        select: { id: true },
        where: { version },
      }),
    findManyKanjisenseFigureByIdsSelectIds: (version, ids) =>
      prisma.kanjisenseFigure.findMany({
        select: { id: true },
        where: {
          version,
          id: {
            in: ids,
          },
        },
      }),
    updateKanjisenseFigureReadingId: (id, readingId) =>
      prisma.kanjisenseFigure.update({
        where: { id },
        data: { readingId },
      }),
    checkIfAnyJmdictEntryContains: (string) =>
      prisma.jmDictEntry.count({
        where: { head: { contains: string } },
        take: 1,
      }),
    findManyJmDictEntriesWithHeadContainingStringAndOnReadingMatching: (
      string,
      katakanaOnReadings,
      katakanaOnyomiToHiragana,
    ) =>
      prisma.jmDictEntry.findMany({
        where: {
          head: { contains: string },
          OR: katakanaOnReadings.map((katakanaReading) => ({
            readingText: {
              contains: katakanaOnyomiToHiragana(katakanaReading),
            },
          })),
        },
      }),
    createManyKanjisenseFigureReadingToSbgyXiaoyun: (data) =>
      prisma.kanjisenseFigureReadingToSbgyXiaoyun.createMany({
        data,
      }),
    findManySbgyXiaoyun: (xiaoyunNumbers) =>
      prisma.sbgyXiaoyun.findMany({
        where: { xiaoyun: { in: xiaoyunNumbers } },
      }),
    findManySbgyXiaoyunByExemplar: (exemplar) =>
      prisma.sbgyXiaoyun.findMany({
        where: { exemplars: { has: exemplar } },
      }),
    findManyKanjiDbVariantWithBaseIn: (baseCharacters) =>
      prisma.kanjiDbVariant.findMany({
        where: { base: { in: baseCharacters } },
      }),
    findFirstUnihan14WithIdIn: (ids) =>
      prisma.unihan14.findFirst({
        where: { id: { in: ids } },
      }),
    findFirstUnihan12WithIdIn: (ids) =>
      prisma.unihan12.findFirst({
        where: { id: { in: ids } },
      }),
  };
}
