/* eslint-disable react/no-unescaped-entities */
import clsx from "clsx";
import { Link } from "react-router";

import { DictPreviewLink } from "~/components/AppLink";
import { FigureBadge } from "~/components/FigureBadge";
import { getBadgeFiguresByPriorityGroupedWithVariants } from "~/features/browse/getBadgeFiguresByPriorityGroupedWithVariants";
import { ManyFiguresPopover } from "~/features/browse/useManyFiguresPopover";
import { parseAnnotatedKeywordText } from "~/features/dictionary/getHeadingsMeanings";

export function FiguresGroupedByVariantsList({
  figuresAndVariants: atomicComponentsAndVariants,
  popover,
}: {
  figuresAndVariants: Awaited<
    ReturnType<typeof getBadgeFiguresByPriorityGroupedWithVariants>
  >["matchedFiguresAndVariants"];
  popover: ManyFiguresPopover;
}) {
  return (
    <section className="flex flex-row flex-wrap gap-2 gap-y-8">
      {atomicComponentsAndVariants.map(
        ({ figures, keyword, mnemonicKeyword }, i) => {
          const parsedKeyword = mnemonicKeyword
            ? parseAnnotatedKeywordText(mnemonicKeyword)
            : null;
          const keywordDisplay = (
            <div className="text-center">
              {parsedKeyword ? (
                <>
                  "{parsedKeyword?.text}"
                  {!parsedKeyword.reference ? null : (
                    <>
                      {" "}
                      ({parsedKeyword.referenceTypeText}{" "}
                      <Link to={`/dict/${parsedKeyword.reference}`}>
                        {parsedKeyword.reference}
                      </Link>
                      )
                    </>
                  )}
                </>
              ) : (
                <>{keyword}</>
              )}
            </div>
          );
          return figures.length > 1 ? (
            <div
              key={String(i)}
              className="inline-flex flex-col gap-2 border border-solid border-gray-400 bg-gray-100 p-1"
            >
              <div className="flex flex-row gap-2">
                {figures.map(({ figure, isMatch }) => (
                  // <FigureBadgeLink
                  //   key={figure.id}
                  //   id={figure.id}
                  //   badgeProps={figure}
                  //   className={clsx("", {
                  //     "opacity-30": !isMatch,
                  //   })}
                  // />
                  <DictPreviewLink
                    key={figure.id}
                    figureKey={figure.key}
                    popoverAttributes={popover.getAnchorAttributes(figure)}
                    className={clsx("transition-opacity hover:opacity-100", {
                      "opacity-30": !isMatch,
                    })}
                  >
                    <FigureBadge badgeProps={figure} />
                  </DictPreviewLink>
                ))}
              </div>
              {keywordDisplay}
            </div>
          ) : (
            <div
              key={String(i)}
              className="inline-flex flex-col flex-wrap gap-2 p-1"
            >
              <DictPreviewLink
                figureKey={figures[0].figure.key}
                popoverAttributes={popover.getAnchorAttributes(
                  figures[0].figure,
                )}
                className={"text-center"}
              >
                <FigureBadge badgeProps={figures[0].figure} />
              </DictPreviewLink>
              {/* <FigureBadgeLink
                                  key={figures[0].figure.id}
                                  id={figures[0].figure.id}
                                  badgeProps={figures[0].figure}
                                  className="text-center"
                                /> */}
              {keywordDisplay}
            </div>
          );
        },
      )}
    </section>
  );
}
