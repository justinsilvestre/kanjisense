import { readFileSync } from "fs";

import { PrismaClient } from "@prisma/client";

import { getSeedInterface } from "prisma/SeedInterface";
import { runSetupStep } from "prisma/seedUtils";
import { files, getShuowenFilePath } from "~/lib/files.server";
import { getFigureId } from "~/models/figure";

import { toukeiBetsujiMappings } from "../../app/lib/dic/toukeiBetsujiMappings";

import { executeAndLogTime } from "./executeAndLogTime";

const specialSealScriptMappings: Partial<Record<string, string>> = {
  "𤰔": "叀",
  藝: "藝",
};

export async function seedShuowenImages(
  prisma: PrismaClient,
  figuresVersion: number,
  force = false,
) {
  await runSetupStep({
    seedInterface: getSeedInterface(prisma),
    force,
    step: "ShuowenImage",
    version: figuresVersion,
    async setup() {
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
      const allFiguresKeys = await prisma.kanjisenseFigure.findMany({
        select: { key: true },
        where: { version: figuresVersion },
      });
      const dbInput = new Map<
        string,
        {
          paths: string[];
          figureKeys: string[];
        }
      >();

      const allFiguresVariantGroups =
        await prisma.kanjisenseVariantGroup.findMany({
          select: {
            key: true,
            variants: true,
          },
          where: {
            version: figuresVersion,
          },
        });

      const variantGroupKeyToVariantFiguresKeys = new Map(
        allFiguresVariantGroups.map(
          (group) => [group.key, group.variants] as const,
        ),
      );

      for (const { key: figureKey } of allFiguresKeys) {
        const shuowenGroups: string[] = [];
        const addShuowenGroup = (character: string) => {
          const filenameGroup = charactersToShuowenGroups.get(character);
          if (filenameGroup) shuowenGroups.push(filenameGroup);
        };

        const toukeiBetsujiMapping = toukeiBetsujiMappings[figureKey];
        if (toukeiBetsujiMapping) {
          for (const traditionalCharacter of toukeiBetsujiMapping)
            addShuowenGroup(traditionalCharacter);
        } else {
          addShuowenGroup(specialSealScriptMappings[figureKey] || figureKey);
        }

        if (!shuowenGroups.length && !specialSealScriptMappings[figureKey]) {
          const kanjisenseVariants =
            variantGroupKeyToVariantFiguresKeys.get(figureKey);
          for (const variant of kanjisenseVariants || [])
            addShuowenGroup(variant);
        }

        if (shuowenGroups.length) {
          const shuowenImageKey = shuowenGroups.join(" ");

          if (!dbInput.has(shuowenImageKey)) {
            const svgPaths = shuowenGroups.map((group) => {
              const filepath = getShuowenFilePath(group);
              const shuowenText = readFileSync(filepath, "utf-8");
              const pathStart = shuowenText.indexOf('d="') + 3;
              if (pathStart === -1)
                throw new Error(
                  `Invalid Shuowen SVG file for ${figureKey} at ${filepath}`,
                );
              const pathEnd = shuowenText.indexOf('" /', pathStart) + 1;
              const path = shuowenText.slice(pathStart, pathEnd);
              if (!path)
                throw new Error(`Invalid Shuowen SVG path for ${figureKey}`);
              return path;
            });

            dbInput.set(shuowenImageKey, {
              paths: svgPaths,
              figureKeys: [],
            });
          }
          dbInput.get(shuowenImageKey)!.figureKeys.push(figureKey);
        }
      }

      await prisma.shuowenImage.deleteMany({
        where: {
          version: figuresVersion,
        },
      });

      await executeAndLogTime("seeding shuowen images data", () =>
        prisma.shuowenImage.createMany({
          data: Array.from(dbInput, ([shuowenImageKey, { paths }]) => ({
            id: getFigureId(figuresVersion, shuowenImageKey),
            version: figuresVersion,
            paths,
          })),
        }),
      );

      await executeAndLogTime("connecting shuowen images data", async () => {
        for (const [shuowenImageKey, { figureKeys }] of dbInput.entries()) {
          for (const figureKey of figureKeys) {
            await prisma.kanjisenseFigure.update({
              where: {
                id: getFigureId(figuresVersion, figureKey),
              },
              data: {
                shuowenImageId: getFigureId(figuresVersion, shuowenImageKey),
              },
            });
          }
        }
      });
    },
  });
}
