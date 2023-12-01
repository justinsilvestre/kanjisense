import { Prisma, PrismaClient } from "@prisma/client";

import { files, readJsonSync } from "~/lib/files.server";

import { registerSeeded } from "../seedUtils";

import { getYuntuJson, XiaoyunCategoriesJson } from "./getYuntuJson";

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
  const seeded = await prisma.setup.findUnique({
    where: { step: "SbgyXiaoyun" },
  });
  if (seeded && !force) console.log(`SbgyXiaoyun already seeded. 🌱`);
  else {
    console.log(`seeding SbgyXiaoyun...`);
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
  }

  await registerSeeded(prisma, "SbgyXiaoyun");

  console.log(`SbgyXiaoyun seeded. 🌱`);
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

  const yuntuJson = await getYuntuJson();
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

export const overrides: Record<number, XiaoyunCategoriesJson> = {
  // no homophones so no fanqie was given
  1919: ["章", "蒸", "上", null, null], // 拯
  3177: ["影", "銜", "去", null, null], // 𪒠

  // rhyme classes differ from http://suzukish.s252.xrea.com/search/inkyo/yunzi/<CHARACTER>
  // and in ytenx.org guangyun scans
  392: ["並", "咍", "平", null, null], // 𤗏
  400: ["滂", "咍", "平", null, null], // 𡜊
  1452: ["滂", "咍", "上", null, null], // 啡 listed as homophonous to 俖; see next line
  1458: ["幫", "咍", "上", null, null], // 俖 has unaspirated P yunjing, also Jiyun lists that as possible reading.
  1456: ["明", "咍", "上", null, null], // 䆀
  1465: ["並", "咍", "上", null, null], // 倍
  2530: ["明", "咍", "去", null, null], // 䆀
  2381: ["透", "齊", "去", "開", "三"], // 𥱻

  // some atypical initial/final combos
  // were made more typical
  1310: ["泥", "之", "上", null, null], // 伱
  2886: ["泥", "麻", "去", "開", "二"], //䏧
  1871: ["端", "庚", "上", "開", "二"], // 打
  574: ["從", "山", "平", "開", null], // 虥

  // apparently corrections, judging by unt  https://www.zhihu.com/question/490585553/answer/2157640006
  1763: ["精", "歌", "上", "合", "一"], // 硰,
};
