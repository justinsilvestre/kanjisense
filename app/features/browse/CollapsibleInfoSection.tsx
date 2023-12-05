import { PropsWithChildren, ReactNode } from "react";

export default function CollapsibleInfoSection({
  heading,
  children,
  defaultOpen,
}: PropsWithChildren<{ heading: ReactNode; defaultOpen?: boolean }>) {
  return (
    <details open={defaultOpen || false}>
      <summary className=" cursor-pointer">{heading}</summary>

      {children}
    </details>
  );
}
