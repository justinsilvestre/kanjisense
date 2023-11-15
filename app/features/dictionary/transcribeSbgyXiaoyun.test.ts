import { getYuntuJson } from "prisma/external/getYuntuJson";

import { transcribeSbgyXiaoyun } from "./transcribeSbgyXiaoyun";

describe("transcribeSbgyXiaoyun", () => {
  it("works with each xiaoyun of Guangyun", async () => {
    const yuntuJsons = await getYuntuJson();
    const xiaoyuns = Object.entries(yuntuJsons).map(
      ([xiaoyunNumber, yuntuJson]) => ({
        xiaoyunNumber: +xiaoyunNumber,
        initial: yuntuJson[0],
        cycleHead: yuntuJson[1],
        tone: yuntuJson[2],
        kaihe: yuntuJson[3] || null,
        dengOrChongniu: yuntuJson[4] || null,
      }),
    );

    const failedTranscriptions = xiaoyuns.flatMap((xiaoyun) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const transcription = transcribeSbgyXiaoyun(xiaoyun);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ascii = transcribeSbgyXiaoyun(xiaoyun, { ascii: true });
        return [];
      } catch (error) {
        return { xiaoyun, error };
      }
    });
    expect(failedTranscriptions).toEqual([]);
  });
});
