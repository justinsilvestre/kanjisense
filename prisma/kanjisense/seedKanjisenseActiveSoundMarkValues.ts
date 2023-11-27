import { PrismaClient } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { toKatakana } from "wanakana";

import { getActiveSoundMarkValueText } from "~/features/dictionary/getActiveSoundMarkValueText";
import type { OnReadingToTypeToXiaoyuns } from "~/lib/OnReadingToTypeToXiaoyuns";
import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";

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
  const allActiveSoundMarks = await getAllActiveSoundMarks(prisma);

  for (const soundMarkFigure of allActiveSoundMarks) {
    if (!soundMarkFigure.reading) {
      console.log("no reading for", soundMarkFigure.id);
    } else {
      // sort sound mark's kanjidic readings by compatibility with inferred onyomi
      // assign activeSoundMarkValue on soundMarkUseFigure based on that.

      let activeSoundMarkValue = getValueFromSoundMarkReading(soundMarkFigure);

      if (!activeSoundMarkValue?.katakana) {
        for (const variantFigure of soundMarkFigure.variantGroup?.figures ||
          []) {
          if (!activeSoundMarkValue)
            activeSoundMarkValue = getValueFromSoundMarkReading(variantFigure);
        }
      }
      if (!activeSoundMarkValue)
        console.log("no activeSoundMarkValue for", soundMarkFigure.id);
      const activeSoundMarkValueText =
        activeSoundMarkValue &&
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

async function getAllActiveSoundMarks(prisma: PrismaClient) {
  const commonInclude = {
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
  };
  return await prisma.kanjisenseFigure.findMany({
    where: {
      asComponent: {
        soundMarkUses: {
          some: {},
        },
      },
    },
    include: {
      ...commonInclude,
      variantGroup: {
        include: {
          figures: {
            include: commonInclude,
          },
        },
      },
    },
  });
}

type ActiveSoundMarkFigure = Omit<
  Awaited<ReturnType<typeof getAllActiveSoundMarks>>[number],
  "variantGroup"
>;

function getValueFromSoundMarkReading(soundMarkFigure: ActiveSoundMarkFigure) {
  const { reading } = soundMarkFigure;

  if (!reading) return null;

  const inferredOnReadingCandidates =
    reading.inferredOnReadingCandidates as OnReadingToTypeToXiaoyuns;

  const katakanaOnReadings = reading?.kanjidicEntry?.onReadings?.length
    ? reading?.kanjidicEntry?.onReadings
    : reading?.unihan15?.kJapaneseOn?.map((s) => toKatakana(s) as string) ?? [];

  const katakanaOnReadingsWithMatchingXiaoyuns = katakanaOnReadings
    .filter(Boolean)
    .map((katakana) => ({
      katakana,
      priority: getKanOnPriority(inferredOnReadingCandidates[katakana]),
    }))
    .sort((a, b) => {
      return (a.priority?.priority ?? 9999) - (b.priority?.priority ?? 9999);
    });
  const matchingSoundMarkValue =
    katakanaOnReadingsWithMatchingXiaoyuns?.[0] ||
    Object.keys(inferredOnReadingCandidates)
      .filter(Boolean)
      .map((katakana) => ({
        katakana,
        priority: getKanOnPriority(inferredOnReadingCandidates[katakana]),
      }))
      .sort((a, b) => {
        return (a.priority?.priority ?? 9999) - (b.priority?.priority ?? 9999);
      })?.[0]?.katakana ||
    null;
  if (matchingSoundMarkValue?.katakana) return matchingSoundMarkValue;

  return katakanaOnReadings.filter(Boolean).length
    ? {
        katakana: katakanaOnReadings.filter(Boolean)![0],
      }
    : null;
}

function getKanOnPriority(
  inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns[string] | null,
): {
  priority: number;
  xiaoyunsByMatchingType: OnReadingToTypeToXiaoyuns[string];
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
