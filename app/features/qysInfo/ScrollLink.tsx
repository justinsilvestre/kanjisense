import { Link } from "@remix-run/react";
import { PropsWithChildren } from "react";

export function ScrollLink({
  hash,
  children,
}: PropsWithChildren<{ hash: string }>) {
  return <Link to={`#${hash}`}>{children}</Link>;
}
