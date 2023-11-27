import { readFileSync } from "fs";

import { PrismaClient } from "@prisma/client";

import { registerSeeded } from "prisma/seedUtils";
import { files, getShuowenFilePath } from "~/lib/files.server";

import { toukeiBetsujiMappings } from "../../app/lib/dic/toukeiBetsujiMappings";

import { executeAndLogTime } from "./executeAndLogTime";

const specialSealScriptMappings: Partial<Record<string, string>> = {
  "𤰔": "叀",
  藝: "藝",
};

export async function seedShuowenImages(prisma: PrismaClient, force = false) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "ShuowenImage" },
  });

  if (seeded && !force) console.log(`ShuowenImage already seeded. 🌱`);
  else {
    console.log(`seeding ShuowenImage...`);

    const shuowenCharactersText = readFileSync(
      files.kanjiDBShuowenCharacters,
      "utf-8",
    );
    const charactersToShuowenGroups = new Map<string, string>(
      shuowenCharactersText
        .split(" ")
        .map((chars) => {
          return Array.from(chars, (char) => [char, chars] as const);
        })
        .flat(1),
    );

    console.log("preparing images data");
    const allFiguresIds = await prisma.kanjisenseFigure.findMany({
      select: { id: true },
    });
    const dbInput = new Map<
      string,
      {
        id: string;
        paths: string[];
        figureIds: string[];
      }
    >();

    const allFiguresVariantGroups =
      await prisma.kanjisenseVariantGroup.findMany({
        select: {
          id: true,
          variants: true,
        },
      });

    const variantGroupIdsToFigures = new Map(
      allFiguresVariantGroups.map(
        (group) => [group.id, group.variants] as const,
      ),
    );

    for (const { id: figureId } of allFiguresIds) {
      const shuowenGroups: string[] = [];
      const addShuowenGroup = (character: string) => {
        const filenameGroup = charactersToShuowenGroups.get(character);
        if (filenameGroup) shuowenGroups.push(filenameGroup);
      };

      const toukeiBetsujiMapping = toukeiBetsujiMappings[figureId];
      if (toukeiBetsujiMapping) {
        for (const traditionalCharacter of toukeiBetsujiMapping)
          addShuowenGroup(traditionalCharacter);
      } else {
        addShuowenGroup(specialSealScriptMappings[figureId] || figureId);
      }

      if (!shuowenGroups.length && !specialSealScriptMappings[figureId]) {
        const kanjisenseVariants = variantGroupIdsToFigures.get(figureId);
        for (const variant of kanjisenseVariants || [])
          addShuowenGroup(variant);
      }

      if (shuowenGroups.length) {
        const id = shuowenGroups.join(" ");

        if (!dbInput.has(id)) {
          const svgPaths = shuowenGroups.map((group) => {
            const filepath = getShuowenFilePath(group);
            const shuowenText = readFileSync(filepath, "utf-8");
            const pathStart = shuowenText.indexOf('d="') + 3;
            if (pathStart === -1)
              throw new Error(
                `Invalid Shuowen SVG file for ${figureId} at ${filepath}`,
              );
            const pathEnd = shuowenText.indexOf('" /', pathStart) + 1;
            const path = shuowenText.slice(pathStart, pathEnd);
            if (!path)
              throw new Error(`Invalid Shuowen SVG path for ${figureId}`);
            return path;
          });

          dbInput.set(id, {
            id,
            paths: svgPaths,
            figureIds: [],
          });
        }
        dbInput.get(id)!.figureIds.push(figureId);
      }
    }

    await prisma.shuowenImage.deleteMany({});

    await executeAndLogTime("seeding shuowen images data", () =>
      prisma.shuowenImage.createMany({
        data: Array.from(dbInput.entries()).map(([id, { paths }]) => ({
          id,
          paths,
        })),
      }),
    );

    await executeAndLogTime("connecting shuowen images data", async () => {
      for (const [id, { figureIds }] of dbInput.entries()) {
        for (const figureId of figureIds) {
          await prisma.kanjisenseFigure.update({
            where: {
              id: figureId,
            },
            data: {
              shuowenImageId: id,
            },
          });
        }
      }
    });

    await registerSeeded(prisma, "ShuowenImage");
  }
}
