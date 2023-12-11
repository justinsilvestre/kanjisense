import { Prisma } from "@prisma/client";
import clsx from "clsx";

import {
  BadgeHue,
  BadgeProps,
  isSecondaryVariant,
} from "~/features/dictionary/badgeFigure";
import type { KvgJsonData } from "~/features/dictionary/KvgJsonData";

const GETA_BLOCK_CHARACTER = "〓";

export function FigureBadge({
  badgeProps,
  width: outerWidth = 3.5,
  className,
}: {
  badgeProps: BadgeProps;
  width?: number;
  className?: string;
}) {
  const figureId = badgeProps.id;

  const innerWidth = outerWidth - outerWidth / 7;

  const buffer =
    !badgeProps.isPriorityComponent || !badgeProps.isStandaloneCharacter
      ? 0.25
      : 0;

  const outlineWidth = Math.max(
    1,
    Math.round(outerWidth - innerWidth + buffer),
  );

  const figureIsSecondaryVariant = isSecondaryVariant(
    figureId,
    badgeProps.variantGroupId,
  );

  return (
    <div
      className={`inline-block text-center font-light ${className} ${getColorClasses(
        badgeProps.hue,
        badgeProps.aozoraAppearances,
      )} ${!badgeProps.isStandaloneCharacter ? "rounded-full" : ""} $`}
      style={{
        width: `${outerWidth + 0.1}rem`,
        height: `${outerWidth}rem`,
        padding: `${0.5 * (outerWidth - innerWidth + buffer)}rem`,
        ...(figureIsSecondaryVariant
          ? {
              outline: "solid",
              outlineColor: "white",
              outlineWidth: `${outlineWidth}px`,
              outlineOffset: `${-(3 * outlineWidth)}px`,
            }
          : null),
      }}
    >
      <div
        className={clsx(
          "bg-white text-lg outline outline-2",
          {
            "rounded-full": badgeProps.isPriorityComponent,
            "outline-2": outerWidth > 3.5,
          },
          getColorClasses(badgeProps.hue, badgeProps.aozoraAppearances).split(
            " ",
          )[1],
        )}
        style={{
          width: `${innerWidth - buffer}rem`,
          height: `${innerWidth - buffer}rem`,
          fontSize: `${innerWidth - 1}rem`,
          lineHeight: `${innerWidth * 1}rem`,
        }}
      >
        {badgeProps.image?.type === "Kvg" ? (
          <FigureKvg id={figureId} content={badgeProps.image.content} />
        ) : null}
        {badgeProps.image?.type === "GlyphWiki" ? (
          <FigureGlyphWikiSvg
            id={figureId}
            content={badgeProps.image.content}
          />
        ) : null}
        {!badgeProps.image && [...figureId].length === 1 ? figureId : null}
        {!badgeProps.image && [...figureId].length > 1
          ? GETA_BLOCK_CHARACTER
          : null}
      </div>
    </div>
  );
}

function getColorClasses(hue: BadgeHue, aozoraAppearances: number) {
  const frequencyClass = getFrequencyClass(aozoraAppearances);
  return colorClasses[hue][frequencyClass];
}

enum FrequencyClass {
  Class1,
  Class2,
  Class3,
  Class4,
  Class5,
  Class6,
  Class7,
  Class8,
  Class9,
}

