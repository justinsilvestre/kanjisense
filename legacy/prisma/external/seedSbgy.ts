import { Prisma, PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { files, readJsonSync } from "~/lib/files.server";

import { runSetupStep } from "../seedUtils";

import { getYuntuJson } from "./getYuntuJson";
import { overrides } from "./yuntuOverrides";

// mostly ocr and xml structure corrections
const replacementFanqie = {
  179: "尺隹切",
  549: "奴還切",
  682: "尺招切",
  795: "敕加切",
  1155: "符咸切",
  1170: "蒲蠓切",
  1444: "于罪切",
  1509: "仄謹切",
  1612: "方典切",
  1795: "叉瓦切",
  1919: "章拯切", // no homophones
  2100: "千弄切",
  2109: "千仲切",
  2600: "符万切",
  2970: "北諍切",
  3176: "士懴切",
  3177: "影鑑切", // no homophones
  3791: "士七切",
  // apparently errors in original text, cf. margin notes of ytenx scans
  2295: "丘倨切",
  2697: "黃練切",
  2085: "仕檻切",
};
const replacementExemplars: Record<number, (text: string) => string> = {
  // probably ocr mistakes
  522: (t) => t.replace("𢘆", "桓"),
  // using commoner variant
  539: (t) => t.replace("𠜂", "刪"),
  595: (t) => t.replace("𤣥", "玄"),
};

export async function seedSbgy(prisma: PrismaClient, force = false) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    step: "SbgyXiaoyun",
    force,
    version: "KEYLESS STEP",
    async setup() {
      await prisma.sbgyXiaoyun.deleteMany({});

      const dbInput = await getDbInput();

      await prisma.sbgyXiaoyun.createMany({
        data: Object.values(dbInput).map(
          ({
            xiaoyun,
            fanqie,
            exemplars,
            initial,
            cycleHead,
            tone,
            kaihe,
            dengOrChongniu,
          }) => ({
            xiaoyun,
            fanqie,
            exemplars,
            initial,
            cycleHead,
            tone,
            kaihe,
            dengOrChongniu,
          }),
        ),
      });
    },
  });
}

async function getDbInput() {
  const dbInput: Record<number, Prisma.SbgyXiaoyunCreateInput> = {};

  const sbgyJson = readJsonSync<
    // [19,"昌終切","シュウ","充,珫,茺,㤝,䘪,𪎽,㳘"],
    [
      syllableNumber: number,
      fanqie: string,
      onReading: string,
      characters: string,
    ][]
  >(files.sbgyJson);

  const yuntuJson = await getYuntuJson(overrides);
  for (const [xiaoyunNumber, replaceExemplars] of Object.entries(
    replacementExemplars,
  )) {
    sbgyJson[+xiaoyunNumber - 1][3] = replaceExemplars(
      sbgyJson[+xiaoyunNumber - 1][3],
    );
  }
  for (const [xiaoyunNumber, fanqie, , exemplars] of sbgyJson) {
    dbInput[xiaoyunNumber] = {
      xiaoyun: xiaoyunNumber,
      fanqie:
        replacementFanqie[xiaoyunNumber as keyof typeof replacementFanqie] ||
        fanqie,
      exemplars: exemplars ? exemplars.split(",") : [],
      initial: yuntuJson[xiaoyunNumber][0],
      cycleHead: yuntuJson[xiaoyunNumber][1],
      tone: yuntuJson[xiaoyunNumber][2],
      kaihe: yuntuJson[xiaoyunNumber][3] || null,
      dengOrChongniu: yuntuJson[xiaoyunNumber][4] || null,
    };

    if (
      dbInput[xiaoyunNumber].cycleHead === "庚" &&
      dbInput[xiaoyunNumber].dengOrChongniu === "三" &&
      dbInput[xiaoyunNumber].initial === "生" &&
      dbInput[xiaoyunNumber].tone === "入"
    ) {
      // undoing inconsistency with Kan-on
      dbInput[xiaoyunNumber].dengOrChongniu = "二";
    }
  }
  return dbInput;
}
