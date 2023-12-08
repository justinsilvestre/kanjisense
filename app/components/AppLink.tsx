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
  linkRef,
}: LinkProps<{
  to: string;
  linkRef?: React.Ref<HTMLAnchorElement>;
}>) {
  return (
    <Link to={to} className={className} ref={linkRef}>
      {children}
    </Link>
  );
}

export function DictLink({
  children,
  figureId,
  focusOnLoad,
  className,
}: {
  children?: ReactNode;

  className?: string;
} & Omit<
  LinkProps<{
    figureId: string;
    focusOnLoad?: boolean;
  }>,
  "children"
>) {
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
      {children || figureId}
    </AppLink>
  );
}

export const IndexLink = ({ children, className }: LinkProps) => (
  <AppLink to="/" className={className}>
    {children}
  </AppLink>
);

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

export const BrowseCompoundComponentsLink = ({
  children,
  className,
}: LinkProps) => (
  <AppLink to="/browse/compound-components" className={className}>
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
