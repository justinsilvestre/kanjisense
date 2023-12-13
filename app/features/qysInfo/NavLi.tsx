import { Link } from "@remix-run/react";
import type { PropsWithChildren, ReactNode } from "react";

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
