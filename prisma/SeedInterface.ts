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

  kanjidicEntry: {
    findManyHavingOnReadings: () => Promise<
      Pick<KanjidicEntry, "id" | "onReadings">[]
    >;
  };
  unihan15: {
    findMany: () => Promise<Pick<Unihan15, "id">[]>;
  };
  kanjisenseFigure: {
    findManyBeingStandaloneCharacterOrSoundComponent: (
      version: number,
    ) => Promise<Pick<KanjisenseFigure, "key">[]>;
    findManyByIdsSelectIds: (
      version: number,
      ids: string[],
    ) => Promise<Pick<KanjisenseFigure, "id">[]>;
  };
  kanjiDbVariant: {
    findManyBeingOldVariantOf: (
      baseCharacters: string[],
    ) => Promise<KanjiDbVariant[]>;
    findManyWithBaseIn: (baseCharacters: string[]) => Promise<KanjiDbVariant[]>;
  };
  sbgyXiaoyun: {
    findManyAll: () => Promise<SbgyXiaoyun[]>;
    findManyByExemplar: (exemplar: string) => Promise<SbgyXiaoyun[]>;
    findManyByXiaoyunNumbers: (
      xiaoyunNumbers: number[],
    ) => Promise<SbgyXiaoyun[]>;
  };
  unihan14: {
    findManyHavingKZVariantWithin: (
      ids: string[],
    ) => Promise<Pick<Unihan14, "id" | "kZVariant">[]>;
    findFirstWithIdIn: (ids: string[]) => Promise<Unihan14 | null>;
  };
  unihan12: {
    findFirstWithIdIn: (ids: string[]) => Promise<Unihan12 | null>;
  };
  kanjisenseFigureReading: {
    deleteMany: (version: number) => Promise<Prisma.BatchPayload>;
    createMany: (
      data: {
        id: string;
        key: string;
        version: number;
        sbgyXiaoyunsMatchingExemplars?:
          | Prisma.NullableJsonNullValueInput
          | Prisma.InputJsonValue;
        inferredOnReadingCandidates:
          | Prisma.JsonNullValueInput
          | Prisma.InputJsonValue;
        kanjidicEntryId?: string | null;
        unihan15Id?: string | null;
        selectedOnReadings?:
          | Prisma.KanjisenseFigureReadingCreateselectedOnReadingsInput
          | string[];
      }[],
    ) => Promise<Prisma.BatchPayload>;
    findManySelectIds: (
      version: number,
    ) => Promise<Pick<KanjisenseFigureReading, "id">[]>;
    updateKanjisenseFigureReadingId: (
      id: string,
      newReadingId: string,
    ) => Promise<KanjisenseFigure>;
  };
  kanjisenseFigureReadingToSbgyXiaoyun: {
    createMany: (
      data: {
        figureReadingId: string;
        sbgyXiaoyunId: number;
      }[],
    ) => Promise<Prisma.BatchPayload>;
  };
  jmDictEntry: {
    findManyWithHeadContainingStringAndOnReadingMatching: (
      string: string,
      katakanaOnReadings: string[],
      katakanaOnyomiToHiragana: (katakanaOnReading: string) => string,
    ) => Promise<Pick<JmDictEntry, "id" | "head" | "readingText">[]>;
  };
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

    kanjidicEntry: {
      findManyHavingOnReadings: () =>
        prisma.kanjidicEntry.findMany({
          select: { id: true, onReadings: true },
        }),
    },

    unihan12: {
      findFirstWithIdIn: (ids) =>
        prisma.unihan12.findFirst({
          where: { id: { in: ids } },
        }),
    },
    unihan14: {
      findManyHavingKZVariantWithin: (ids) =>
        prisma.unihan14.findMany({
          where: {
            kZVariant: { isEmpty: false },
            id: { in: ids },
          },
          select: { kZVariant: true, id: true },
        }),
      findFirstWithIdIn: (ids) =>
        prisma.unihan14.findFirst({
          where: { id: { in: ids } },
        }),
    },
    unihan15: {
      findMany: () =>
        prisma.unihan15.findMany({
          select: { id: true },
        }),
    },
    kanjisenseFigureReading: {
      deleteMany: (version) =>
        prisma.kanjisenseFigureReading.deleteMany({
          where: { version },
        }),
      createMany: (data) =>
        prisma.kanjisenseFigureReading.createMany({
          data,
        }),
      findManySelectIds: (version) =>
        prisma.kanjisenseFigureReading.findMany({
          select: { id: true },
          where: { version },
        }),
      updateKanjisenseFigureReadingId: (id, newReadingId) =>
        prisma.kanjisenseFigure.update({
          where: { id },
          data: { readingId: newReadingId },
        }),
    },
    kanjisenseFigure: {
      findManyBeingStandaloneCharacterOrSoundComponent: (version) =>
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
      findManyByIdsSelectIds: (version, ids) =>
        prisma.kanjisenseFigure.findMany({
          select: { id: true },
          where: {
            version,
            id: {
              in: ids,
            },
          },
        }),
    },
    kanjiDbVariant: {
      findManyBeingOldVariantOf: (baseCharacters) =>
        prisma.kanjiDbVariant.findMany({
          where: {
            variantType: KanjiDbVariantType.OldStyle,
            base: { in: baseCharacters },
          },
        }),
      findManyWithBaseIn: (baseCharacters) =>
        prisma.kanjiDbVariant.findMany({
          where: { base: { in: baseCharacters } },
        }),
    },

    sbgyXiaoyun: {
      findManyAll: () => prisma.sbgyXiaoyun.findMany(),
      findManyByExemplar: (exemplar) =>
        prisma.sbgyXiaoyun.findMany({
          where: { exemplars: { has: exemplar } },
        }),
      findManyByXiaoyunNumbers: (xiaoyunNumbers) =>
        prisma.sbgyXiaoyun.findMany({
          where: { xiaoyun: { in: xiaoyunNumbers } },
        }),
    },
    jmDictEntry: {
      findManyWithHeadContainingStringAndOnReadingMatching: (
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
    },
    kanjisenseFigureReadingToSbgyXiaoyun: {
      createMany: (data) =>
        prisma.kanjisenseFigureReadingToSbgyXiaoyun.createMany({
          data,
        }),
    },
  };
}
