import { ScrollRestoration, Scripts, LiveReload } from "@remix-run/react";
import type { PropsWithChildren } from "react";

import {
  AboutLink,
  BrowseCharactersLink,
  BrowseComponentsLink,
  BrowseSoundComponentsLink,
} from "./AppLink";

export default function DictionaryLayout({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`relative mx-auto flex min-h-screen  max-w-5xl flex-col gap-4 bg-white py-4 max-lg:px-2 ${
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
        <ul>
          <li>
            <BrowseComponentsLink>components</BrowseComponentsLink>
          </li>
          <li>
            <BrowseCharactersLink>characters</BrowseCharactersLink>
          </li>
          <li>
            <BrowseSoundComponentsLink>
              sound components
            </BrowseSoundComponentsLink>
          </li>
          <li>
            <AboutLink>about Kanjisense</AboutLink>
          </li>
        </ul>
      </footer>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </div>
  );
}
