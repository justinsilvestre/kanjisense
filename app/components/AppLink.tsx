import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

type LinkProps<T> = T & {
  children: ReactNode;
  className?: string;
};

function AppLink({
  to,
  children,
  className = "underline hover:text-orange-600",
  as,
}: LinkProps<{ to: string; as?: string }>) {
  return (
    <Link {...{ to, as }} className={className}>
      {children}
    </Link>
  );
}

export function DictLink({
  children,
  figureId,
}: LinkProps<{ figureId: string }>) {
  return (
    <AppLink key={figureId} to={`/dict/${figureId}`}>
      {children}
    </AppLink>
  );
}
