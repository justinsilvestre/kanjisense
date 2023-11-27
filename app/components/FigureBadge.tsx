import { Prisma } from "@prisma/client";

import {
  BadgeHue,
  BadgeProps,
  isSecondaryVariant,
} from "~/features/dictionary/badgeFigure";
import { KvgJsonData } from "~/features/dictionary/KvgJsonData";

const GETA_BLOCK_CHARACTER = "〓";

export function FigureBadge({
  id: figureId,
  badgeProps,
  width: outerWidth = 3.5,
}: {
  id: string;
  badgeProps: BadgeProps;
  width?: number;
}) {
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
      className={`inline-block text-center align-bottom ${getColorClassName(
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
        className={`bg-white text-lg outline-2 outline ${
          badgeProps.isPriorityComponent ? "rounded-full" : ""
        } ${
          getColorClassName(badgeProps.hue, badgeProps.aozoraAppearances).split(
            " ",
          )[1]
        }`}
        style={{
          width: `${innerWidth - buffer}rem`,
          height: `${innerWidth - buffer}rem`,
          fontSize: `${innerWidth - 1}rem`,
          lineHeight: "inherit",
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

function getColorClassName(hue: BadgeHue, aozoraAppearances: number) {
  let className = "";
  const frequencyClass = getFrequencyClass(aozoraAppearances);

  if (hue === BadgeHue.KYOIKU) {
    switch (frequencyClass) {
      case FrequencyClass.Class1:
        className = "bg-kyoiku-700 outline-kyoiku-800";
        break;
      case FrequencyClass.Class2:
        className = "bg-kyoiku-700 outline-kyoiku-600";
        break;
      case FrequencyClass.Class3:
        className = "bg-kyoiku-600 outline-kyoiku-700";
        break;
      case FrequencyClass.Class4:
        className = "bg-kyoiku-600 outline-kyoiku-600";
        break;
      case FrequencyClass.Class5:
        className = "bg-kyoiku-600 outline-kyoiku-500";
        break;
      case FrequencyClass.Class6:
        className = "bg-kyoiku-500 outline-kyoiku-500";
        break;
      case FrequencyClass.Class7:
        className = "bg-kyoiku-400 outline-kyoiku-500";
        break;
      case FrequencyClass.Class8:
        className = "bg-kyoiku-300 outline-kyoiku-500";
        break;
      case FrequencyClass.Class9:
        className = "bg-kyoiku-200 outline-kyoiku-500";
        break;
    }
  }
  if (hue === BadgeHue.JOYO) {
    switch (frequencyClass) {
      case FrequencyClass.Class1:
        className = "bg-joyo-700 outline-joyo-800";
        break;
      case FrequencyClass.Class2:
        className = "bg-joyo-700 outline-joyo-600";
        break;
      case FrequencyClass.Class3:
        className = "bg-joyo-600 outline-joyo-700";
        break;
      case FrequencyClass.Class4:
        className = "bg-joyo-600 outline-joyo-600";
        break;
      case FrequencyClass.Class5:
        className = "bg-joyo-600 outline-joyo-500";
        break;
      case FrequencyClass.Class6:
        className = "bg-joyo-500 outline-joyo-500";
        break;
      case FrequencyClass.Class7:
        className = "bg-joyo-400 outline-joyo-500";
        break;
      case FrequencyClass.Class8:
        className = "bg-joyo-300 outline-joyo-500";
        break;
      case FrequencyClass.Class9:
        className = "bg-joyo-200 outline-joyo-500";
        break;
    }
  }
  if (hue === BadgeHue.HYOGAI) {
    switch (frequencyClass) {
      case FrequencyClass.Class1:
        className = "bg-hyogai-700 outline-hyogai-800";
        break;
      case FrequencyClass.Class2:
        className = "bg-hyogai-700 outline-hyogai-700";
        break;
      case FrequencyClass.Class3:
        className = "bg-hyogai-700 outline-hyogai-600";
        break;
      case FrequencyClass.Class4:
        className = "bg-hyogai-600 outline-hyogai-600";
        break;
      case FrequencyClass.Class5:
        className = "bg-hyogai-600 outline-hyogai-500";
        break;
      case FrequencyClass.Class6:
        className = "bg-hyogai-500 outline-hyogai-500";
        break;
      case FrequencyClass.Class7:
        className = "bg-hyogai-500 outline-hyogai-400";
        break;
      case FrequencyClass.Class8:
        className = "bg-hyogai-400 outline-hyogai-400";
        break;
      case FrequencyClass.Class9:
        className = "bg-hyogai-300 outline-hyogai-500";
        break;
    }
  }
  if (hue === BadgeHue.JINMEIYO) {
    switch (frequencyClass) {
      case FrequencyClass.Class1:
        className = "bg-jinmeiyo-700 outline-jinmeiyo-800";
        break;
      case FrequencyClass.Class2:
        className = "bg-jinmeiyo-700 outline-jinmeiyo-700";
        break;
      case FrequencyClass.Class3:
        className = "bg-jinmeiyo-600 outline-jinmeiyo-700";
        break;
      case FrequencyClass.Class4:
        className = "bg-jinmeiyo-600 outline-jinmeiyo-600";
        break;
      case FrequencyClass.Class5:
        className = "bg-jinmeiyo-600 outline-jinmeiyo-500";
        break;
      case FrequencyClass.Class6:
        className = "bg-jinmeiyo-500 outline-jinmeiyo-600";
        break;
      case FrequencyClass.Class7:
        className = "bg-jinmeiyo-500 outline-jinmeiyo-500";
        break;
      case FrequencyClass.Class8:
        className = "bg-jinmeiyo-500 outline-jinmeiyo-600";
        break;
      case FrequencyClass.Class9:
        className = "bg-jinmeiyo-400 outline-jinmeiyo-600";
        break;
    }
  }
  if (hue === BadgeHue.EXTRA) {
    switch (frequencyClass) {
      case FrequencyClass.Class1:
        className = "bg-extra-700 outline-extra-800";
        break;
      case FrequencyClass.Class2:
        className = "bg-extra-700 outline-extra-700";
        break;
      case FrequencyClass.Class3:
        className = "bg-extra-600 outline-extra-700";
        break;
      case FrequencyClass.Class4:
        className = "bg-extra-600 outline-extra-600";
        break;
      case FrequencyClass.Class5:
        className = "bg-extra-600 outline-extra-500";
        break;
      case FrequencyClass.Class6:
        className = "bg-extra-500 outline-extra-600";
        break;
      case FrequencyClass.Class7:
        className = "bg-extra-500 outline-extra-500";
        break;
      case FrequencyClass.Class8:
        className = "bg-extra-500 outline-extra-600";
        break;
      case FrequencyClass.Class9:
        className = "bg-extra-400 outline-extra-600";
        break;
    }
  }

  return className;
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

function FigureKvg({ id, content }: { id: string; content: Prisma.JsonValue }) {
  return (
    <svg {...kvgAttributes} style={{ ...kvgAttributes.style }}>
      {(content as unknown as KvgJsonData).p.map((d, i) => (
        <path d={d} key={i} />
      ))}
      <text
        x="-10"
        y="100"
        className="fill-transparent stroke-transparent text-transparent "
        width=""
      >
        {id}
      </text>
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
