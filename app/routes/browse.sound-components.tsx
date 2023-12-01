import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { Fragment } from "react";

import { DictLink } from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { FigureBadge } from "~/components/FigureBadge";
import { prisma } from "~/db.server";
import { abbreviateTranscriptions } from "~/features/dictionary/abbreviateTranscriptions";
import {
  BadgeProps,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";
import {
  parseActiveSoundMarkValue,
  transcribeSerializedXiaoyunProfile,
} from "~/features/dictionary/getActiveSoundMarkValueText";

type LoaderData = Awaited<ReturnType<typeof getAllListCharacterBadgeFigures>>;

const groupsThresholds = [10, 8, 7, 5, 4, 3, 2, 1];

async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const prioritySoundComponents = await prisma.kanjisenseFigure.findMany({
    select: {
      ...badgeFigureSelect,
      image: true,

      asComponent: {
        ...badgeFigureSelect.asComponent,
        where: {
          soundMarkUses: {
            some: {
              isPriority: true,
            },
          },
        },
        select: {
          ...badgeFigureSelect.asComponent.select,
          soundMarkUses: {
            orderBy: {
              aozoraAppearances: "desc",
            },
            where: {
              isPriority: true,
            },
            select: {
              id: true,
              activeSoundMarkValue: true,
            },
          },
        },
      },
      reading: {
        select: {
          selectedOnReadings: true,
          sbgyXiaoyuns: {
            select: { sbgyXiaoyun: true },
          },
          kanjidicEntry: {
            select: {
              onReadings: true,
            },
          },
        },
      },
    },
    orderBy: {
      aozoraAppearances: "desc",
    },
    where: {
      isPriority: true,
      listsAsComponent: { isEmpty: false },
      asComponent: {
        soundMarkUses: {
          some: {
            isPriority: true,
          },
        },
      },
    },
  });

  const map: Record<
    string,
    {
      badge: BadgeProps;
      readings: (typeof prioritySoundComponents)[number]["reading"];
      values: string[];
      uses: string[];
      usesCount: number;
    }
  > = {};

  for (const figure of prioritySoundComponents) {
    map[figure.id] = {
      badge: getBadgeProps(figure),
      readings: figure.reading,
      usesCount: figure.asComponent!.soundMarkUses.length,
      uses: figure.asComponent!.soundMarkUses.map((u) => u.id),
      values: [
        ...new Set(
          figure.asComponent!.soundMarkUses.flatMap(
            (u) => u.activeSoundMarkValue || [],
          ),
        ),
      ],
    };
  }
  return {
    soundComponents: map,
    totalSoundComponents: prioritySoundComponents.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return json<LoaderData>(allBadgeFigures);
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { soundComponents, totalSoundComponents } = loaderData;

  let groupThreshold: number | null = null;

  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <h1>{totalSoundComponents} sound components total</h1>
        <section className="gap-4">
          {Object.entries(soundComponents)
            .sort(([, a], [, b]) => b.usesCount - a.usesCount)

            .map(([id, { badge, uses, values }]) => {
              const parsedValues = values.map((v) =>
                parseActiveSoundMarkValue(v),
              );

              const newGroup =
                !groupThreshold || uses.length < groupThreshold
                  ? groupsThresholds.find((t) => t <= uses.length)
                  : null;

              if (newGroup) groupThreshold = newGroup;
              return (
                <Fragment key={id}>
                  {newGroup ? (
                    <h2 className="m-4 basis-full text-center text-lg">
                      Seen in {newGroup} or more places
                    </h2>
                  ) : null}
                  <div className="m-1 inline-flex flex-row gap-2" key={id}>
                    <FigureBadgeLink key={id} id={id} badgeProps={badge} />
                    <div className="flex flex-col">
                      <div>
                        {parsedValues.map((v, i) => (
                          <span key={i}>
                            {v.katakana}{" "}
                            {v.xiaoyunsByMatchingType
                              ? abbreviateTranscriptions(
                                  Array.from(
                                    new Set(
                                      Object.values(
                                        v.xiaoyunsByMatchingType,
                                      ).flatMap((xs) =>
                                        xs.map((x) => x.profile),
                                      ),
                                    ),
                                    (p) =>
                                      transcribeSerializedXiaoyunProfile(p),
                                  ),
                                )
                              : null}
                          </span>
                        ))}
                      </div>

                      <div className=" max-w-[10rem] text-lg">
                        {uses.map((u) => (
                          <span key={u}>
                            <DictLink
                              key={u}
                              figureId={u}
                              className=" no-underline hover:underline"
                            >
                              {u}
                            </DictLink>{" "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
        </section>
      </main>
    </DictionaryLayout>
  );
}

function FigureBadgeLink({
  id: figureId,
  badgeProps,
}: {
  id: string;
  badgeProps: BadgeProps;
}) {
  return (
    <DictLink figureId={figureId}>
      <FigureBadge id={figureId} badgeProps={badgeProps} />
    </DictLink>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Figure not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
