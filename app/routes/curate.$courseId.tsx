import { writeFileSync } from "fs";

import type { BaseCorpusText, KanjisenseFigure } from "@prisma/client";
import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useActionData,
  useLoaderData,
  useSubmit,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import { FigureBadgeLink } from "~/components/FigureBadgeLink";
import { prisma } from "~/db.server";
import { CharactersProgress } from "~/features/curate/CharactersProgress";
import {
  BadgePropsFigure,
  getBadgeProps,
  isAtomicFigure,
} from "~/features/dictionary/badgeFigure";
import { FIGURES_VERSION } from "~/models/figure";

import {
  CurationState,
  CurationStateTextGroup,
  getCurationState,
} from "../features/curate/getCurationState";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const seenCharactersParam = formData.get("sc") as string;
  const seenTextsParam = formData.get("st") as string;
  const wantedCharacters = formData.get("wc") as string;
  const normalizedTextSearchQuery = formData.get("ntsq") as string;
  const authors = (formData.get("a") as string)?.split(",")?.filter((a) => a);
  const sources =
    (formData.get("s") as string)?.split(",")?.filter((a) => a) || [];
  const lengthRangeParam = formData.get("l") as string;
  const courseId = (formData.get("courseId") as string) || "kj";

  const seenTexts = JSON.parse(seenTextsParam) as string[][];

  const invalidParams = [];
  if (typeof seenCharactersParam !== "string") invalidParams.push("seenChars");
  const seenTextsIds = seenTexts.flatMap((keys) =>
    keys.map((k) => hashString(k)),
  );
  if (seenTextsIds.some(Number.isNaN)) invalidParams.push("seenTexts");
  const lengthRange = lengthRangeParam?.split("-").map(Number) as [
    number,
    number,
  ];
  if (!lengthRange?.every((n) => !Number.isNaN(n)))
    invalidParams.push("length");
  if (invalidParams.length)
    throw new Error("Invalid params: " + invalidParams.join(", "));

  const updatedCourse = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      seenTexts,
      wantedCharacters: wantedCharacters || "",
      minLength: lengthRange[0],
      maxLength: lengthRange[1],
      authors: authors || [],
      sources: sources || [],
      normalizedTextSearchQuery: normalizedTextSearchQuery || "",
    },
  });
  console.log(`Updated course ${courseId}`);
  console.log({
    updated: {
      wantedCharacters: updatedCourse.wantedCharacters,
      minLength: updatedCourse.minLength,
      maxLength: updatedCourse.maxLength,
    },
  });

  return {
    courseId,
  };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const courseId = params.courseId!;

  const queryStringParams = new URL(request.url).searchParams;
  const page = queryStringParams.get("p")
    ? parseInt(queryStringParams.get("p")!)
    : 1;

  writeFileSync(
    process.cwd() + "/curatorCoursesArchive.json",
    JSON.stringify(
      (await prisma.course.findMany()).map((c) => ({
        id: c.id,
        seenTexts: c.seenTexts,
      })),
    ),
  );
  console.log(process.cwd() + "/curatorCoursesArchive.json");
  const {
    course,
    seenTexts,
    seenCharacters,
    seenFigures,
    defaultTangReadings,
    remainingKanjisenseCharacters,
    remainingMeaningfulComponents,
    allFiguresKeys,
    unseenTexts,
    textGroups,
    textGroupsCount,
  } = await getCurationState(courseId, page);

  return {
    course,
    page,
    seenTexts,
    seenCharacters,
    seenFigures,
    defaultTangReadings,
    remainingKanjisenseCharacters,
    remainingMeaningfulComponents,

    allFiguresKeys,

    unseenTexts,
    textGroups,
    count: textGroupsCount,

    priorityFiguresIds: await prisma.kanjisenseFigure
      .findMany({
        select: {
          key: true,
        },
        where: {
          version: FIGURES_VERSION,
          isPriority: true,
        },
      })
      .then((figures) => figures.map((f) => f.key)),
  };
};

