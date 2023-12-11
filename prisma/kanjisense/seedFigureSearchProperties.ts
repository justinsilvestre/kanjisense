import { FigureSearchPropertyType } from "@prisma/client";
import { type PrismaClient } from "@prisma/client";

import { registerSeeded } from "prisma/seedUtils";

import { executeAndLogTime } from "./executeAndLogTime";
import {
  getFigureSearchProperties,
  getFigureSearchPropertySources,
} from "./getFigureSearchProperties";
import { inBatchesOf } from "./inBatchesOf";
import { SearchPropertySpecs } from "./SearchPropertySpecs";

export async function seedFigureSearchProperties(
  prisma: PrismaClient,
  processBatchSize = 500,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigureSearchProperty" },
  });
  if (seeded && !force) {
    console.log(`figure search properties already seeded. 🌱`);
    return;
  }

  console.log("Deleting search properties on figures...");
  await executeAndLogTime("deleting search properties on figures", async () => {
    await prisma.searchPropertiesOnFigure.deleteMany({});

    await prisma.figureSearchProperty.deleteMany({});
  });

  const figureIds = await prisma.kanjisenseFigure
    .findMany({
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
        const { id } = figure;

        const searchPropertiesByType = getFigureSearchProperties(
          id,
          getFigureSearchPropertySources(
            figure,
            (await prisma.kanjisenseVariantGroup
              .findFirst({
                where: {
                  figures: {
                    some: {
                      id,
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
        const searchProperties = Object.values(searchPropertiesByType).flat();

        const notEnoughSearchProperties =
          figure.isPriority &&
          searchProperties.length ===
            1 +
              (searchPropertiesByType[FigureSearchPropertyType.VARIANT]
                ?.length || 0);
        if (notEnoughSearchProperties) {
          console.warn(
            `             Figure ${id} has only KEY and VARIANTS search properties`,
          );
        }

        for (const searchProperty of searchProperties) {
          searchPropertiesForFiguresInBatch.set(
            searchProperty.key,
            searchProperty,
          );

          addSearchPropertyOnFigureSpecs(id, searchProperty);
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

      const created = await prisma.figureSearchProperty.createMany({
        data: searchPropertiesToCreate.map(([, sp]) => ({
          text: sp.text,
          type: sp.type,
          display: sp.display,
          key: sp.key,
        })),
      });

      console.log(
        `Created ${created.count} of ${searchPropertiesToCreate.length} search props`,
      );
      await executeAndLogTime("connecting figures and search properties", () =>
        prisma.searchPropertiesOnFigure.createMany({
          data: mapFlatmap(
            searchPropertiesOnFiguresDbInput,
            (figureId, specsKeysToSpecs) =>
              Array.from(specsKeysToSpecs, ([, specs]) => ({
                figureId,
                searchPropertyKey: specs.searchPropertyKey,
                index: specs.index,
              })),
          ),
        }),
      );

      function addSearchPropertyOnFigureSpecs(
        id: string,
        searchProperty: SearchPropertySpecs,
      ) {
        const searchPropertiesOnFigureSpecs =
          searchPropertiesOnFiguresDbInput.get(id) || new Map();
        if (!searchPropertiesOnFigureSpecs.has(searchProperty.key))
          searchPropertiesOnFigureSpecs.set(
            searchProperty.key,
            new SearchPropertiesOnFigureSpecs(
              id,
              searchProperty.key,
              searchProperty.index,
            ),
          );
        searchPropertiesOnFiguresDbInput.set(id, searchPropertiesOnFigureSpecs);
      }
    },
  });

  await registerSeeded(prisma, "KanjisenseFigureSearchProperty");
}

class SearchPropertiesOnFigureSpecs {
  constructor(
    public figureId: string,
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
