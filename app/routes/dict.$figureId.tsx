import { SbgyXiaoyun } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { QysInitial } from "prisma/QysInitial";
import DictionaryLayout from "~/components/DictionaryLayout";
import { prisma } from "~/db.server";
import { InferredOnyomiType, Kaihe } from "~/lib/qys/inferOnyomi";
import {
  QysTranscriptionProfile,
  transcribe,
} from "~/lib/qys/transcribeXiaoyun";

type DictionaryPageSearchedFigure = NonNullable<
  Awaited<ReturnType<typeof getFigure>>
>;

type DictionaryPageFigureWithPriorityUses = Omit<
  DictionaryPageSearchedFigure,
  "variantGroup"
>;

export interface LoaderData {
  searchedFigure: DictionaryPageSearchedFigure;
}

async function getFigure(figureId: string) {
  return await prisma.kanjisenseFigure.findUnique({
    where: { id: figureId },
    include: {
      asComponent: { select: { id: true } },
      reading: {
        include: {
          sbgyXiaoyuns: {
            include: {
              sbgyXiaoyun: true,
            },
          },
          kanjidicEntry: {
            select: {
              onReadings: true,
              kunReadings: true,
            },
          },
        },
      },
      firstClassComponents: {
        orderBy: {
          indexInTree: "asc",
        },
        include: {
          component: {
            select: {
              id: true,
              keyword: true,
              mnemonicKeyword: true,
              reading: {
                select: {
                  sbgyXiaoyuns: {
                    select: {
                      sbgyXiaoyun: true,
                    },
                  },
                },
              },
            },
          },
          parent: {
            select: {
              activeSoundMarkId: true,
              activeSoundMarkValue: true,
            },
          },
        },
      },
      firstClassUses: {
        where: {
          OR: [
            { parent: { isPriority: true } },
            // {
            //   parent: {
            //     isPriority: false,
            //     relation: {
            //       directUses: {
            //         isEmpty: true,
            //       },
            //     },
            //   },
            // },
          ],
        },
        include: {
          parent: {
            include: {
              reading: {
                select: {
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
              asComponent: {
                select: {
                  id: true,
                  soundMarkUses: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      variantGroup: {
        select: {
          id: true,
          variants: true,
          figures: {
            include: {
              asComponent: { select: { id: true } },
              reading: {
                include: {
                  sbgyXiaoyuns: {
                    include: {
                      sbgyXiaoyun: true,
                    },
                  },
                  kanjidicEntry: {
                    select: {
                      onReadings: true,
                      kunReadings: true,
                    },
                  },
                },
              },
              firstClassComponents: {
                orderBy: {
                  indexInTree: "asc",
                },
                include: {
                  component: {
                    select: {
                      id: true,
                      keyword: true,
                      mnemonicKeyword: true,
                      reading: {
                        select: {
                          sbgyXiaoyuns: {
                            select: {
                              sbgyXiaoyun: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  parent: {
                    select: {
                      activeSoundMarkId: true,
                      activeSoundMarkValue: true,
                    },
                  },
                },
              },
              firstClassUses: {
                where: {
                  OR: [
                    { parent: { isPriority: true } },
                    // {
                    //   parent: {
                    //     isPriority: false,
                    //     relation: {
                    //       directUses: {
                    //         isEmpty: true,
                    //       },
                    //     },
                    //   },
                    // },
                  ],
                },
                include: {
                  parent: {
                    include: {
                      reading: {
                        select: {
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
                      asComponent: {
                        select: {
                          id: true,
                          soundMarkUses: {
                            select: {
                              id: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const { figureId } = params;

  const searchedFigure = figureId ? await getFigure(figureId) : null;
  if (!searchedFigure) {
    throw new Response(
      `No figure ${JSON.stringify(figureId)} could be found in the database.`,
      { status: 404 },
    );
  }

  return json<LoaderData>({
    searchedFigure,
  });
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { searchedFigure: figure } = loaderData;
  console.log(loaderData.searchedFigure.id, loaderData.searchedFigure);
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <h1>
          {figure.variantGroup?.id}: {figure.variantGroup?.variants.join(" ")}
        </h1>
        {figure.variantGroup ? (
          figure.variantGroup.variants.map((variantId) => {
            const variant = figure.variantGroup?.figures.find(
              (f) => f.id === variantId,
            );
            if (!variant) return null;
            return <SingleFigureEntry key={variantId} figure={variant} />;
          })
        ) : (
          <SingleFigureEntry figure={figure} />
        )}
      </main>
    </DictionaryLayout>
  );
}

function SingleFigureEntry({
  figure,
}: {
  figure: DictionaryPageFigureWithPriorityUses;
}) {
  return (
    <section className={`${figure.isPriority ? "" : "bg-gray-200"}`}>
      <h1>
        {figure.id} {figure.keyword} {figure.mnemonicKeyword}
      </h1>

      <h2>
        {figure.firstClassComponents.map((c) => (
          <span key={c.indexInTree}>
            {c.component.id}{" "}
            {c.parent.activeSoundMarkId === c.component.id
              ? displayActiveSoundMark(c)
              : ""}{" "}
            {c.component.keyword}{" "}
            {c.component.mnemonicKeyword
              ? `"${c.component.mnemonicKeyword}"`
              : ""}
          </span>
        ))}
      </h2>

      <h2>{figure.reading?.kanjidicEntry?.onReadings?.join(" ")}</h2>
      <h2>{figure.reading?.kanjidicEntry?.kunReadings?.join(" ")}</h2>
      <h2>
        {figure.reading?.sbgyXiaoyuns
          ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
          ?.join(" ")}
      </h2>

      <h2>standalone: {isStandaloneCharacter(figure) ? "yes" : "no"}</h2>
      <h2>
        sound mark:{" "}
        {figure.firstClassUses.some(
          (u) => u.parent.activeSoundMarkId === figure.id,
        )
          ? "yes"
          : "no"}
      </h2>

      <h2>use as a component in {figure.firstClassUses.length} figures</h2>

      <ul>
        {figure.firstClassUses.map((u) => (
          <li
            key={u.parentId}
            className={`inline-block m-4 ${
              !u.parent.isPriority ? "bg-slate-200" : ""
            }`}
          >
            <span className={` text-2xl`}>{u.parent.id}</span>
            <br />
            {isStandaloneCharacter(u.parent) ? "字" : ""}
            {u.parent.asComponent ? "⚙️" : ""}
            <br />
            {u.parent.activeSoundMarkId === figure.id
              ? getReadingMatchingSoundMark(u)
              : null}
            <br />
            {u.parent.keyword} {u.parent.mnemonicKeyword}
            <br />
          </li>
        ))}
      </ul>
    </section>
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
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

function getReadingMatchingSoundMark(
  firstClassUse: ElementOf<
    DictionaryPageFigureWithPriorityUses["firstClassUses"]
  >,
) {
  if (!firstClassUse.parent.activeSoundMarkId) return null;
  const onKatakana =
    firstClassUse.parent.reading?.kanjidicEntry?.onReadings?.[0];

  const qysTranscriptions = firstClassUse.parent.reading?.sbgyXiaoyuns
    ?.map((x) => transcribeSbgyXiaoyun(x.sbgyXiaoyun))
    ?.join(", ");

  return [onKatakana, qysTranscriptions].filter(Boolean).join(" ");
}

function displayActiveSoundMark(
  firstClassComponent: ElementOf<
    DictionaryPageFigureWithPriorityUses["firstClassComponents"]
  >,
) {
  const activeSoundMarkValue = firstClassComponent.parent.activeSoundMarkValue;
  if (!activeSoundMarkValue) return null;

  const [katakana, sbgyJsonText] = activeSoundMarkValue.split(" ");
  const onyomiTypesToXiaoyunNumbers = JSON.parse(sbgyJsonText) as Record<
    InferredOnyomiType,
    number[]
  >;
  const xiaoyunNumbers = Object.values(onyomiTypesToXiaoyunNumbers).flat();

  const xiaoyun = firstClassComponent.component.reading?.sbgyXiaoyuns.find(
    ({ sbgyXiaoyun }) => xiaoyunNumbers.includes(sbgyXiaoyun.xiaoyun),
  );
  if (!xiaoyun) return katakana;

  const transcription = transcribeSbgyXiaoyun(xiaoyun.sbgyXiaoyun);
  return `${katakana}${transcription ? ` (${transcription})` : ""}`;
}

type ElementOf<T> = T extends (infer E)[] ? E : never;

function transcribeSbgyXiaoyun(sbgyXiaoyun: SbgyXiaoyun) {
  const transcriptionProfile: QysTranscriptionProfile = {
    is合口: sbgyXiaoyun.kaihe === Kaihe.Closed,
    canonical母: sbgyXiaoyun.initial as QysInitial,
    tone聲: sbgyXiaoyun.tone as QysTranscriptionProfile["tone聲"],
    is重紐A類: sbgyXiaoyun.dengOrChongniu === "A",
    qieyunCycleHead韻: sbgyXiaoyun.cycleHead,
    contrastiveRow等: sbgyXiaoyun.dengOrChongniu,
  };
  return transcribe(transcriptionProfile);
}

function isStandaloneCharacter(figure: {
  listsAsCharacter: string[];
  asComponent: { id: string } | null;
}) {
  return Boolean(figure.listsAsCharacter.length || !figure.asComponent);
}
