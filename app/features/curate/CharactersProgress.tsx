import { KanjisenseFigure } from "@prisma/client";
import { useState, Fragment } from "react";
import type { PropsWithChildren, ReactNode } from "react";

import { CurationState } from "./getCurationState";

export function CharactersProgress({
  allFiguresKeysSet,
  seenChars,
  seenFigures,
  getOnClickFigure,
  remainingKanjisenseCharacters,
  remainingMeaningfulComponents,
  seenMeaningfulAtomicComponents,
  nonAtomicCharactersSeenOnlyAsComponents,
  atomicCharactersSeenOnlyAsComponents,
}: {
  allFiguresKeysSet: Set<string>;
  seenChars: CurationState["seenCharacters"];
  seenFigures: CurationState["seenFigures"];
  getOnClickFigure: (char: string) => () => void;

  remainingKanjisenseCharacters: (KanjisenseFigure & {
    asComponent: {
      allUses: Pick<KanjisenseFigure, "aozoraAppearances">[];
    } | null;
  })[];
  remainingMeaningfulComponents: CurationState["remainingMeaningfulComponents"];
  atomicCharactersSeenOnlyAsComponents: Set<string>;
  seenMeaningfulFigures: CurationState["seenFigures"];
  seenMeaningfulAtomicComponents: CurationState["seenFigures"];
  nonAtomicCharactersSeenOnlyAsComponents: Set<string>;
}) {
  const [
    specialRemainingCharactersSortMethod,
    setSpecialRemainingCharactersSortMethod,
  ] = useState<null | "byLists" | "byUsesAppearances" | "byFewestComponents">(
    null,
  );

  function getListPriority(figure: KanjisenseFigure) {
    if (
      figure.listsAsCharacter.includes("1") ||
      figure.listsAsComponent.includes("1")
    )
      return 10;
    if (
      figure.listsAsCharacter.includes("2") ||
      figure.listsAsComponent.includes("2")
    )
      return 9;
    if (
      figure.listsAsCharacter.includes("3") ||
      figure.listsAsComponent.includes("3")
    )
      return 8;
    if (
      figure.listsAsCharacter.includes("4") ||
      figure.listsAsComponent.includes("4")
    )
      return 7;
    if (
      figure.listsAsCharacter.includes("5") ||
      figure.listsAsComponent.includes("5")
    )
      return 6;
    if (
      figure.listsAsCharacter.includes("6") ||
      figure.listsAsComponent.includes("6")
    )
      return 5;
    if (
      figure.listsAsCharacter.includes("j") ||
      figure.listsAsComponent.includes("j")
    )
      return 4;
    if (
      figure.listsAsCharacter.includes("h") ||
      figure.listsAsComponent.includes("h")
    )
      return 3;
    if (
      figure.listsAsCharacter.includes("m") ||
      figure.listsAsComponent.includes("m")
    )
      return 2;
    return 1;
  }

  const sortedRemainingKanjisenseCharacters =
    specialRemainingCharactersSortMethod
      ? remainingKanjisenseCharacters.sort((figureA, figureB) => {
          if (!figureA || !figureB) return 0;
          switch (specialRemainingCharactersSortMethod) {
            case "byLists":
              return getListPriority(figureB) - getListPriority(figureA);
            case "byUsesAppearances":
              return (
                (figureB.asComponent?.allUses.reduce(
                  (acc, use) => acc + use.aozoraAppearances,
                  0,
                ) ?? 0) -
                (figureA.asComponent?.allUses.reduce(
                  (acc, use) => acc + use.aozoraAppearances,
                  0,
                ) ?? 0)
              );
            case "byFewestComponents":
              return (
                ((figureA.componentsTree as [string, string][] | null)
                  ?.length ?? 0) -
                ((figureB.componentsTree as [string, string][] | null)
                  ?.length ?? 0)
              );
            default:
              return 0;
          }
        })
      : remainingKanjisenseCharacters;

  // const remainingMeaningfulComponents = allFiguresKeys.filter((char) => {
  //   const figure = getFigure(char)!;
  //   return (
  //     figure.keyword &&
  //     figure.isKanjisenseMeaningfulComponent() &&
  //     !seenComponents.some(c=>c.id === char)
  //   );
  // });
  const remainingMeaningfulAtomicComponents =
    remainingMeaningfulComponents.filter(isFigureAtomic);

  return (
    <section>
      <p>
        {seenMeaningfulAtomicComponents.length}/
        {remainingMeaningfulAtomicComponents.length +
          seenMeaningfulAtomicComponents.length}{" "}
        atomic components seen ({remainingMeaningfulAtomicComponents.length}{" "}
        remaining)
        <br />
        {seenChars.length} characters seen (
        {
          // priority
          seenChars.filter((c) => c.isPriority).length
        }{" "}
        priority figures, {seenChars.filter((c) => !c.isPriority).length}{" "}
        other):{" "}
        {[...seenChars]
          .sort((a, b) => {
            return b.aozoraAppearances - a.aozoraAppearances;
          })
          .map((entry, i) => {
            const char = typeof entry === "string" ? entry : entry.id;
            if (allFiguresKeysSet.has(char))
              return (
                <span key={char + i}>
                  <ColorCodedFigure
                    key={char}
                    display={char}
                    lists={entry.listsAsCharacter}
                    onClick={getOnClickFigure(char)}
                  />
                  {entry.isStandaloneCharacter ? null : "!"}
                </span>
              );
            return (
              <span key={char + i} className={"nonPriorityChar"}>
                *{char}
              </span>
            );
          })}
      </p>
      <p>
        {seenFigures.length} components seen:
        {[...seenFigures]
          .sort((a, b) => {
            return b.aozoraAppearances - a.aozoraAppearances;
          })
          .map((c, i) => (
            <ColorCodedFigure
              key={c.id + i}
              display={c.id}
              lists={c.listsAsComponent}
              onClick={getOnClickFigure(c.id)}
            />
          ))}
      </p>
      <section>
        {seenMeaningfulAtomicComponents.length} atomic components seen:
        {seenMeaningfulAtomicComponents.map((c, i) => (
          <ColorCodedFigure
            key={c.id + i}
            display={c.id}
            lists={c.listsAsComponent}
            onClick={getOnClickFigure(c.id)}
          />
        ))}
        <br />
        <br />
        {atomicCharactersSeenOnlyAsComponents.size} atomic characters
        encountered only as components:
        {atomicCharactersSeenOnlyAsComponents}
        <br />
        {nonAtomicCharactersSeenOnlyAsComponents.size} other characters
        encountered only as components:
        {nonAtomicCharactersSeenOnlyAsComponents}
        <br />
        <br />
        {/* TODO: only count those non-joyo components which are used in non-joyo kanji that are NOT variants of joyo kanji */}
        <b>
          {remainingMeaningfulAtomicComponents.length} remaining atomic
          components:
        </b>{" "}
        <div>
          {remainingMeaningfulAtomicComponents.map((figure) => {
            return (
              <ColorCodedComponentWithUses
                key={figure.id}
                figure={figure}
                getOnClickFigure={getOnClickFigure}
              />
            );
          })}
        </div>
      </section>

      <Collapsible
        summary={
          <>{remainingKanjisenseCharacters.length} priority characters left: </>
        }
      >
        <section>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <b
            onClick={() => {
              if (!specialRemainingCharactersSortMethod)
                setSpecialRemainingCharactersSortMethod("byLists");
              else if (specialRemainingCharactersSortMethod === "byLists")
                setSpecialRemainingCharactersSortMethod("byUsesAppearances");
              else if (
                specialRemainingCharactersSortMethod === "byUsesAppearances"
              )
                setSpecialRemainingCharactersSortMethod("byFewestComponents");
              else if (
                specialRemainingCharactersSortMethod === "byFewestComponents"
              )
                setSpecialRemainingCharactersSortMethod(null);
            }}
          >
            order: {specialRemainingCharactersSortMethod || "frequency"}{" "}
          </b>

          {sortedRemainingKanjisenseCharacters.map((c, i) => {
            return (
              <span
                key={c.id + i}
                className={
                  seenFigures.some((sc) => sc.id === c.id)
                    ? "text-opacity-50"
                    : ""
                }
              >
                <ColorCodedFigure
                  display={c.id}
                  onClick={getOnClickFigure(c.id)}
                  lists={c.listsAsCharacter}
                />
              </span>
            );
          })}
        </section>
      </Collapsible>
      <Collapsible
        summary={
          <>{remainingMeaningfulComponents.length} remaining components</>
        }
      >
        <section>
          only components:{" "}
          {
            remainingMeaningfulComponents.filter(
              (c) => !c.isStandaloneCharacter,
            ).length
          }{" "}
          figures{" "}
          {remainingMeaningfulComponents
            .filter((c) => !c.isStandaloneCharacter)
            .map((c) => {
              const primaryVariant = c.variantGroupId ?? c.id;
              return (
                <span
                  key={c.id}
                  className={
                    primaryVariant &&
                    (seenChars.some((sc) => sc.id === primaryVariant) ||
                      seenFigures.some((sc) => sc.id === primaryVariant))
                      ? "bg-slate-300 opacity-50"
                      : ""
                  }
                >
                  <ColorCodedComponentWithUses
                    figure={c}
                    getOnClickFigure={getOnClickFigure}
                  />
                </span>
              );
            })}
          <br />
          also standalone characters:{" "}
          {
            remainingMeaningfulComponents.filter((c) => c.isStandaloneCharacter)
              .length
          }{" "}
          figures{" "}
          {remainingMeaningfulComponents
            .filter((c) => c.isStandaloneCharacter)
            .map((c) => {
              const primaryVariant = c.variantGroupId ?? c.id;
              return (
                <span
                  key={c.id}
                  className={
                    primaryVariant &&
                    (seenChars.some((sc) => sc.id === primaryVariant) ||
                      seenFigures.some((sc) => sc.id === primaryVariant))
                      ? "opacity-30"
                      : ""
                  }
                >
                  <ColorCodedFigure
                    display={c.id}
                    onClick={getOnClickFigure(c.id)}
                    lists={c.listsAsComponent}
                  />
                </span>
              );
            })}
        </section>
      </Collapsible>
    </section>
  );
}

