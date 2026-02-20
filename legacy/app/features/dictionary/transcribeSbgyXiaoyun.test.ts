import { appendFileSync, writeFileSync } from "fs";

import { CanonicalInitial, getYuntuJson } from "prisma/external/getYuntuJson";
import { overrides } from "prisma/external/yuntuOverrides";
import { files, readJsonSync } from "~/lib/files.server";

import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

const logOutputPath = __dirname + "/transcribeSbgyXiaoyun.test.log";

describe("transcribeSbgyXiaoyun", () => {
  let xiaoyuns: {
    xiaoyunNumber: number;
    initial: CanonicalInitial;
    cycleHead: string;
    tone: string;
    kaihe: string | null;
    dengOrChongniu: string | null;
    exemplars: string;
  }[];
  beforeAll(async () => {
    const yuntuJsons = await getYuntuJson(overrides);
    const sbgyJson = readJsonSync<
      [
        syllableNumber: number,
        fanqie: string,
        onReading: string,
        characters: string,
      ][]
    >(files.sbgyJson);

    xiaoyuns = Object.entries(yuntuJsons).map(([xiaoyunNumber, yuntuJson]) => ({
      xiaoyunNumber: +xiaoyunNumber,
      initial: yuntuJson[0],
      cycleHead: yuntuJson[1],
      tone: yuntuJson[2],
      kaihe: yuntuJson[3] || null,
      dengOrChongniu: yuntuJson[4] || null,
      exemplars: sbgyJson[+xiaoyunNumber - 1][3],
    }));
  });
  it("works with each xiaoyun of Guangyun", async () => {
    writeFileSync(logOutputPath, "");

    const failedTranscriptions = xiaoyuns.flatMap((xiaoyun) => {
      try {
        const transcription = transcribeSbgyXiaoyun(xiaoyun);
        const ascii = transcribeSbgyXiaoyun(xiaoyun, { ascii: true });
        appendFileSync(
          logOutputPath,
          `${xiaoyun.initial}${xiaoyun.cycleHead}${
            xiaoyun.dengOrChongniu || ""
          }${xiaoyun.kaihe || ""}${xiaoyun.tone}`.padEnd(8) +
            ` ${transcription.padEnd(7)} ${ascii.padEnd(7)},${
              xiaoyun.exemplars
            }\n`,
        );
        return [];
      } catch (error) {
        appendFileSync(
          logOutputPath,
          `${xiaoyun.initial}${xiaoyun.cycleHead}${
            xiaoyun.dengOrChongniu || ""
          }${xiaoyun.kaihe || ""}${xiaoyun.tone} ${error} ,${
            xiaoyun.exemplars
          }\n`,
        );
        return { xiaoyun, error };
      }
    });

    console.log(`Wrote to ${logOutputPath}`);

    expect(failedTranscriptions).toEqual([]);
  });

  it("transcribes each syllable distinctly", () => {
    const transcribedSyllables = new Map(
      xiaoyuns.map((xiaoyun) => {
        const { initial, cycleHead, dengOrChongniu, kaihe, tone } = xiaoyun;
        return [
          xiaoyun.xiaoyunNumber,
          {
            xiaoyun,
            transcribed: transcribeSbgyXiaoyun(xiaoyun),
            ascii: transcribeSbgyXiaoyun(xiaoyun, { ascii: true }),
            transcriptionProfile: [
              initial,
              cycleHead,
              dengOrChongniu,
              kaihe,
              tone,
            ]
              .filter(Boolean)
              .join(""),
          },
        ];
      }),
    );

    type TranscriptionProfileString = string;
    const distinctTranscriptionProfiles = new Map<
      TranscriptionProfileString,
      number[]
    >();
    for (const {
      transcriptionProfile,
      xiaoyun: { xiaoyunNumber },
    } of transcribedSyllables.values()) {
      const existing =
        distinctTranscriptionProfiles.get(transcriptionProfile) || [];
      distinctTranscriptionProfiles.set(transcriptionProfile, existing);
      existing.push(xiaoyunNumber);
    }

    /** only records the first xiaoyun with this transcription */
    const transcriptionsToProfileStrings = new Map<string, string[]>();
    const asciiTranscriptionsToProfileStrings = new Map<string, string[]>();
    for (const [
      profileString,
      xiaoyunNumbers,
    ] of distinctTranscriptionProfiles) {
      const firstXiaoyunNumber = xiaoyunNumbers[0];
      const xiaoyun = transcribedSyllables.get(firstXiaoyunNumber)!;
      const { transcribed, ascii } = xiaoyun;
      const currentMatches =
        transcriptionsToProfileStrings.get(transcribed) || [];
      const currentAsciiMatches =
        asciiTranscriptionsToProfileStrings.get(ascii) || [];
      currentMatches.push(profileString);
      currentAsciiMatches.push(profileString);
      transcriptionsToProfileStrings.set(transcribed, currentMatches);
      asciiTranscriptionsToProfileStrings.set(ascii, currentAsciiMatches);
    }

    const transcriptionsWithMultipleSyllables = [
      ...transcriptionsToProfileStrings.entries(),
    ].filter(([, matches]) => matches.length > 1);
    const asciiTranscriptionsWithMultipleSyllables = [
      ...asciiTranscriptionsToProfileStrings.entries(),
    ].filter(([, matches]) => matches.length > 1);
    expect({
      transcriptionsWithMultipleSyllables,
      asciiTranscriptionsWithMultipleSyllables,
    }).toEqual({
      asciiTranscriptionsWithMultipleSyllables: [
        ["dzern", ["崇山開平", "從山開平"]],
        ["gwern", ["羣山合平", "匣山合平"]],
        ["gerq", ["匣佳開上", "羣佳開上"]],
        ["t'eih", ["透齊開去", "透齊三開去"]],
        ["gwerk", ["匣耕合入", "羣耕合入"]],
      ],
      transcriptionsWithMultipleSyllables: [
        ["dzạ̈n", ["崇山開平", "從山開平"]],
        ["tʻeiˎ", ["透齊開去", "透齊三開去"]],
      ],
    });
  });
});
