import { readFileSync } from "node:fs";

import {
  KanjisenseFigure,
  KanjisenseFigureRelation,
  PrismaClient,
} from "@prisma/client";
import yaml from "yaml";

import { baseKanjiSet } from "~/lib/baseKanji";
import { files } from "~/lib/files.server";

import { registerSeeded } from "../seedUtils";

import { shouldComponentBeAssignedMeaning } from "./componentMeanings";
import { getBaseKanjiVariantGroups } from "./getBaseKanjiVariantGroups";
import { getFigureMeaningsText } from "./getFigureMeaningsText";
// import { getStandaloneCharacters } from "./getStandaloneCharacters";
import { getListsMembership } from "./seedKanjisenseFigureRelation";

export async function seedKanjisenseFigures(
  prisma: PrismaClient,
  force = false,
) {
  const seeded = await prisma.setup.findUnique({
    where: { step: "KanjisenseFigure" },
  });
  if (seeded && !force) console.log(`figures already seeded. 🌱`);
  else {
    console.log("Seeding figures...");

    const componentsDictionary = yaml.parse(
      readFileSync(files.componentsDictionaryYml, "utf-8"),
    ) as Record<string, ComponentMeaning>;
    // initialize figures with ID (and maybe keyword?)
    // simultaneously seed meanings

    const baseKanjiVariantsGroups = await getBaseKanjiVariantGroups(prisma);

    const priorityCharacters = await prisma.kanjisenseFigureRelation.findMany({
      where: {
        OR: [
          {
            id: { in: [...baseKanjiSet] },
          },
          {
            id: {
              in: Object.values(baseKanjiVariantsGroups).flatMap(
                (g) => g.variants,
              ),
            },
            directUses: { isEmpty: true },
          },
        ],
      },
    });
    const nonPriorityCharacters =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          id: { notIn: priorityCharacters.map((c) => c.id) },
          directUses: { isEmpty: true },
        },
      });
    const allStandaloneCharacters = priorityCharacters.concat(
      ...nonPriorityCharacters,
    );
    const componentFiguresPotentiallyNeedingMeaningAssignment =
      await prisma.kanjisenseFigureRelation.findMany({
        where: {
          directUses: { isEmpty: false },
          id: { not: { in: allStandaloneCharacters.map((c) => c.id) } },
          variantGroupId: { not: null },
        },
      });

    const meaningfulComponents: KanjisenseFigureRelation[] = [];
    const meaninglessComponents: KanjisenseFigureRelation[] = [];
    for (const figure of componentFiguresPotentiallyNeedingMeaningAssignment) {
      const shouldBeAssignedMeaning = await shouldComponentBeAssignedMeaning(
        prisma,
        figure,
      );
      if (shouldBeAssignedMeaning) meaningfulComponents.push(figure);
      else meaninglessComponents.push(figure);
    }

    const priorityFiguresMeanings = new Map<
      string,
      Awaited<ReturnType<typeof getFigureMeaningsText>>
    >();

    for (const figure of [
      ...allStandaloneCharacters,
      ...meaningfulComponents,
    ]) {
      const primaryVariantId =
        baseKanjiVariantsGroups[figure.id]?.id ?? figure.id;
      priorityFiguresMeanings.set(
        figure.id,
        await getFigureMeaningsText(prisma, primaryVariantId),
      );
    }

    const allAozoraCharacterFrequencies = Object.fromEntries(
      (
        await prisma.scriptinAozoraFrequency.findMany({
          where: {
            character: { in: allStandaloneCharacters.map((c) => c.id) },
          },
        })
      ).map((c) => [c.character, c]),
    );

    const dbInput = new Map<string, CreateKanjisenseFigureInput>();

    console.log("preparing priority figures...");
    for (const figure of [...priorityCharacters, ...meaningfulComponents]) {
      const id = figure.id;
      const meaning = priorityFiguresMeanings.get(figure.variantGroupId ?? id);
      if (!meaning) throw new Error(`meaning not found for ${id}`);
      const createFigureInput = getCreateFigureInput(
        figure,
        meaning,
        componentsDictionary,
        allAozoraCharacterFrequencies[id]?.appearances,
        true,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("preparing non-priority figures...");
    for (const figure of [...nonPriorityCharacters, ...meaninglessComponents]) {
      const id = figure.id;
      const meaning = priorityFiguresMeanings.get(figure.variantGroupId ?? id);
      if (!meaning) throw new Error(`meaning not found for ${id}`);

      const appearances = 0;

      const createFigureInput = getCreateFigureInput(
        figure,
        meaning,
        componentsDictionary,
        appearances,
        false,
      );
      dbInput.set(id, createFigureInput);
    }

    console.log("creating entries...");

    await prisma.kanjisenseFigureMeaning.deleteMany({});
    await prisma.kanjisenseFigure.deleteMany({});

    console.log("seeding figures");
    await prisma.kanjisenseFigure.createMany({
      data: [...dbInput.values()].map((r) => ({
        id: r.id,
        keyword: r.keyword,
        mnemonicKeyword: r.mnemonicKeyword,
        isPriority: r.isPriority,
        listsAsComponent: { set: r.listsAsComponent },
        listsAsCharacter: { set: r.listsAsCharacter },
        aozoraAppearances: r.aozoraAppearances,
        variantGroupId: r.variantGroupId,
      })),
    });

    console.log("seeding meanings");

    await prisma.kanjisenseFigureMeaning.createMany({
      data: [...dbInput.values()].map((r) => ({
        id: r.id,
        unihanDefinition: r.meaning?.unihanDefinitionText,
        kanjidicEnglish: r.meaning?.kanjidicEnglish,
      })),
    });

    console.log("connecting top-level components");

    console.log("registering active sound marks");

    await registerSeeded(prisma, "KanjisenseFigure");
    console.log(`figures seeded. 🌱`);
  }
}

