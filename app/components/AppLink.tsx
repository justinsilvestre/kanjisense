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
  className,
}: LinkProps<{ figureId: string; focusOnLoad?: boolean }>) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (focusOnLoad) {
      linkRef.current?.focus();
    }
  }, [figureId, focusOnLoad]);

  return (
    <AppLink
      key={figureId}
      to={`/dict/${figureId}`}
      linkRef={linkRef}
      className={className}
    >
      {children}
    </AppLink>
  );
}

export const BrowseCharactersLink = ({ children, className }: LinkProps) => (
  <AppLink to="/browse/characters" className={className}>
    {children}
  </AppLink>
);

export const BrowseAtomicComponentsLink = ({
  children,
  className,
}: LinkProps) => (
  <AppLink to="/browse/atomic-components" className={className}>
    {children}
  </AppLink>
);

export const BrowseComponentsLink = ({ children, className }: LinkProps) => (
  <AppLink to="/browse/components" className={className}>
    {children}
  </AppLink>
);

export const MiddleChineseTranscriptionLink = ({
  children,
  hash,
}: LinkProps<{ hash?: string }>) => (
  <AppLink to={`/dict/middle-chinese-pronunciation${hash ? `#${hash}` : ""}`}>
    {children}
  </AppLink>
);
export const MiddleChineseLink = ({ children }: LinkProps) => (
  <AppLink to={`/dict/middle-chinese`}>{children}</AppLink>
);

export const BrowseSoundComponentsLink = ({
  children,
  className,
}: LinkProps) => (
  <AppLink to="/browse/sound-components" className={className}>
    {children}
  </AppLink>
);

export const AboutLink = ({ children, className }: LinkProps) => (
  <AppLink to="/about" className={className}>
    {children}
  </AppLink>
);