export default function CuratePage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();

  const {
    course,
    defaultTangReadings,
    remainingKanjisenseCharacters,
    remainingMeaningfulComponents,
    allFiguresKeys,
    seenTexts,
    seenCharacters,
    seenFigures,
    unseenTexts,
    priorityFiguresIds,
  } = loaderData;
  const allFiguresKeysSet = useMemo(
    () => new Set(allFiguresKeys),
    [allFiguresKeys],
  );

  const seenFiguresMap = useMemo(
    () => new Map(seenFigures.map((c) => [c.key, c])),
    [seenFigures],
  );
  const remainingComponentsMap = useMemo(
    () => new Map(remainingMeaningfulComponents.map((c) => [c.key, c])),
    [remainingMeaningfulComponents],
  );
  const remainingKanjisenseCharactersMap = useMemo(
    () =>
      new Map<string, KanjisenseFigure>(
        remainingKanjisenseCharacters.map((c) => [c.key, c]),
      ),
    [remainingKanjisenseCharacters],
  );

  const {
    seenTextsFlat,
    seenTextsState,
    addToSeenTexts,
    removeFromSeenTexts,
    moveWithinSeenTexts,
    runningSeenCharacters,
    componentsToFirstSighting,
    handleSubmit,
    setFilterState,
    filterState,

    setTextGroupDescription,
    insertTextGroup,
    removeTextGroup,
    moveTextGroup,
    moveTextGroupTo,
  } = useSeenTextsState(course, seenTexts, seenCharacters, unseenTexts);

  const [mouseovered, setMouseovered] = useState<Set<number>>(new Set());
  function getOnMouseoverText(id: number) {
    return () => {
      console.log("mouseover", id);
      setMouseovered((s) => new Set(s).add(id));
    };
  }

  const wantedCharactersSet = useMemo(
    () => new Set(filterState.wantedCharacters),
    [filterState.wantedCharacters],
  );
  const seenCharactersSet = useMemo(
    () => new Set(seenCharacters.map((c) => c.key)),
    [seenCharacters],
  );
  const priorityCharactersSet = useMemo(
    () => new Set(priorityFiguresIds),
    [priorityFiguresIds],
  );

  const seenMeaningfulFigures = seenFigures.filter((char) => {
    const figure = char;
    return figure.isPriority;
  });
  const seenMeaningfulAtomicComponents =
    seenMeaningfulFigures.filter(isFigureAtomic);
  const nonAtomicCharactersSeenOnlyAsComponents = new Set(
    remainingKanjisenseCharacters.flatMap((c) => {
      return seenMeaningfulFigures
        .filter((sc) => sc.key === c.key && !isFigureAtomic(sc))
        .map((sc) => sc.key);
    }),
  );
  const atomicCharactersSeenOnlyAsComponents = new Set(
    remainingKanjisenseCharacters.flatMap((c) => {
      return seenMeaningfulAtomicComponents
        .filter((sc) => sc.key === c.key)
        .map((sc) => sc.key);
    }),
  );

  return (
    <div className="flex h-[100vh] flex-row flex-nowrap">
      <section className="flex flex-col flex-nowrap overflow-auto [flex:1_1_50%]">
        {actionData?.courseId ? (
          <h2>Updated course {actionData.courseId}</h2>
        ) : null}
        <h2>{seenTextsFlat.length} seen texts</h2>
        <div>
          {
            seenTextsState.reduce(
              (acc, group, groupIndex) => {
                let groupNewComponentsCount = 0;
                const firstTextKey = group.texts[0];
                const seenCharactersSoFar = firstTextKey
                  ? runningSeenCharacters[firstTextKey]
                  : null;
                const groupNewCharacters = new Set<string>();
                if (seenCharactersSoFar)
                  group.texts.forEach((textKey, textIndex) => {
                    const seenText = seenTextsFlat.find(
                      (t) => t.key === textKey,
                    );
                    for (const seenTextCharacter of seenText?.uniqueCharacters ||
                      []) {
                      if (
                        !seenCharactersSoFar.has(seenTextCharacter.character)
                      ) {
                        groupNewCharacters.add(seenTextCharacter.character);
                      }
                    }

                    for (const component of seenText?.uniqueComponents || []) {
                      const componentFirstSighting =
                        componentsToFirstSighting.get(component.figureKey);
                      if (
                        componentFirstSighting &&
                        componentFirstSighting.textGroupIndex === groupIndex &&
                        componentFirstSighting.textIndex === textIndex
                      ) {
                        groupNewComponentsCount++;
                      }
                    }
                  });

                acc.nodes.push(
                  <section key={groupIndex}>
                    <h2 className="mb-4 mt-16 text-center">
                      group {groupIndex + 1}
                      <button
                        className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                        onClick={() => insertTextGroup(groupIndex)}
                      >
                        前加
                      </button>
                      {!group.texts.length ? (
                        <button
                          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                          onClick={removeTextGroup(groupIndex)}
                        >
                          消
                        </button>
                      ) : null}
                      {groupIndex !== 0 ? (
                        <button
                          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                          onClick={() =>
                            moveTextGroupTo(groupIndex, groupIndex - 1)
                          }
                        >
                          前移
                        </button>
                      ) : null}
                      <button
                        className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                        onClick={() => moveTextGroup(groupIndex)}
                      >
                        移
                      </button>
                      {groupIndex !== seenTextsState.length - 1 ? (
                        <button
                          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                          onClick={() =>
                            moveTextGroupTo(groupIndex, groupIndex + 1)
                          }
                        >
                          後移
                        </button>
                      ) : null}
                      <button
                        className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
                        onClick={() => insertTextGroup(groupIndex + 1)}
                      >
                        後加
                      </button>
                      <br />
                      {group.texts.length} texts
                      <br />
                      {groupNewCharacters.size} new characters (+{" "}
                      {runningSeenCharacters[firstTextKey]?.size} so far),{" "}
                      {groupNewComponentsCount} new components
                    </h2>
                    <div className="mb-4">
                      <TextGroupDescriptionInput
                        groupIndex={groupIndex}
                        description={group.description}
                        setTextGroupDescription={setTextGroupDescription}
                      />
                    </div>
                    <div>
                      {group.texts.map((textKey, seenTextIndex) => {
                        acc.runningTotalTexts++;

                        const seenText =
                          seenTextsFlat.find((t) => t.key === textKey) ||
                          loaderData?.unseenTexts.find(
                            (t) => t.key === textKey,
                          );
                        if (!seenText) return null;

                        const runningTotalTexts = acc.runningTotalTexts;

                        const tg = loaderData.textGroups.find(
                          (tg) => tg.baseCorpusTextId === seenText.id,
                        );

                        return (
                          <CuratorSeenTextDisplay
                            key={String(textKey) + seenTextIndex}
                            seenText={seenText}
                            groupIndex={groupIndex}
                            seenTextIndex={seenTextIndex}
                            seenFiguresMap={seenFiguresMap}
                            runningSeenCharacters={runningSeenCharacters}
                            componentsToFirstSighting={
                              componentsToFirstSighting
                            }
                            removeFromSeenTexts={removeFromSeenTexts}
                            moveWithinSeenTexts={moveWithinSeenTexts}
                            wantedCharactersSet={wantedCharactersSet}
                            priorityCharactersSet={priorityCharactersSet}
                            defaultTangReadings={defaultTangReadings}
                            textKey={textKey}
                            textGroup={tg}
                            runningTotalTexts={runningTotalTexts}
                          />
                        );
                      })}
                    </div>
                    <hr
                      className="m-2 h-[3px] bg-slate-400 font-black"
                      key=""
                    />
                  </section>,
                );
                return acc;
              },
              {
                nodes: [] as ReactNode[],
                runningTotalTexts: 0,
                runningTotalCharactersEncountered: 0,
                runningTotalComponentsEncountered: 0,
              },
            ).nodes
          }
        </div>
      </section>
      <section className="overflow-auto [flex:1_1_50%]">
        <Form
          filterState={filterState}
          setFilterState={setFilterState}
          handleSubmit={handleSubmit}
        />

        {loaderData ? (
          <CharactersProgress
            seenChars={seenCharacters}
            seenFigures={seenFigures}
            allFiguresKeysSet={allFiguresKeysSet}
            seenMeaningfulFigures={seenMeaningfulFigures}
            seenMeaningfulAtomicComponents={seenMeaningfulAtomicComponents}
            nonAtomicCharactersSeenOnlyAsComponents={
              nonAtomicCharactersSeenOnlyAsComponents
            }
            atomicCharactersSeenOnlyAsComponents={
              atomicCharactersSeenOnlyAsComponents
            }
            remainingKanjisenseCharacters={remainingKanjisenseCharacters}
            remainingMeaningfulComponents={remainingMeaningfulComponents}
            getOnClickFigure={(key) => () => {
              console.log("clicked figure");
              window.open(`/dict/${key}`, "_blank");
            }}
          />
        ) : null}
      </section>
      <section className="overflow-auto [flex:1_1_50%]">
        <section>{loaderData?.count} texts total</section>
        {loaderData.count > loaderData.unseenTexts.length ? (
          <div>
            page {loaderData.page} of {Math.ceil(loaderData.count / 500)}:{" "}
            {Array.from(
              Array(Math.ceil(loaderData.count / 500)).keys(),
              (i) => (
                <Fragment key={i}>
                  <a key={i} className="underline" href={`?p=${i + 1}`}>
                    {i + 1}
                  </a>{" "}
                </Fragment>
              ),
            )}
          </div>
        ) : null}
        <div className=" whitespace-pre-wrap">
          {loaderData?.unseenTexts.length}
          <br />
          {loaderData?.textGroups.map((tg, tgi) => {
            const ti = loaderData.unseenTexts.findIndex(
              (t) => t.id === tg.baseCorpusTextId,
            )!;
            const unseenText = loaderData.unseenTexts[ti];
            return (
              <UnseenTextDisplay
                key={unseenText.id}
                unseenText={unseenText}
                getOnMouseoverText={getOnMouseoverText}
                textGroupIndex={tgi}
                textGroup={tg}
                addToSeenTexts={addToSeenTexts}
                mouseovered={mouseovered}
                wantedCharactersSet={wantedCharactersSet}
                seenCharactersSet={seenCharactersSet}
                priorityCharactersSet={priorityCharactersSet}
                remainingComponentsMap={remainingComponentsMap}
                atomicCharactersSeenOnlyAsComponents={
                  atomicCharactersSeenOnlyAsComponents
                }
                nonAtomicCharactersSeenOnlyAsComponents={
                  nonAtomicCharactersSeenOnlyAsComponents
                }
                remainingKanjisenseCharactersMap={
                  remainingKanjisenseCharactersMap
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function UnseenTextDisplay({
  unseenText,
  getOnMouseoverText,
  textGroupIndex: tgi,
  textGroup: tg,
  addToSeenTexts,
  mouseovered,
  wantedCharactersSet,
  seenCharactersSet,
  priorityCharactersSet,
  remainingComponentsMap,
  atomicCharactersSeenOnlyAsComponents,
  nonAtomicCharactersSeenOnlyAsComponents,
  remainingKanjisenseCharactersMap,
}: {
  unseenText: {
    uniqueCharacters: {
      character: string;
      baseCorpusTextId: number;
      frequencyScore: number;
      baseCorpusTextLength: number;
      baseCorpusUniqueCharactersCount: number;
      baseCorpusUniqueComponentsCount: number;
      baseCorpusTextNonPriorityCharactersCount: number;
    }[];
    uniqueComponents: {
      figureKey: string;
      baseCorpusTextId: number;
      frequencyScore: number;
      baseCorpusTextLength: number;
      baseCorpusUniqueCharactersCount: number;
      baseCorpusUniqueComponentsCount: number;
    }[];
  } & {
    id: number;
    course: string;
    key: string;
    title: string | null;
    author: string | null;
    source: string;
    section: string | null;
    dynasty: string | null;
    urls: string[];
    text: string;
    normalizedText: string;
    normalizedLength: number;
    nonPriorityCharactersCount: number;
  };
  getOnMouseoverText: (id: number) => () => void;
  textGroupIndex: number;
  textGroup: CurationStateTextGroup;
  addToSeenTexts: ({
    textKey,
    defaultGroupNumber,
  }: {
    textKey: string;
    defaultGroupNumber?: number;
  }) => void;
  mouseovered: Set<number>;
  wantedCharactersSet: Set<string>;
  seenCharactersSet: Set<string>;
  priorityCharactersSet: Set<string>;
  remainingComponentsMap: Map<string, BadgePropsFigure>;
  atomicCharactersSeenOnlyAsComponents: Set<string>;
  nonAtomicCharactersSeenOnlyAsComponents: Set<string>;
  remainingKanjisenseCharactersMap: Map<string, KanjisenseFigure>;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <section className="mb-4" onMouseOver={getOnMouseoverText(unseenText.id)}>
      <h3 className="text-center">
        #{tgi + 1} unique chars ={" "}
        <b className=" rounded-md border-2 border-solid border-blue-200 p-1 ">
          {tg.baseCorpusUniqueCharactersCount}
        </b>{" "}
        components ={" "}
        <b className=" rounded-md border-2 border-solid border-blue-200 p-1 ">
          {tg.baseCorpusUniqueComponentsCount}
        </b>{" "}
        <br />
        non-priority chars ={" "}
        <b className=" rounded-md border-2 border-solid border-blue-200 p-1 ">
          {tg.baseCorpusTextNonPriorityCharactersCount}
        </b>{" "}
        <br />
        length = {tg.baseCorpusTextLength}; score ={" "}
        {tg._sum?.frequencyScore?.toLocaleString("en-US")}
      </h3>
      <h3>
        {unseenText.author} - {unseenText.title} ({unseenText.source})
        <br />
        {unseenText.urls.map((url, i) => (
          <a
            href={url}
            key={url}
            target="_blank"
            className="underline"
            rel="noreferrer"
            title={url}
          >
            [{i + 1}]
          </a>
        ))}
      </h3>
      <p className="">{unseenText.text}</p>
      <div className="text-right">
        <CopyYmlButton text={unseenText} />
        <button
          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
          onClick={() => addToSeenTexts({ textKey: unseenText.key })}
        >
          add
        </button>
      </div>
      {mouseovered.has(unseenText.id) ? (
        <UnseenTextNewFiguresDisplay
          {...{
            unseenText,
            wantedCharactersSet,
            seenCharactersSet,
            priorityCharactersSet,
            remainingComponentsMap,
            atomicCharactersSeenOnlyAsComponents,
            nonAtomicCharactersSeenOnlyAsComponents,
            remainingKanjisenseCharactersMap,
          }}
        />
      ) : (
        <p>{unseenText.normalizedText}</p>
      )}
    </section>
  );
}

function UnseenTextNewFiguresDisplay({
  unseenText,
  wantedCharactersSet,
  seenCharactersSet,
  priorityCharactersSet,
  remainingComponentsMap,
  atomicCharactersSeenOnlyAsComponents,
  nonAtomicCharactersSeenOnlyAsComponents,
  remainingKanjisenseCharactersMap,
}: {
  unseenText: CurationState["unseenTexts"][number];
  wantedCharactersSet: Set<string>;
  seenCharactersSet: Set<string>;
  priorityCharactersSet: Set<string>;
  remainingComponentsMap: Map<string, BadgePropsFigure>;
  atomicCharactersSeenOnlyAsComponents: Set<string>;
  nonAtomicCharactersSeenOnlyAsComponents: Set<string>;
  remainingKanjisenseCharactersMap: Map<string, KanjisenseFigure>;
}) {
  const textNewFigures = useTextNewFigures({
    text: unseenText,
    getFigure: (key) => remainingComponentsMap.get(key) || null,
    newAtomicCharactersSeenOnlyAsComponents: new Set(
      unseenText.uniqueCharacters.flatMap(({ character }) =>
        atomicCharactersSeenOnlyAsComponents.has(character) ? [character] : [],
      ),
    ),
    newNonAtomicCharactersSeenOnlyAsComponents: new Set(
      unseenText.uniqueCharacters.flatMap(({ character }) =>
        nonAtomicCharactersSeenOnlyAsComponents.has(character) &&
        remainingKanjisenseCharactersMap.get(character)
          ? [character]
          : [],
      ),
    ),
  });
  return (
    <div>
      <ColoredCharactersByInterest
        normalizedText={unseenText.normalizedText}
        wantedCharacters={wantedCharactersSet}
        seenCharacters={seenCharactersSet}
        priorityFiguresIds={priorityCharactersSet}
      />
      <div className="m-2">
        <TextUniqueComponents {...textNewFigures} />
      </div>
    </div>
  );
}

function Form({
  filterState,
  setFilterState,
  handleSubmit,
}: {
  filterState: ReturnType<typeof useSeenTextsState>["filterState"];
  setFilterState: ReturnType<typeof useSeenTextsState>["setFilterState"];
  handleSubmit: () => void;
}) {
  const [localFilterState, setLocalFilterState] = useState(filterState);

  useEffect(() => {
    setLocalFilterState(filterState);
  }, [filterState]);

  // call setFilterState with localFilterState after 400ms of no changes
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setFilterState(localFilterState);
    }, 400);
  }, [localFilterState, setFilterState]);

  return (
    <div>
      <input
        placeholder="filter by characters"
        className="border border-gray-400"
        type="text"
        value={localFilterState.wantedCharacters}
        onChange={(e) =>
          setLocalFilterState((s) => ({
            ...s,
            wantedCharacters: [...new Set(e.target.value)].join(""),
          }))
        }
      />
      <br />
      <label htmlFor="text-length">text length: </label>
      <input
        id="text-length"
        type="number"
        className=" w-16 border border-gray-400"
        value={localFilterState.lengthRange[0]}
        onChange={(e) => {
          const number = parseInt(e.target.value);
          if (
            !Number.isNaN(number) &&
            number <= localFilterState.lengthRange[1] &&
            number >= 0
          ) {
            setLocalFilterState((s) => ({
              ...s,
              lengthRange: [number, s.lengthRange[1]],
            }));
          }
        }}
      />
      <input
        type="number"
        className=" w-16 border border-gray-400"
        value={localFilterState.lengthRange[1]}
        onChange={(e) => {
          const number = parseInt(e.target.value);
          if (
            !Number.isNaN(number) &&
            number >= localFilterState.lengthRange[0]
          ) {
            setLocalFilterState((s) => ({
              ...s,
              lengthRange: [s.lengthRange[0], number],
            }));
          }
        }}
      />
      <br />
      <input
        type="text"
        placeholder="filter by authors"
        value={localFilterState.authors.join(",")}
        onChange={(e) => {
          setLocalFilterState((s) => ({
            ...s,
            authors: e.target.value.split(","),
          }));
        }}
      />
      <br />
      <input
        type="text"
        placeholder="filter by sources"
        value={localFilterState.sources.join(",")}
        onChange={(e) => {
          setLocalFilterState((s) => ({
            ...s,
            sources: e.target.value.split(","),
          }));
        }}
      />
      <br />
      <input
        type="text"
        placeholder="search normalized text"
        value={localFilterState.normalizedTextSearchQuery}
        onChange={(e) => {
          setLocalFilterState((s) => ({
            ...s,
            normalizedTextSearchQuery: e.target.value,
          }));
        }}
      />
      <br />
      <button onClick={() => handleSubmit()}>submit and save seen texts</button>
    </div>
  );
}

function ColoredCharactersByInterest({
  normalizedText,
  // textUniqueCharacters,
  wantedCharacters,
  seenCharacters,
  priorityFiguresIds,
  defaultTangReadings,
}: {
  // textUniqueCharacters: { figureId: string | null }[];
  normalizedText: string;
  wantedCharacters: Set<string>;
  seenCharacters: Set<string>;
  priorityFiguresIds: Set<string>;
  defaultTangReadings?: string;
}) {
  const tangReadingsArray = defaultTangReadings?.split(" ");
  let factor: number | null = null;
  if (normalizedText.length % 5 === 0) factor = 5;
  else if (normalizedText.length % 7 === 0) factor = 7;

  return (
    <div className="whitespace-pre-wrap">
      {Array.from(normalizedText, (figureId, i) => {
        let className = "";
        if (wantedCharacters.has(figureId) && seenCharacters.has(figureId))
          className = "bg-[#bbffff] ";
        else if (wantedCharacters.has(figureId)) className = "bg-[#00ffff] ";
        else if (seenCharacters.has(figureId)) className = "text-gray-300 ";
        else if (!priorityFiguresIds.has(figureId))
          className = "text-amber-700/60 ";
        else className = "text-black ";
        let punctuation = "";
        if (factor && (i + 1) % (factor * 2) === 0) {
          punctuation = "。";
          if (factor && (i + 1) % (factor * 4) === 0) punctuation += "\n";
        } else if (factor && (i + 1) % factor === 0) {
          punctuation = "，";
        }
        if (tangReadingsArray) {
          return (
            <div key={i} className={`inline-block text-xl`}>
              <div className="text-xs">
                {tangReadingsArray[i]?.replaceAll("/", "\n")}{" "}
              </div>
              <span className={`${className}`}>{figureId}</span>
              {punctuation}
            </div>
          );
        }

        if (className || punctuation) {
          return (
            <span key={i} className={`${className}`}>
              {figureId}
              {punctuation}
            </span>
          );
        }

        return figureId;
      })}
    </div>
  );
}

function useTextNewFigures({
  text,
  getFigure,
  newAtomicCharactersSeenOnlyAsComponents,
  newNonAtomicCharactersSeenOnlyAsComponents,
}: {
  text: (
    | CurationState["unseenTexts"]
    | CurationState["seenTexts"][number]
  )[number];
  getFigure: (figureId: string) => BadgePropsFigure | null;
  newAtomicCharactersSeenOnlyAsComponents: Set<string>;
  newNonAtomicCharactersSeenOnlyAsComponents: Set<string>;
}) {
  const newAtomic: React.ReactNode[] = [];
  const newNonAtomic: React.ReactNode[] = [];

  text.uniqueComponents.forEach((c) => {
    const figure = getFigure(c.figureKey);
    const badgeProps = figure && getBadgeProps(figure);
    const newNode = !badgeProps ? null : (
      <div key={c.figureKey} className="inline-block align-middle">
        <FigureBadgeLink
          width={3}
          figureKey={c.figureKey}
          newWindow
          badgeProps={
            figure.key.length === 1
              ? {
                  ...badgeProps,
                  image: undefined,
                }
              : badgeProps
          }
        />
      </div>
    );

    if (figure && newNode) {
      const isAtomic = isAtomicFigure(figure);
      if (isAtomic) {
        newAtomic.push(newNode);
      } else {
        newNonAtomic.push(newNode);
      }
    }
  });

  return {
    newAtomic,
    newNonAtomic,
    newAtomicCharactersSeenOnlyAsComponents,
    newNonAtomicCharactersSeenOnlyAsComponents,
  };
}

function TextUniqueComponents(
  textNewFigures: ReturnType<typeof useTextNewFigures>,
) {
  const {
    newAtomic,
    newNonAtomic,
    newAtomicCharactersSeenOnlyAsComponents,
    newNonAtomicCharactersSeenOnlyAsComponents,
  } = textNewFigures;

  return (
    <>
      {newAtomic.length ? (
        <>
          {newAtomic.length} atomic: {newAtomic}
        </>
      ) : (
        <>no new atomic figures</>
      )}
      <br />
      {newAtomicCharactersSeenOnlyAsComponents.size ? (
        <>
          <br />
          {newAtomicCharactersSeenOnlyAsComponents.size} atomic newly seen as
          character: {Array.from(newAtomicCharactersSeenOnlyAsComponents)}
        </>
      ) : null}
      <br />
      {newNonAtomic.length ? (
        <>
          {newNonAtomic.length} compound: {newNonAtomic}
        </>
      ) : (
        <>no new non-atomic figures</>
      )}
      {newNonAtomicCharactersSeenOnlyAsComponents.size ? (
        <>
          <br />
          {newNonAtomicCharactersSeenOnlyAsComponents.size} compound newly seen
          as character: {Array.from(newNonAtomicCharactersSeenOnlyAsComponents)}
        </>
      ) : null}
    </>
  );
}

function hashString(string: string) {
  let hash = 0,
    i,
    chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function CopyYmlButton({
  text,
  defaultTangReadings,
}: {
  text: BaseCorpusText & {
    uniqueCharacters: { character: string | null }[];
  };
  defaultTangReadings?: string;
}) {
  const { author, title, source } = text;
  return (
    <button
      className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(
          Object.entries({
            author,
            title,
            source,
            jp: text.normalizedText,
            ...(defaultTangReadings
              ? {
                  tang: JSON.stringify(defaultTangReadings),
                }
              : {}),
          })
            .map(([x, y]) => `      ${x}: ${y}\n`)
            .join(""),
        );
      }}
    >
      copy yml
    </button>
  );
}

type SeenTextsState = {
  texts: TextId[];
  description: string;
}[];

type TextId = string;

const useSeenTextsState = (
  course: CurationState["course"],
  seenTexts: CurationState["seenTexts"],
  seenCharacters: CurationState["seenCharacters"],
  unseenTexts: CurationState["unseenTexts"],
) => {
  const seenTextsFlat = useMemo(() => seenTexts.flat() || [], [seenTexts]);

  const [seenTextsState, setSeenTextsState] = useState<SeenTextsState>(() =>
    ((course?.seenTexts || []) as string[][]).map((texts) => ({
      texts,
      description: "",
    })),
  );

  const storageKey = useRef<string | null>(null);
  useEffect(() => {
    const newStorageKey = `seenTextsGroupsDescriptions-${course.id}`;
    if (storageKey.current !== newStorageKey) {
      storageKey.current = newStorageKey;
      const descriptionsFromLocalStorage: string[] = localStorage.getItem(
        newStorageKey,
      )
        ? JSON.parse(localStorage.getItem(newStorageKey)!)
        : [];
      setSeenTextsState(
        seenTextsState.map((group, i) => ({
          ...group,
          description: descriptionsFromLocalStorage[i] || "",
        })),
      );
    } else {
      localStorage.setItem(
        newStorageKey,
        JSON.stringify(seenTextsState.map((g) => g.description)),
      );
    }
  }, [course.id, seenTextsState, storageKey]);

  useEffect(() => {
    console.log("summary!!");
    const storageKey = `seenTextsGroupsDescriptions-${course.id}`;
    const descriptionsFromLocalStorage: string[] = localStorage.getItem(
      storageKey,
    )
      ? JSON.parse(localStorage.getItem(storageKey)!)
      : [];
    Object.assign(
      window as unknown as {
        summary: {
          groupNumber: number;
          description: string;
          texts: string[];
        }[];
        getPrettySummary: () => string;
      },
      {
        summary: seenTextsState.map((group, i) => ({
          groupNumber: i + 1,
          description: descriptionsFromLocalStorage[i] || "",
          texts: group.texts,
        })),
        getPrettySummary: () =>
          seenTexts
            .flatMap((group, i) => {
              const description = descriptionsFromLocalStorage[i] || "";
              return [
                `## ${description}`,
                "",
                ...group.map((text) => {
                  return [
                    `### (${text.author} - ${text.title} (${text.source}))`,
                    // "",
                    // text.normalizedText,
                    "",
                    text.text,
                    "",
                    "",
                  ].join("\n");
                }),
              ];
            })
            .join("\n"),
      },
    );
  }, [seenTexts, seenTextsState, course.id]);

  const addToSeenTexts = ({
    textKey,
    defaultGroupNumber,
  }: {
    textKey: string;
    defaultGroupNumber?: number;
  }) => {
    const existingGroupIndex = seenTextsState.findIndex((group) =>
      group.texts.includes(textKey),
    );
    if (existingGroupIndex !== -1) {
      alert(`Text already in group ${existingGroupIndex + 1}`);
      return;
    }
    const groupNumberInput = prompt(
      "Which group to add text to?",
      String(
        defaultGroupNumber ??
          1 + (seenTextsState.length ? seenTextsState.length - 1 : 0),
      ),
    );
    const groupNumber = groupNumberInput ? parseInt(groupNumberInput) : NaN;
    if (!Number.isNaN(groupNumber)) {
      const groupIndex = groupNumber - 1;
      const newSeenTexts = [
        ...seenTextsState.slice(0, groupIndex),
        seenTextsState[groupIndex]
          ? {
              ...seenTextsState[groupIndex],
              texts: [...seenTextsState[groupIndex].texts, textKey],
            }
          : { texts: [textKey], description: "" },
        ...seenTextsState.slice(groupIndex + 1),
      ];
      setSeenTextsState(newSeenTexts);
    }
  };

  const removeFromSeenTexts = (textKey: string) => {
    const newSeenTexts = seenTextsState.map((group) => ({
      ...group,
      texts: group.texts.filter((t) => t !== textKey),
    }));
    setSeenTextsState(newSeenTexts);
  };
  const moveWithinSeenTexts = (
    textKey: string,
    defaultGroupNumber?: number,
  ) => {
    const groupNumberInput = prompt(
      "Which group to move text to?",
      String(
        defaultGroupNumber ??
          1 + (seenTextsState.length ? seenTextsState.length - 1 : 0),
      ),
    );
    const newGroupNumber = groupNumberInput
      ? Math.min(parseInt(groupNumberInput), seenTextsState.length)
      : NaN;
    if (!Number.isNaN(newGroupNumber)) {
      const newGroupIndex = newGroupNumber - 1;
      const newSeenTexts = seenTextsState.map((group) => ({
        ...group,
        texts: group.texts.filter((t) => t !== textKey),
      }));
      newSeenTexts[newGroupIndex] = {
        ...newSeenTexts[newGroupIndex],
        texts: [...(newSeenTexts[newGroupIndex]?.texts || []), textKey],
      };
      setSeenTextsState(newSeenTexts);
    }
  };

  const runningSeenCharacters = useMemo<Record<string, Set<string>>>(() => {
    let runningTotal = new Set<string>();
    return Object.fromEntries(
      seenTextsState.flatMap((g) => {
        return g.texts.map((t) => {
          const text =
            seenTextsFlat.find((t2) => t2.key === t) ||
            unseenTexts.find((t2) => t2.key === t);

          const oldSeenChars = new Set(runningTotal);
          if (!text) return [t, oldSeenChars];
          runningTotal = new Set([
            ...runningTotal,
            ...text.uniqueCharacters.flatMap((c) => c.character || []),
          ]);
          return [t, oldSeenChars];
        });
      }),
    );
  }, [seenTextsState, seenTextsFlat, unseenTexts]);

  const componentsToFirstSighting = useMemo<
    Map<
      string,
      {
        textGroupIndex: number;
        textIndex: number;
        textKey: string;
      }
    >
  >(() => {
    const seenSoFar = new Set<string>();
    const map = new Map<
      string,
      { textGroupIndex: number; textIndex: number; textKey: string }
    >();

    seenTextsState.forEach(({ texts }, textGroupIndex) => {
      texts.forEach((textKey, textIndex) => {
        const text = seenTextsFlat.find((t) => t.key === textKey);
        if (!text) return;
        text.uniqueCharacters.forEach((c) => {
          if (!c.character) return;
          if (seenSoFar.has(c.character)) return;
          seenSoFar.add(c.character);
          map.set(c.character, { textGroupIndex, textIndex, textKey });
        });
        text.uniqueComponents.forEach((c) => {
          if (seenSoFar.has(c.figureKey)) return;
          seenSoFar.add(c.figureKey);
          map.set(c.figureKey, { textGroupIndex, textIndex, textKey });
        });
      });
    });
    return map;
  }, [seenTextsState, seenTextsFlat]);

  const [filterState, setFilterState] = useState({
    authors: course.authors || [],
    sources: course.sources || [],
    wantedCharacters: course.wantedCharacters || "",
    normalizedTextSearchQuery: course.normalizedTextSearchQuery || "",
    lengthRange: [course.minLength ?? 0, course.maxLength ?? 1000],
  });

  const submit = useSubmit();

  function handleSubmit() {
    const formData = new FormData();
    formData.append(
      "sc",
      seenCharacters.length ? seenCharacters.map((c) => c.key).join("") : "",
    );
    formData.append("wc", filterState.wantedCharacters);

    formData.append("a", filterState.authors.filter((a) => a.trim()).join(","));
    formData.append("s", filterState.sources.filter((s) => s.trim()).join(","));

    formData.append("ntsq", filterState.normalizedTextSearchQuery);

    formData.append("l", filterState.lengthRange.join("-"));
    formData.append("courseId", course.id);

    formData.append(
      "st",
      // JSON.stringify(seenTextsState.map(({ texts }) => texts))
      JSON.stringify(seenTextsState.map(({ texts }) => texts) || []),
    );

    submit(formData, { method: "post", action: `/curate/${course.id}` });
  }

  const setTextGroupDescription = (groupIndex: number, description: string) => {
    const newSeenTextsState = [...seenTextsState];
    newSeenTextsState[groupIndex] = {
      ...newSeenTextsState[groupIndex],
      description,
    };
    setSeenTextsState(newSeenTextsState);
  };

  const insertTextGroup = (newGroupIndex: number) => {
    const newSeenTextsState = [...seenTextsState];
    newSeenTextsState.splice(newGroupIndex, 0, {
      texts: [],
      description: "",
    });
    setSeenTextsState(newSeenTextsState);
  };
  const removeTextGroup = (groupIndex: number) => () => {
    const newSeenTextsState = [...seenTextsState];
    newSeenTextsState.splice(groupIndex, 1);
    setSeenTextsState(newSeenTextsState);
  };
  const moveTextGroup = (groupIndex: number) => {
    const newGroupNumberString = prompt(
      "Which position to move text group to?",
      String(groupIndex + 1),
    );
    const newGroupNumber = newGroupNumberString
      ? parseInt(newGroupNumberString)
      : null;

    if (newGroupNumber != null && !Number.isNaN(newGroupNumber)) {
      const newGroupIndex = newGroupNumber - 1;
      const group = seenTextsState[groupIndex];
      const newSeenTextsState = [...seenTextsState];
      newSeenTextsState.splice(groupIndex, 1);
      newSeenTextsState.splice(newGroupIndex, 0, group);

      setSeenTextsState(newSeenTextsState);
      console.log(newSeenTextsState);
    } else if (newGroupNumberString != null) {
      alert("Invalid group number");
    }
  };
  const moveTextGroupTo = (groupIndex: number, newGroupIndex: number) => {
    const group = seenTextsState[groupIndex];
    const newSeenTextsState = [...seenTextsState];
    newSeenTextsState.splice(groupIndex, 1);
    newSeenTextsState.splice(newGroupIndex, 0, group);

    setSeenTextsState(newSeenTextsState);
    console.log(newSeenTextsState);
  };

  return {
    seenTextsFlat,
    seenTextsState,
    addToSeenTexts,
    removeFromSeenTexts,
    moveWithinSeenTexts,
    runningSeenCharacters,
    componentsToFirstSighting,
    handleSubmit,
    setFilterState,
    filterState,
    setTextGroupDescription,
    insertTextGroup,
    removeTextGroup,
    moveTextGroup,
    moveTextGroupTo,
  };
};

function TextGroupDescriptionInput({
  groupIndex,
  setTextGroupDescription,
  description,
}: {
  groupIndex: number;
  setTextGroupDescription: (groupIndex: number, description: string) => void;
  description: string;
}) {
  const [value, setValue] = useState(description);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue(description);
  }, [description]);
  return (
    <div className="flex p-1">
      <input
        ref={ref}
        type="text"
        placeholder="group description"
        value={value}
        className={`flex-1 p-1 text-center text-lg [font-variant:small-caps] ${
          value !== description ? "bg-red-50" : ""
        }`}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <button
        onClick={() => {
          setTextGroupDescription(groupIndex, value);
          ref.current?.blur();
        }}
        disabled={value === description}
        className={`border border-slate-300 bg-slate-100 p-1 text-xs ${
          value === description ? "opacity-50" : ""
        }`}
      >
        save
      </button>
    </div>
  );
}

