import { useEffect, type ReactNode, useRef } from "react";
import { Link } from "react-router";

type LinkProps<T = object> = T & {
  children: ReactNode;
  className?: string;
  newWindow?: boolean;
};

function AppLink({
  to,
  children,
  className = "underline hover:text-orange-600",
  linkRef,
  newWindow,
}: LinkProps<{
  to: string;
  linkRef?: React.Ref<HTMLAnchorElement>;
}>) {
  return (
    <Link
      to={to}
      className={className}
      ref={linkRef}
      {...(newWindow ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function DictLink({
  children,
  figureKey,
  focusOnLoad,
  className,
  newWindow,
}: {
  children?: ReactNode;
  className?: string;
} & Omit<
  LinkProps<{
    newWindow?: boolean;
    figureKey: string;
    focusOnLoad?: boolean;
  }>,
  "children"
>) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (focusOnLoad) {
      linkRef.current?.focus();
    }
  }, [figureKey, focusOnLoad]);
  return (
    <AppLink
      to={`/dict/${figureKey}`}
      linkRef={linkRef}
      className={className}
      newWindow={newWindow}
    >
      {children || figureKey}
    </AppLink>
  );
}

interface PopoverAnchorAttributes {
  onClick: React.MouseEventHandler;
  className: string;
  ref: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}

export const DictPreviewLink = ({
  children,
  className,
  figureKey,
  popoverAttributes,
}: LinkProps<{
  figureKey: string;
  popoverAttributes: PopoverAnchorAttributes;
}>) => (
  <a
    href={`/dict/${figureKey}`}
    {...popoverAttributes}
    className={`${className} ${popoverAttributes.className}`}
  >
    {children}
  </a>
);

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
