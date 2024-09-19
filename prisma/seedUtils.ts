import { SeedInterface } from "./SeedInterface";
import { SetupStep } from "./SetupStep";

export async function runSetupStep({
  seedInterface: seedInterface,
  version,
  step,
  setup,
  force,
}: {
  seedInterface: SeedInterface;
  version: number | "KEYLESS STEP";
  step: SetupStep;
  setup: (
    seedInterface: SeedInterface,
    log: typeof console.log,
  ) => Promise<void>;
  force: boolean;
}) {
  const stepWasAlreadyCompleted =
    await seedInterface.wasSeedStepAlreadyCompleted(version, step);

  const versionLabel = version === "KEYLESS STEP" ? "0" : `${version}`;
  if (force || !stepWasAlreadyCompleted) {
    console.log(`seeding ${step} v${versionLabel}...`);
    await setup(seedInterface, (...logArgs) =>
      console.log(`${step}: `, ...logArgs),
    );
    await seedInterface.registerSeeded(version, step);
    console.log(`${step} v${versionLabel} seeded. 🌱`);
  } else {
    console.log(`${step} v${versionLabel} already seeded. 🌱`);
  }
}
