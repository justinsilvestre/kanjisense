import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router";

export function NavLi({
  hash,
  text,
  children,
  level,
}: PropsWithChildren<{ hash: string; text: ReactNode; level: number }>) {
  return (
    <li data-level={level}>
      <Link to={`#${hash}`}>{text}</Link>
      {children}
    </li>
  );
}
