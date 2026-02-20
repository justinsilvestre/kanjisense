import { PropsWithChildren } from "react";

export default function A({
  href,
  children,
  className = "hover:text-orange-600 underline",
}: PropsWithChildren<{ href: string; className?: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
