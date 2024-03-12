import { FigureSearchPropertyType } from "@prisma/client";
import { type PrismaClient } from "@prisma/client";

import { runSetupStep } from "prisma/seedUtils";
import { getFigureId } from "~/models/figure";

import { executeAndLogTime } from "./executeAndLogTime";
import {
  getFigureSearchProperties,
  getFigureSearchPropertySources,
} from "./getFigureSearchProperties";
import { inBatchesOf } from "./inBatchesOf";
import { SearchPropertySpecs } from "./SearchPropertySpecs";

export async function seedFigureSearchProperties(
  prisma: PrismaClient,
  version: number,
  processBatchSize = 500,
  force = false,
  verbose = false,
) {
  await runSetupStep({
    prisma,
    step: "KanjisenseFigureSearchProperty",
    version,
    force,
    async setup() {
      console.log("Deleting search properties on figures...");
      await executeAndLogTime(
        "deleting search properties on figures",
        async () => {
          await prisma.searchPropertiesOnFigure.deleteMany({
            where: { version },
          });

          await prisma.figureSearchProperty.deleteMany({ where: { version } });
        },
      );

      const figureIds = await prisma.kanjisenseFigure
        .findMany({
          where: { version },
          select: { id: true },
        })
        .then((fs) => fs.map((f) => f.id));

      await inBatchesOf({
        batchSize: processBatchSize,
        collection: figureIds,
        action: async (batchIds) => {
          const figures = await prisma.kanjisenseFigure.findMany({
            where: {
              id: {
                in: batchIds,
              },
            },
            include: {
              reading: {
                include: {
                  kanjidicEntry: true,
                },
              },
              meaning: true,
            },
          });
          const searchPropertiesForFiguresInBatch = new Map<
            SearchPropertyKey,
            SearchPropertySpecs
          >();
          const searchPropertiesOnFiguresDbInput = new Map<
            string,
            Map<string, SearchPropertiesOnFigureSpecs>
          >();

          for (const figure of figures) {
            const { key } = figure;

            const searchPropertiesByType = getFigureSearchProperties(
              key,
              getFigureSearchPropertySources(
                figure,
                (await prisma.kanjisenseVariantGroup
                  .findFirst({
                    where: {
                      version,
                      figures: {
                        some: {
                          key,
                        },
                      },
                    },
                    include: {
                      figures: {
                        include: {
                          reading: {
                            include: {
                              kanjidicEntry: true,
                            },
                          },
                          meaning: true,
                        },
                      },
                    },
                  })
                  .then((v) => v?.figures)) || [],
              ),
            );
            const searchProperties = Object.values(
              searchPropertiesByType,
            ).flat();

            const notEnoughSearchProperties =
              figure.isPriority &&
              searchProperties.length ===
                1 +
                  (searchPropertiesByType[FigureSearchPropertyType.VARIANT]
                    ?.length || 0);
            if (notEnoughSearchProperties) {
              console.warn(
                `             Figure ${key} has only KEY and VARIANTS search properties`,
              );
            }

            for (const searchProperty of searchProperties) {
              searchPropertiesForFiguresInBatch.set(
                searchProperty.key,
                searchProperty,
              );

              addSearchPropertyOnFigureSpecs(key, searchProperty);
            }
          }
          const existingSearchProperties = new Set(
            (
              await prisma.figureSearchProperty.findMany({
                where: {
                  key: {
                    in: Array.from(searchPropertiesForFiguresInBatch.keys()),
                  },
                },
              })
            ).map((sp) => sp.key),
          );
          const searchPropertiesToCreate = [
            ...searchPropertiesForFiguresInBatch,
          ].filter(([spKey]) => !existingSearchProperties.has(spKey));
          if (verbose) {
            console.log(
              "searchPropertiesToCreate.length",
              searchPropertiesToCreate.length,
            );
            console.log(
              "searchPropertiesForFiguresInBatch.size",
              searchPropertiesForFiguresInBatch.size,
            );
            console.log(
              "new Set(searchPropertiesToCreate.map(sp=>sp.key)).size",

              new Set(searchPropertiesToCreate.map(([spKey]) => spKey)).size,
            );
          }

          const created = await prisma.figureSearchProperty.createMany({
            data: searchPropertiesToCreate.map(([, sp]) => ({
              version,
              text: sp.text,
              type: sp.type,
              display: sp.display,
              key: sp.key,
            })),
          });

          console.log(
            `Created ${created.count} of ${searchPropertiesToCreate.length} search props`,
          );
          await executeAndLogTime(
            "connecting figures and search properties",
            () =>
              prisma.searchPropertiesOnFigure.createMany({
                data: mapFlatmap(
                  searchPropertiesOnFiguresDbInput,
                  (figureKey, specsKeysToSpecs) =>
                    Array.from(specsKeysToSpecs, ([, specs]) => ({
                      version,
                      figureId: getFigureId(version, figureKey),
                      searchPropertyKey: specs.searchPropertyKey,
                      index: specs.index,
                    })),
                ),
              }),
          );

          function addSearchPropertyOnFigureSpecs(
            key: string,
            searchProperty: SearchPropertySpecs,
          ) {
            const searchPropertiesOnFigureSpecs =
              searchPropertiesOnFiguresDbInput.get(key) || new Map();
            if (!searchPropertiesOnFigureSpecs.has(searchProperty.key))
              searchPropertiesOnFigureSpecs.set(
                searchProperty.key,
                new SearchPropertiesOnFigureSpecs(
                  key,
                  searchProperty.key,
                  searchProperty.index,
                ),
              );
            searchPropertiesOnFiguresDbInput.set(
              key,
              searchPropertiesOnFigureSpecs,
            );
          }
        },
      });
    },
  });
}

class SearchPropertiesOnFigureSpecs {
  constructor(
    public figureKey: string,
    public searchPropertyKey: SearchPropertyKey,
    public index: number,
  ) {}
}

type SearchPropertyKey = string;

function mapFlatmap<K, V, R>(map: Map<K, V>, fn: (k: K, v: V) => R[]): R[] {
  const result: R[] = [];
  for (const [k, v] of map) {
    result.push(...fn(k, v));
  }
  return result;
}
