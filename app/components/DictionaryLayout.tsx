import { ScrollRestoration, Scripts, LiveReload } from "@remix-run/react";
import type { PropsWithChildren } from "react";

export default function DictionaryLayout({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`relative mx-auto py-4 flex  min-h-screen max-w-5xl flex-col gap-4 bg-white max-lg:px-2 ${
        className || ""
      }`}
    >
      <header className="flex flex-row flex-wrap  bg-slate-200 p-2 sm:gap-4">
        <h1 className="w-full self-center text-4xl font-bold text-slate-900 sm:w-auto sm:text-5xl">
          <span className=" text-gray-700">kanji</span>
          <span className=" text-blue-900">sense</span>
        </h1>
      </header>
      {children}
      <footer className="flex flex-row flex-wrap  bg-gray-200 p-2 sm:gap-4">
        <h1 className="w-full self-center text-4xl font-bold text-slate-900 sm:w-auto sm:text-5xl">
          <span className=" text-gray-700">kanji</span>
          <span className=" text-blue-900">sense</span>
        </h1>
      </footer>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </div>
  );
}
