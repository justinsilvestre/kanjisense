import { useState, useRef, createElement, useEffect } from "react";

import { kvgAttributes } from "~/components/FigureBadge";

import type { KvgJsonData } from "./KvgJsonData";

export function FigureStrokesAnimation({
  kvg,
  className,
}: {
  kvg: KvgJsonData;

  className?: string;
}) {
  const [strokesProgress, setStrokesProgress] = useState(0);
  const maxProgress = (kvg?.p.length || 0) + 2;

  const pathLengths = useRef<number[]>([]);

  const showBackground = true;

  const animating = useRef<ReturnType<typeof setTimeout>>();
  const continueStrokesProgress = () =>
    setStrokesProgress((progress) =>
      progress >= maxProgress ? 0 : progress + 1,
    );

  function startAnimation() {
    continueStrokesProgress();
    animating.current = setTimeout(() => {
      if (animating) startAnimation();
    }, 700);
  }
  function stopAnimation() {
    clearTimeout(animating.current);
    animating.current = undefined;
  }

  useEffect(() => {
    startAnimation();
    return () => stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleWindowBlur = () => {
      if (strokesProgress > 0) stopAnimation();
    };
    const handleWindowFocus = () => {
      if (strokesProgress > 0) startAnimation();
    };
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [strokesProgress, startAnimation, stopAnimation]);

  const strokeProgressForStrokeAtIndex = (index: number) => index + 2;
  const fadeTransition = {
    opacity: showBackground ? 1 : 0,
    transition: "all .5s",
  };
  return (
    <>
      {createElement(
        "svg",
        {
          className,
          ...kvgAttributes,
          viewBox: "0 0 109 109",

          style: {
            ...kvgAttributes.style,
            ...(showBackground
              ? {
                  // boxShadow: "5px 5px 10px 5px #00000033",
                }
              : null),
          },
          onMouseDown: (e) => {
            e.preventDefault();
          },
        },
        createElement("rect", {
          x: 0,
          y: 0,
          width: "100%",
          height: "100%",
          fill: "white",
          stroke: "#00000011",
          style: fadeTransition,
        }),
        createElement("line", {
          x1: "50%",
          y1: "0",
          x2: "50%",
          y2: "100%",
          stroke: "#3333aa55",
          strokeWidth: "2",
          strokeDasharray: "1,3.5",
          style: fadeTransition,
        }),
        createElement("line", {
          x1: "0%",
          y1: "50%",
          x2: "100%",
          y2: "50%",
          stroke: "#3333aa55",
          strokeWidth: "2",
          strokeDasharray: "1,3.5",
          style: fadeTransition,
        }),
        strokesProgress > 0 &&
          kvg.p
            .flatMap((d, strokeIndex) =>
              [
                createElement("path", {
                  d,
                  key: d,
                  style: {
                    stroke:
                      strokesProgress ===
                      strokeProgressForStrokeAtIndex(strokeIndex)
                        ? "#9f9d48"
                        : "#000000",
                  },
                }),
                createElement("path", {
                  d,
                  key: `${strokeIndex}-inside`,
                  style: {
                    stroke:
                      strokesProgress ===
                      strokeProgressForStrokeAtIndex(strokeIndex)
                        ? "#ffff00"
                        : "#ffffffbb",
                    strokeWidth: 2,
                  },
                }),
              ].reverse(),
            )
            .reverse(),
        kvg.p.map((d, strokeIndex) =>
          createElement("path", {
            d,
            key: d,
            ref: (el: SVGPathElement) =>
              (pathLengths.current[strokeIndex] = el?.getTotalLength()),
            style: {
              ...(strokesProgress >=
                strokeProgressForStrokeAtIndex(strokeIndex) || !strokesProgress
                ? undefined
                : { display: "none" }),
              "--kvg-stroke-dashoffset": `${pathLengths?.current[strokeIndex]}`,
              "--kvg-stroke-dasharray": `${pathLengths?.current[strokeIndex]} ${pathLengths?.current[strokeIndex]}`,
            },
            className:
              strokesProgress &&
              strokesProgress >= strokeProgressForStrokeAtIndex(strokeIndex)
                ? "kvg-stroke"
                : "",
          }),
        ),
      )}
    </>
  );
}
