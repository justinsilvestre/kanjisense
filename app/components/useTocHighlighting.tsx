import { useEffect, useRef } from "react";

export function useTocHighlighting() {
  const levelToIntersectedSections = useRef<
    Record<number, Map<string, number>>
  >({
    0: new Map(),
    1: new Map(),
    2: new Map(),
  });
  useEffect(() => {
    const observer = new IntersectionObserver((sections) => {
      console.log({ sections });
      sections.forEach((section) => {
        const id = section.target.getAttribute("id")!;
        const li = document.querySelector(`.nav li a[href="#${id}"]`)
          ?.parentElement;
        if (!li) return;

        const level = +li.dataset!.level!;
        levelToIntersectedSections.current[level].set(
          id,
          section.intersectionRatio,
        );

        if (section.intersectionRatio > 0) {
          li.classList.add("active");
        } else {
          li.classList.remove("active");
        }
      });
    });

    // Track all sections that have an `id` applied
    document.querySelectorAll("section[id]").forEach((section) => {
      console.log("section");
      observer.observe(section);
    });
    return () => {
      observer.disconnect();
    };
  }, []);
}
