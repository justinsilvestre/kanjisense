import { Link } from "@remix-run/react";
import { useEffect, type ReactNode, useRef } from "react";

type LinkProps<T = object> = T & {
  children: ReactNode;
  className?: string;
};

function AppLink({
  to,
  children,
  className = "underline hover:text-orange-600",
  as,
  linkRef,
}: LinkProps<{
  to: string;
  as?: string;

  linkRef?: React.Ref<HTMLAnchorElement>;
}>) {
  return (
    <Link {...{ to, as }} className={className} ref={linkRef}>
      {children}
    </Link>
  );
}

export function DictLink({
  children,
  figureId,
  focusOnLoad,
}: LinkProps<{ figureId: string; focusOnLoad?: boolean }>) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (focusOnLoad) {
      linkRef.current?.focus();
    }
  }, [figureId, focusOnLoad]);

  return (
    <AppLink key={figureId} to={`/dict/${figureId}`} linkRef={linkRef}>
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
