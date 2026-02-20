import { PropsWithChildren } from "react";
import { Link } from "react-router";

export function ScrollLink({
  hash,
  children,
}: PropsWithChildren<{ hash: string }>) {
  return <Link to={`#${hash}`}>{children}</Link>;
}
