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
import { FigureBadge } from "~/components/FigureBadge";
import { prisma } from "~/db.server";
import {
  BadgeProps,
  badgeFigureSelect,
  getBadgeProps,
} from "~/features/dictionary/badgeFigure";

interface LoaderData {
  atomicComponents: Record<string, BadgeProps>;
  compoundComponents: Record<string, BadgeProps>;
  totalAtomicComponents: number;
  totalCompoundComponents: number;
}

const isPriorityComponentWhere = {
  isPriority: true,
  asComponent: {
    allUses: {
      some: {
        isPriority: true,
      },
    },
  },
};
async function getAllListCharacterBadgeFigures(prisma: PrismaClient) {
  const priorityAtomicComponents = await prisma.kanjisenseFigure.findMany({
    select: { ...badgeFigureSelect, image: true },
    orderBy: { aozoraAppearances: "desc" },
    where: { ...isPriorityComponentWhere, componentsTree: { equals: [] } },
  });
  const priorityCompoundComponents = await prisma.kanjisenseFigure.findMany({
    select: { ...badgeFigureSelect, image: true },
    orderBy: { aozoraAppearances: "desc" },
    where: { ...isPriorityComponentWhere, componentsTree: { not: [] } },
  });

  const atomicMap: Record<string, BadgeProps> = {};
  const compoundMap: Record<string, BadgeProps> = {};

  for (const figure of priorityAtomicComponents) {
    atomicMap[figure.id] = getBadgeProps(figure);
  }
  for (const figure of priorityCompoundComponents) {
    compoundMap[figure.id] = getBadgeProps(figure);
  }
  return {
    atomicComponents: atomicMap,
    compoundComponents: compoundMap,
    totalAtomicComponents: priorityAtomicComponents.length,
    totalCompoundComponents: priorityCompoundComponents.length,
  };
}

export const loader: LoaderFunction = async () => {
  const allBadgeFigures = await getAllListCharacterBadgeFigures(prisma);

  return json<LoaderData>(allBadgeFigures);
};

export default function FigureDetailsPage() {
  const loaderData = useLoaderData<LoaderData>();
  const {
    atomicComponents,
    compoundComponents,
    totalAtomicComponents,
    totalCompoundComponents,
  } = loaderData;
  const totalComponents = totalAtomicComponents + totalCompoundComponents;
  return (
    <DictionaryLayout>
      <main className="flex flex-col gap-2">
        <h1>{totalComponents} componentstotal</h1>
        <h2>{totalAtomicComponents} atomic components total</h2>
        <section>
          {Object.entries(atomicComponents).map(([id, badgeProps]) => (
            <FigureBadgeLink key={id} id={id} badgeProps={badgeProps} />
          ))}
        </section>
        <h2>{totalCompoundComponents} compound components total</h2>
        <section>
          {Object.entries(compoundComponents).map(([id, badgeProps]) => (
            <FigureBadgeLink key={id} id={id} badgeProps={badgeProps} />
          ))}
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