interface CreateKanjisenseFigureInput {
  id: string;
  keyword: string;
  mnemonicKeyword: string | null;
  isPriority: boolean;
  listsAsComponent: string[];
  listsAsCharacter: string[];
  aozoraAppearances: number;
  variantGroupId: string | null;
  meaning?: Awaited<ReturnType<typeof getFigureMeaningsText>>;
}

class ComponentUse {
  parent: KanjisenseFigure;
  component: KanjisenseFigure;

  constructor(parent: KanjisenseFigure, component: KanjisenseFigure) {
    this.parent = parent;
    this.component = component;
  }

  toJSON() {
    return [this.parent.id, this.component.id];
  }
}

const componentsTreeCache = new Map<string, ComponentUse[]>();

function getCreateFigureInput(
  figure: KanjisenseFigureRelation,
  meaning: Awaited<ReturnType<typeof getFigureMeaningsText>>,
  componentsDictionary: Record<string, ComponentMeaning>,
  aozoraAppearances: number,
  isPriority: boolean,
) {
  const figureId = figure.id;

  const primaryVariantId = figure.variantGroupId ?? figureId;
  const mnemonicKeywords = componentsDictionary[primaryVariantId];
  const historicalKeyword =
    mnemonicKeywords?.historical && mnemonicKeywords.historical !== "(various)"
      ? mnemonicKeywords.historical
      : null;
  let mnemonicSource = "";
  if (mnemonicKeywords?.reference)
    mnemonicSource = ` {{cf. ${mnemonicKeywords.reference}}}`;
  else if (mnemonicKeywords?.standin)
    mnemonicSource = ` {{via ${mnemonicKeywords.standin}}}`;

  const keyword =
    (historicalKeyword ||
      meaning.kanjidicEnglish?.[0] ||
      meaning.unihanDefinitionText?.split(";")?.[0]) ??
    null;
  if (!keyword) console.error(`no keyword for ${figureId}`);

  return {
    id: figureId,
    keyword: keyword ?? "[MISSING]",
    mnemonicKeyword: mnemonicKeywords?.mnemonic
      ? [mnemonicKeywords.mnemonic, mnemonicSource].join("")
      : null,
    isPriority,
    listsAsComponent: figure.listsAsComponent, // refine?
    listsAsCharacter: [...getListsMembership(figureId)],
    aozoraAppearances: aozoraAppearances ?? 0,
    variantGroupId: figure.variantGroupId,
  };
}

export async function getComponentsTree(
  figure: KanjisenseFigure & { relation: KanjisenseFigureRelation },
  getFigure: (
    id: string,
  ) => Promise<KanjisenseFigure & { relation: KanjisenseFigureRelation }>,
) {
  if (componentsTreeCache.has(figure.id))
    return componentsTreeCache.get(figure.id)!;

  const componentsTree: ComponentUse[] = [];
  for (const componentKey of figure.relation.selectedIdsComponents) {
    if (componentKey === figure.id) continue; // prevent infinite loop for atomic figures
    const component = await getFigure(componentKey);

    componentsTree.push(
      new ComponentUse(figure, component),
      ...(await getComponentsTree(component, getFigure)),
    );
  }

  componentsTreeCache.set(figure.id, componentsTree);

  return componentsTree;
}

interface ComponentMeaning {
  /** historical meaning */
  historical?: string;
  /** mnemonic keyword, if historical meaning is absent or different */
  mnemonic?: string;
  /** for this component's mnemonic keyword, it borrows the meaning of a common kanji containing it. */
  standin?: string;
  /** this component derives its mnemonic keyword from a common kanji using it. */
  reference?: string;
  /** for grouping components by meaning */
  tag?: string | null;
}
