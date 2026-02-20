import { PropsWithChildren, ReactNode } from "react";

export default function CollapsibleInfoSection({
  heading,
  children,
  defaultOpen,
}: PropsWithChildren<{ heading: ReactNode; defaultOpen?: boolean }>) {
  return (
    <details className="pb-2" open={defaultOpen || false}>
      <summary className="mb-2 cursor-pointer">{heading}</summary>

      {children}
    </details>
  );
}