const colorClasses = {
  [BadgeHue.KYOIKU]: {
    [FrequencyClass.Class1]: "bg-kyoiku-700 outline-kyoiku-800",
    [FrequencyClass.Class2]: "bg-kyoiku-700 outline-kyoiku-600",
    [FrequencyClass.Class3]: "bg-kyoiku-600 outline-kyoiku-700",
    [FrequencyClass.Class4]: "bg-kyoiku-600 outline-kyoiku-600",
    [FrequencyClass.Class5]: "bg-kyoiku-600 outline-kyoiku-500",
    [FrequencyClass.Class6]: "bg-kyoiku-500 outline-kyoiku-500",
    [FrequencyClass.Class7]: "bg-kyoiku-400 outline-kyoiku-500",
    [FrequencyClass.Class8]: "bg-kyoiku-300 outline-kyoiku-500",
    [FrequencyClass.Class9]: "bg-kyoiku-200 outline-kyoiku-500",
  },
  [BadgeHue.JOYO]: {
    [FrequencyClass.Class1]: "bg-joyo-700 outline-joyo-800",
    [FrequencyClass.Class2]: "bg-joyo-700 outline-joyo-600",
    [FrequencyClass.Class3]: "bg-joyo-600 outline-joyo-700",
    [FrequencyClass.Class4]: "bg-joyo-600 outline-joyo-600",
    [FrequencyClass.Class5]: "bg-joyo-600 outline-joyo-500",
    [FrequencyClass.Class6]: "bg-joyo-500 outline-joyo-500",
    [FrequencyClass.Class7]: "bg-joyo-400 outline-joyo-500",
    [FrequencyClass.Class8]: "bg-joyo-300 outline-joyo-500",
    [FrequencyClass.Class9]: "bg-joyo-200 outline-joyo-500",
  },
  [BadgeHue.HYOGAI]: {
    [FrequencyClass.Class1]: "bg-hyogai-700 outline-hyogai-800",
    [FrequencyClass.Class2]: "bg-hyogai-700 outline-hyogai-700",
    [FrequencyClass.Class3]: "bg-hyogai-700 outline-hyogai-600",
    [FrequencyClass.Class4]: "bg-hyogai-600 outline-hyogai-600",
    [FrequencyClass.Class5]: "bg-hyogai-600 outline-hyogai-500",
    [FrequencyClass.Class6]: "bg-hyogai-500 outline-hyogai-500",
    [FrequencyClass.Class7]: "bg-hyogai-500 outline-hyogai-400",
    [FrequencyClass.Class8]: "bg-hyogai-400 outline-hyogai-400",
    [FrequencyClass.Class9]: "bg-hyogai-300 outline-hyogai-500",
  },
  [BadgeHue.JINMEIYO]: {
    [FrequencyClass.Class1]: "bg-jinmeiyo-700 outline-jinmeiyo-800",
    [FrequencyClass.Class2]: "bg-jinmeiyo-700 outline-jinmeiyo-700",
    [FrequencyClass.Class3]: "bg-jinmeiyo-600 outline-jinmeiyo-700",
    [FrequencyClass.Class4]: "bg-jinmeiyo-600 outline-jinmeiyo-600",
    [FrequencyClass.Class5]: "bg-jinmeiyo-600 outline-jinmeiyo-500",
    [FrequencyClass.Class6]: "bg-jinmeiyo-500 outline-jinmeiyo-600",
    [FrequencyClass.Class7]: "bg-jinmeiyo-500 outline-jinmeiyo-500",
    [FrequencyClass.Class8]: "bg-jinmeiyo-500 outline-jinmeiyo-600",
    [FrequencyClass.Class9]: "bg-jinmeiyo-400 outline-jinmeiyo-600",
  },
  [BadgeHue.EXTRA]: {
    [FrequencyClass.Class1]: "bg-extra-700 outline-extra-800",
    [FrequencyClass.Class2]: "bg-extra-700 outline-extra-700",
    [FrequencyClass.Class3]: "bg-extra-600 outline-extra-700",
    [FrequencyClass.Class4]: "bg-extra-600 outline-extra-600",
    [FrequencyClass.Class5]: "bg-extra-600 outline-extra-500",
    [FrequencyClass.Class6]: "bg-extra-500 outline-extra-600",
    [FrequencyClass.Class7]: "bg-extra-500 outline-extra-500",
    [FrequencyClass.Class8]: "bg-extra-500 outline-extra-600",
    [FrequencyClass.Class9]: "bg-extra-400 outline-extra-600",
  },
};

const class1Threshold = 200000;
const class2Threshold = 100000;
const class3Threshold = 50000;
const class4Threshold = 25000;
const class5Threshold = 10000;
const class6Threshold = 5000;
const class7Threshold = 1000;
const class8Threshold = 500;
function getFrequencyClass(aozoraAppearances: number) {
  if (aozoraAppearances >= class1Threshold) return FrequencyClass.Class1;
  if (aozoraAppearances >= class2Threshold) return FrequencyClass.Class2;
  if (aozoraAppearances >= class3Threshold) return FrequencyClass.Class3;
  if (aozoraAppearances >= class4Threshold) return FrequencyClass.Class4;
  if (aozoraAppearances >= class5Threshold) return FrequencyClass.Class5;
  if (aozoraAppearances >= class6Threshold) return FrequencyClass.Class6;
  if (aozoraAppearances >= class7Threshold) return FrequencyClass.Class7;
  if (aozoraAppearances >= class8Threshold) return FrequencyClass.Class8;
  return FrequencyClass.Class9;
}

export const kvgAttributes = {
  xlmns: "http://www.w3.org/2000/svg",
  viewBox: "-20 -20 149 149",
  style: {
    fill: "none",
    stroke: "black",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
} as const;

function FigureKvg({ content }: { id: string; content: Prisma.JsonValue }) {
  return (
    <svg {...kvgAttributes} style={{ ...kvgAttributes.style }}>
      {(content as unknown as KvgJsonData).p.map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}

function FigureGlyphWikiSvg({
  content,
}: {
  id: string;
  content: Prisma.JsonValue;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      baseProfile="full"
      viewBox="-30 -30 260 260"
    >
      <g fill="black">
        <path d={JSON.parse(content as unknown as string) as string} />
      </g>
    </svg>
  );
}