function ColorCodedComponentWithUses({
  figure,
  getOnClickFigure,
}: {
  figure: CurationState["remainingMeaningfulComponents"][number];
  getOnClickFigure: (char: string) => () => void;
}) {
  return (
    <div className="border-1 mx-1 inline-block border border-blue-300 ">
      <ColorCodedFigure
        display={figure.id}
        onClick={getOnClickFigure(figure.id)}
        lists={figure.listsAsComponent}
      />{" "}
      -{" "}
      {figure.asComponent?.allUses.map((u, i) => {
        return (
          <span key={u.id + i}>
            <ColorCodedFigure
              display={u.id}
              lists={u.listsAsCharacter || u.listsAsComponent || []}
              key={u + " " + u.id}
              onClick={getOnClickFigure(u.id)}
            />
          </span>
        );
      })}
    </div>
  );
}

function Collapsible({
  summary,
  open = false,
  children,
}: PropsWithChildren<{ summary: ReactNode; open?: boolean }>) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <Fragment>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? "-" : "+"} {summary}
      </div>
      {isOpen ? children : null}
    </Fragment>
  );
}

function ColorCodedFigure({
  display,
  lists,
  onClick,
}: {
  display: string;
  lists: string[];
  onClick: () => void;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <span
      onClick={onClick}
      className={`[font-family:"yukyokasho","gw1845329","Hanazono Mincho I"] ${
        (lists.includes("1") && " bg-blue-800 text-white") ||
        (lists.includes("2") && "bg-blue-600 text-blue-50") ||
        (lists.includes("3") && "bg-blue-400 text-blue-50") ||
        (lists.includes("4") && "bg-blue-200 text-blue-400") ||
        (lists.includes("5") && "bg-blue-100 text-blue-600") ||
        (lists.includes("6") && "bg-blue-50 text-blue-800") ||
        (lists.includes("j") && "[color:rgb(24,120,47)]") ||
        (lists.includes("m") && "[color:rgb(192,27,74)]") ||
        (lists.includes("h") && "[color:rgb(187,0,255)]")
      }`}
    >
      {display}
    </span>
  );
}

function isFigureAtomic(
  figure: Pick<KanjisenseFigure, "componentsTree">,
): boolean {
  return Array.isArray(figure.componentsTree)
    ? figure.componentsTree.length === 0
    : false;
}
