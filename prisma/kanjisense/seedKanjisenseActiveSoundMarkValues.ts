import { PrismaClient } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { toKatakana } from "wanakana";

import { InferredOnyomiType } from "~/lib/qys/inferOnyomi";

import { registerSeeded } from "../seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import { OnReadingToTypeToXiaoyuns } from "./seedKanjisenseFigureReadings";

export async function seedKanjisenseActiveSoundMarkValuess(
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

      katakanaOnReadings.sort((aKatakana, bKatakana) => {
        return (
          getKanOnPriority(inferredOnReadingCandidates[aKatakana]) -
          getKanOnPriority(inferredOnReadingCandidates[bKatakana])
        );
      });
      const activeSoundMarkValue =
        katakanaOnReadings[0] ??
        Object.keys(inferredOnReadingCandidates).sort((a, b) => {
          return (
            getKanOnPriority(inferredOnReadingCandidates[a]) -
            getKanOnPriority(inferredOnReadingCandidates[b])
          );
        })?.[0];

      for (const soundMarkUseFigure of soundMarkFigure.asComponent!
        .soundMarkUses) {
        await prisma.kanjisenseFigure.update({
          where: { id: soundMarkUseFigure.id },
          data: {
            activeSoundMarkValue,
          },
        });
      }
    }
  }
}

function getKanOnPriority(
  inferredOnReadingCandidates: OnReadingToTypeToXiaoyuns[string] | null,
) {
  if (!inferredOnReadingCandidates) return 999;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    !inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return 1;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    !inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return 2;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return 3;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKan] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare]
  )
    return 4;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGoRare]
  )
    return 4;
  if (
    inferredOnReadingCandidates[InferredOnyomiType.AttestedKanRare] &&
    inferredOnReadingCandidates[InferredOnyomiType.AttestedGo]
  )
    return 5;
  if (inferredOnReadingCandidates[InferredOnyomiType.SpeculatedKan]) return 6;
  return 999;
}

// ATTESTED_KAN: "k",
// ATTESTED_KAN_RARE: "l",
// ATTESTED_GO: "g",
// ATTESTED_GO_RARE: "h",
// INFERRED_KAN: "x",
// INFERRED_GO: "y",
// KANYO: "z",
