import type { MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import { useEffect, useRef } from "react";

export function NavLi({
  hash,
  text,
  children,
  level,
}: PropsWithChildren<{ hash: string; text: ReactNode; level: number }>) {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const handleClick: MouseEventHandler = (e) => {
    document.querySelector(`#${hash}`)?.scrollIntoView({
      behavior: "smooth",
    });
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => (window.location.hash = hash), 1000);
    e.preventDefault();
  };
  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);
  return (
    <li data-level={level}>
      <a href={`#${hash}`} onClick={handleClick}>
        {text}
      </a>
      {children}
    </li>
  );
}
