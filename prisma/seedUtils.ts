import { PrismaClient } from "@prisma/client";

export type SetupStep =
  | "KanjidicEntry"
  | "JMDictEntry"
  | "KanjiDbComposition"
  | "KanjiDbSbgyNote"
  | "KanjiDbVariant"
  | "KanjisenseFigureMeaning"
  | "KanjisenseFigureReading"
  | "KanjisenseFigureRelation"
  | "KanjisenseFigure"
  | "KanjiDbCharacterDerivation"
  | "KanjisenseActiveSoundMark"
  | "KanjisenseActiveSoundMarkValue"
  | "SbgyXiaoyun"
  | "SbgyXiaoyun"
  | "ScriptinAozoraFrequency"
  | "Unihan12"
  | "Unihan12"
  | "Unihan14"
  | "Unihan14"
  | "Unihan15"
  | "Unihan15"
  | "KanjisenseFigureImage"
  | "ShuowenImage"
  | "GlyphImage"
  | "KanjisenseFigureBadgeProps"
  | "KanjisenseFigureSearchProperty"
  | "KanjisenseVariantGroup";

async function registerSeeded(
  prisma: PrismaClient,
  version: number | "KEYLESS STEP",
  step: SetupStep,
) {
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
}

export async function runSetupStep({
  prisma,
  version,
  step,
  setup,
  force,
}: {
  prisma: PrismaClient;
  version: number | "KEYLESS STEP";
  step: SetupStep;
  setup: (log: (text: string) => void) => Promise<void>;
  force: boolean;
}) {
  const stepWasAlreadyCompleted =
    version === "KEYLESS STEP"
      ? await prisma.setup.findFirst({
          where: { step },
        })
      : await prisma.setup.findUnique({
          where: { step_version: { step, version } },
        });

  const versionLabel = version === "KEYLESS STEP" ? "0" : `${version}`;
  if (force || !stepWasAlreadyCompleted) {
    console.log(`seeding ${step} v${versionLabel}...`);
    await setup((text: string) => console.log(`${step}: `, text));
    await registerSeeded(prisma, version, step);
    console.log(`${step} v${versionLabel} seeded. 🌱`);
  } else {
    console.log(`${step} v${versionLabel} already seeded. 🌱`);
  }
}
