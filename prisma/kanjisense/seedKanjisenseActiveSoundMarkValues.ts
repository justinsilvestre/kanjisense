import { PrismaClient } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { toKatakana } from "wanakana";

import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

import { getActiveSoundMarkValueText } from "../../app/features/dictionary/getActiveSoundMarkValueText";
import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { OnReadingToTypeToXiaoyuns } from "./seedKanjisenseFigureReadings";

export async function seedKanjisenseActiveSoundMarkValues(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseActiveSoundMarkValue" },
  });
  if (seeded && !force)
    console.log(`KanjisenseActiveSoundMarkValue already seeded. 🌱`);
  else {
    console.log(`seeding KanjisenseActiveSoundMarkValue...`);

    await executeAndLogTime("registering active sound marks values", () =>
      registerActiveSoundMarkValues(prisma),
    );

    await registerSeeded(prisma, "KanjisenseActiveSoundMarkValue");
  }

  console.log(`KanjisenseActiveSoundMarkValue seeded. 🌱`);
}

async function registerActiveSoundMarkValues(prisma: PrismaClient) {
  const allActiveSoundMarks = await prisma.kanjisenseFigure.findMany({
    where: {
      asComponent: {
        soundMarkUses: {
          some: { id: { notIn: [] } },
        },
      },
    },
    include: {
      reading: {
        include: {
          kanjidicEntry: {
            select: {
              onReadings: true,
            },
          },
          unihan15: {
            select: {
              kJapaneseOn: true,
            },
          },
        },
      },
      asComponent: {
        include: {
          soundMarkUses: {
            include: {
              reading: {
                include: {
                  kanjidicEntry: {
                    select: {
                      onReadings: true,
                    },
                  },
                  unihan15: {
                    select: {
                      kJapaneseOn: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  for (const soundMarkFigure of allActiveSoundMarks) {
    if (!soundMarkFigure.reading) {
      console.log("no reading for", soundMarkFigure.id);
    } else {
      // sort sound mark's kanjidic readings by compatibility with inferred onyomi
      // assign activeSoundMarkValue on soundMarkUseFigure based on that.

      const inferredOnReadingCandidates = soundMarkFigure.reading
        .inferredOnReadingCandidates as OnReadingToTypeToXiaoyuns;

      const katakanaOnReadings = soundMarkFigure.reading?.kanjidicEntry
        ?.onReadings?.length
        ? soundMarkFigure.reading?.kanjidicEntry?.onReadings
        : soundMarkFigure.reading?.unihan15?.kJapaneseOn?.map(
            (s) => toKatakana(s) as string,
          ) ?? [];

      const katakanaOnReadingsWithMatchingXiaoyuns = katakanaOnReadings
        .filter(Boolean)
        .map((katakana) => ({
          katakana,
          priority: getKanOnPriority(inferredOnReadingCandidates[katakana]),
        }));
      katakanaOnReadingsWithMatchingXiaoyuns.sort((a, b) => {
        return (a.priority?.priority ?? 9999) - (b.priority?.priority ?? 9999);
      });
      const activeSoundMarkValue =
        katakanaOnReadingsWithMatchingXiaoyuns?.[0] ||
        Object.keys(inferredOnReadingCandidates)
          .filter(Boolean)
          .map((katakana) => ({
            katakana,
            priority: getKanOnPriority(inferredOnReadingCandidates[katakana]),
          }))
          .sort((a, b) => {
            return (
              (a.priority?.priority ?? 9999) - (b.priority?.priority ?? 9999)
            );
          })?.[0]?.katakana ||
        null;

      const activeSoundMarkValueText =
        getActiveSoundMarkValueText(activeSoundMarkValue);

      for (const soundMarkUseFigure of soundMarkFigure.asComponent!
        .soundMarkUses) {
        await prisma.kanjisenseFigure.update({
          where: { id: soundMarkUseFigure.id },
          data: {
            activeSoundMarkValue: activeSoundMarkValueText,
          },
        });
      }
    }
  }
}

function getKanOnPriority(
  inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns[string] | null,
): {
  priority: number;
  xiaoyunsByMatchingType: Partial<Record<InferredOnyomiType, number[]>>;
} | null {
  if (!inferredOnReadingCandidates) return null;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    !inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return {
      priority: 1,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKan]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKan],
      },
    };
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    !inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return {
      priority: 2,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKanRare]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare],
      },
    };
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return {
      priority: 3,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKan]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKan],
        [InferredOnyomiType.AttestedGo]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedGo],
      },
    };
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare]
  )
    return {
      priority: 4,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKan]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKan],
        [InferredOnyomiType.AttestedGoRare]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare],
      },
    };
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare]
  )
    return {
      priority: 5,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKanRare]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare],
        [InferredOnyomiType.AttestedGoRare]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare],
      },
    };
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return {
      priority: 6,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.AttestedKanRare]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare],
        [InferredOnyomiType.AttestedGo]:
          inferredOnReadingCandidates[InferredOnyomiType.AttestedGo],
      },
    };
  if (inferredOnReadingCandidates[InferredOnyomiType.SpeculatedKan])
    return {
      priority: 7,
      xiaoyunsByMatchingType: {
        [InferredOnyomiType.SpeculatedKan]:
          inferredOnReadingCandidates[InferredOnyomiType.SpeculatedKan],
      },
    };
  return null;
}