function isFigureAtomic(
  figure: Pick<KanjisenseFigure, "componentsTree">,
): boolean {
  return Array.isArray(figure.componentsTree)
    ? figure.componentsTree.length === 0
    : false;
}

function CuratorSeenTextDisplay({
  seenText,
  groupIndex,
  seenTextIndex,
  seenFiguresMap,
  runningSeenCharacters,
  componentsToFirstSighting,
  removeFromSeenTexts,
  moveWithinSeenTexts,
  wantedCharactersSet,
  priorityCharactersSet,
  defaultTangReadings,
  textKey,
  textGroup: tg,
  runningTotalTexts,
}: {
  seenText: CurationState["seenTexts"][number][number];
  groupIndex: number;
  seenTextIndex: number;
  seenFiguresMap: Map<string, BadgePropsFigure>;
  runningSeenCharacters: Record<string, Set<string>>;
  componentsToFirstSighting: Map<
    string,
    {
      textGroupIndex: number;
      textIndex: number;
      textKey: string;
    }
  >;
  removeFromSeenTexts: (textKey: string) => void;
  moveWithinSeenTexts: (textKey: string, defaultGroupNumber?: number) => void;
  wantedCharactersSet: Set<string>;
  priorityCharactersSet: Set<string>;
  defaultTangReadings?: Record<string, string>;
  textKey: string;
  textGroup: CurationStateTextGroup | undefined;
  runningTotalTexts: number;
}) {
  /***
                         *  characters from uniqueCharacters which are NOT in runningSeenCharacters
                            and which are NOT in seenFigures
                         */
  const newAtomicCharactersSeenOnlyAsComponents = new Set(
    seenText.uniqueCharacters.flatMap(({ character }) => {
      if (!runningSeenCharacters[textKey].has(character)) {
        const figureFirstSighting = componentsToFirstSighting.get(character);
        const firstSightingWasBeforeThisText =
          figureFirstSighting &&
          (figureFirstSighting.textGroupIndex < groupIndex ||
            (figureFirstSighting.textGroupIndex === groupIndex &&
              figureFirstSighting.textIndex < seenTextIndex));
        if (firstSightingWasBeforeThisText) {
          const figure = seenFiguresMap.get(character) || null;
          return figure && isAtomicFigure(figure) ? [character] : [];
        }
      }
      return [];
    }),
  );
  const newNonAtomicCharactersSeenOnlyAsComponents = new Set(
    seenText.uniqueCharacters.flatMap(({ character }) => {
      if (!runningSeenCharacters[textKey].has(character)) {
        const figureFirstSighting = componentsToFirstSighting.get(character);
        const firstSightingWasBeforeThisText =
          figureFirstSighting &&
          (figureFirstSighting.textGroupIndex < groupIndex ||
            (figureFirstSighting.textGroupIndex === groupIndex &&
              figureFirstSighting.textIndex < seenTextIndex));

        if (firstSightingWasBeforeThisText) {
          const figure = seenFiguresMap.get(character) || null;
          return figure && !isAtomicFigure(figure) ? [character] : [];
        }
      }
      return [];
    }),
  );
  // const unseenCharactersRegex = new RegExp(
  //   `([^${[...runningSeenCharacters[textKey]].join("")}])`,
  //   "g",
  // );

  const textNewFigures = useTextNewFigures({
    text: seenText,
    getFigure: (key) => {
      const seen = seenFiguresMap.get(key);
      if (!seen) return null;
      if (componentsToFirstSighting.get(key)?.textKey !== seenText.key)
        return null;
      return seen || null;
    },
    newAtomicCharactersSeenOnlyAsComponents,
    newNonAtomicCharactersSeenOnlyAsComponents,
  });

  return (
    <section key={seenText.id} className="mb-4">
      {tg ? (
        <h3>
          unique chars: {tg.baseCorpusUniqueCharactersCount}; components:{" "}
          {tg.baseCorpusUniqueComponentsCount}; total length:{" "}
          {tg.baseCorpusTextLength} score:{" "}
          {tg._sum?.frequencyScore?.toLocaleString("en-US")}
        </h3>
      ) : null}
      <h3>
        #{runningTotalTexts} {seenText.author} - {seenText.title} (
        {seenText.source}){" "}
        {seenText.urls.map((url, i) => (
          <a
            href={url}
            key={url}
            target="_blank"
            className="underline"
            rel="noreferrer"
            title={url}
          >
            [{i + 1}]
          </a>
        ))}
      </h3>
      {seenText.text}
      <div className="text-right">
        <button
          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
          onClick={() => removeFromSeenTexts(seenText.key)}
        >
          remove
        </button>
        <button
          className="m-1 border border-slate-300 bg-slate-100 p-1 text-xs"
          onClick={() => moveWithinSeenTexts(seenText.key, groupIndex + 1)}
        >
          move
        </button>
        <CopyYmlButton
          text={seenText}
          defaultTangReadings={defaultTangReadings?.[seenText.key]}
        />
      </div>
      <div>
        {/* <p
      dangerouslySetInnerHTML={{
        __html: t.normalizedText.replaceAll(
          unseenCharactersRegex,
          '<span class="text-sky-600">$&</span>',
        ),
      }}
    /> */}
        <ColoredCharactersByInterest
          normalizedText={seenText.normalizedText}
          wantedCharacters={wantedCharactersSet}
          seenCharacters={runningSeenCharacters[textKey]}
          priorityFiguresIds={priorityCharactersSet}
          defaultTangReadings={defaultTangReadings?.[seenText.key]}
        />
        <div className="m-2">
          <TextUniqueComponents {...textNewFigures} />
        </div>
      </div>
    </section>
  );
}
