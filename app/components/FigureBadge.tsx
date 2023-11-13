import { Prisma } from "@prisma/client";

import { BadgeHue, BadgeProps } from "~/features/dictionary/displayFigure";
import { KvgJsonData } from "~/features/dictionary/KvgJsonData";

export const badgeFigureSelect = {
  id: true,
  listsAsCharacter: true,
  listsAsComponent: true,
  variantGroupId: true,
  aozoraAppearances: true,

  _count: {
    select: {
      firstClassComponents: true,
      firstClassUses: {
        where: {
          parent: {
            isPriority: true,
          },
        },
      },
    },
  },
  asComponent: {
    select: {
      _count: {
        select: {
          soundMarkUses: {
            where: { isPriority: true },
          },
        },
      },
    },
  },
};

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

  return (
    <div
      className={`inline-block text-center align-bottom ${
        badgeProps.hue === BadgeHue.JOYO ? "bg-lime-600" : ""
      } ${badgeProps.hue === BadgeHue.JINMEIYO ? "bg-red-600" : ""} ${
        badgeProps.hue === BadgeHue.HYOGAI ? "bg-fuchsia-600" : ""
      } ${badgeProps.hue === BadgeHue.KYOIKU ? "bg-blue-600" : ""}  ${
        badgeProps.hue === BadgeHue.EXTRA ? "bg-slate-600" : ""
      } ${!badgeProps.isStandaloneCharacter ? "rounded-full" : ""} $`}
      style={{
        width: `${outerWidth}rem`,
        height: `${outerWidth}rem`,
        padding: `${0.5 * (outerWidth - innerWidth + buffer)}rem`,
        ...(badgeProps.isSecondaryVariant
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
        className={`bg-white text-lg  ${
          badgeProps.isPriorityComponent ? "rounded-full" : ""
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
