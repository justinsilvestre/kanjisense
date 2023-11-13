import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { DictLink } from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { prisma } from "~/db.server";
import { BadgeProps, getBadgeProps } from "~/features/dictionary/displayFigure";
import {
  hyogaiKanji,
  jinmeiyoNotInHyogai,
  joyoNotInKyoiku,
  kyoikuKanji,
} from "~/lib/baseKanji";

import { FigureBadge, badgeFigureSelect } from "../components/FigureBadge";

interface LoaderData {
  characters: Record<string, BadgeProps>;
  totalCharacters: number;
}

async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const priorityCharacters = await prisma.kanjisenseFigure.findMany({
    select: { ...badgeFigureSelect },
    orderBy: { aozoraAppearances: "desc" },
    where: {
      listsAsCharacter: {
        isEmpty: false,
      },
    },
  });
  const characters: Record<string, BadgeProps> = Object.fromEntries(
    priorityCharacters.map((figure) => {
      return [figure.id, getBadgeProps(figure)];
    }),
  );
  return {
    characters: characters,
    totalCharacters: priorityCharacters.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return json<LoaderData>(allBadgeFigures);
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { characters, totalCharacters } = loaderData;
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <h1>{totalCharacters} characters total</h1>
        <section>
          {kyoikuKanji.map((gradeCharactersJoined, gradeIndex) => {
            return (
              <section key={gradeIndex}>
                <h3>Grade {gradeIndex + 1}</h3>
                {[...gradeCharactersJoined]
                  .sort(
                    (a, b) =>
                      characters[b].aozoraAppearances -
                      characters[a].aozoraAppearances,
                  )
                  .map((gradeCharacter) => {
                    return (
                      <FigureBadgeLink
                        key={gradeCharacter}
                        id={gradeCharacter}
                        badgeProps={characters[gradeCharacter]}
                      />
                    );
                  })}
              </section>
            );
          })}
        </section>
        <section>
          <h2>Joyo</h2>
          {joyoNotInKyoiku
            .sort(
              (a, b) =>
                characters[b].aozoraAppearances -
                characters[a].aozoraAppearances,
            )
            .map((kanji) => {
              return (
                <FigureBadgeLink
                  key={kanji}
                  id={kanji}
                  badgeProps={characters[kanji]}
                />
              );
            })}
        </section>
        <section>
          <h2>Hyogai</h2>
          {[...hyogaiKanji]
            .sort(
              (a, b) =>
                characters[b].aozoraAppearances -
                characters[a].aozoraAppearances,
            )
            .map((kanji) => {
              return (
                <FigureBadgeLink
                  key={kanji}
                  id={kanji}
                  badgeProps={characters[kanji]}
                />
              );
            })}
        </section>

        <section>
          <h2>Jineiyo</h2>
          {jinmeiyoNotInHyogai
            .sort(
              (a, b) =>
                characters[b].aozoraAppearances -
                characters[a].aozoraAppearances,
            )
            .map((kanji) => {
              return (
                <FigureBadgeLink
                  key={kanji}
                  id={kanji}
                  badgeProps={characters[kanji]}
                />
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
