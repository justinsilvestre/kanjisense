import { PropsWithChildren } from "react";

export function G({ g, bold }: { g: string; bold?: boolean }) {
  return bold ? (
    <>
      ⟨<b>{g}</b>⟩
    </>
  ) : (
    <>⟨{g}⟩</>
  );
}
export function B({ children }: PropsWithChildren) {
  return (
    <strong>
      <u>{children}</u>
    </strong>
  );
}
