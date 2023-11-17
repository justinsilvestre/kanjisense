import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

type LinkProps<T = object> = T & {
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

export const BrowseCharactersLink = ({ children }: LinkProps) => (
  <AppLink to="/browse/characters">{children}</AppLink>
);

export const BrowseComponentsLink = ({ children }: LinkProps) => (
  <AppLink to="/browse/components">{children}</AppLink>
);

// also atomic components
// sound components
