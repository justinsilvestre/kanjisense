import { appendFileSync, writeFileSync } from "fs";

import { getYuntuJson } from "prisma/external/getYuntuJson";
import { overrides } from "prisma/external/yuntuOverrides";
import { files, readJsonSync } from "~/lib/files.server";

import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

const logOutputPath = __dirname + "/transcribeSbgyXiaoyun.test.log";

describe("transcribeSbgyXiaoyun", () => {
  it("works with each xiaoyun of Guangyun", async () => {
    const yuntuJsons = await getYuntuJson(overrides);
    const sbgyJson = readJsonSync<
      [
        syllableNumber: number,
        fanqie: string,
        onReading: string,
        characters: string,
      ][]
    >(files.sbgyJson);

    const xiaoyuns = Object.entries(yuntuJsons).map(
      ([xiaoyunNumber, yuntuJson]) => ({
        xiaoyunNumber: +xiaoyunNumber,
        initial: yuntuJson[0],
        cycleHead: yuntuJson[1],
        tone: yuntuJson[2],
        kaihe: yuntuJson[3] || null,
        dengOrChongniu: yuntuJson[4] || null,
        exemplars: sbgyJson[+xiaoyunNumber - 1][3],
      }),
    );
    writeFileSync(logOutputPath, "");

    const failedTranscriptions = xiaoyuns.flatMap((xiaoyun) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const transcription = transcribeSbgyXiaoyun(xiaoyun);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ascii = transcribeSbgyXiaoyun(xiaoyun, { ascii: true });
        appendFileSync(
          logOutputPath,
          `${xiaoyun.initial}${xiaoyun.cycleHead}${
            xiaoyun.dengOrChongniu || ""
          }${xiaoyun.kaihe || ""}${xiaoyun.tone}`.padEnd(8) +
            ` ${transcription.padEnd(7)} ,${xiaoyun.exemplars}\n`,
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
});
