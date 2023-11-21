import * as MdIcons from "react-icons/md";

import A from "~/components/ExternalLink";

export function ExternalDictionaryLinks({ figureId }: { figureId: string }) {
  return (
    <section className="">
      <ul className="text-sm">
        <li className="">
          <A
            href={`https://jisho.org/search/*${encodeURIComponent(figureId)}*`}
            className="group"
          >
            <span className="">
              <span className="inline-block align-middle px-2 py-1">
                <MdIcons.MdList />
              </span>
              words containing {figureId}
            </span>
            <span className="ml-2 opacity-70 group-hover:opacity-100 group-hover:underline text-xs">
              jisho.org
            </span>
          </A>
        </li>
        <li className="">
          <A
            href={`https://tatoeba.org/eng/sentences/search?query=${encodeURIComponent(
              figureId,
            )}&from=jpn&to=und`}
            className="group"
          >
            <span className="">
              <span className="inline-block align-middle px-2 py-1">
                <MdIcons.MdChatBubbleOutline />
              </span>
              sentences containing {figureId}
            </span>
            <span className="ml-2 opacity-70 group-hover:opacity-100 group-hover:underline text-xs">
              tatoeba.org
            </span>
          </A>
        </li>
        <li className="">
          <A
            href={`https://en.wiktionary.org/wiki/${encodeURIComponent(
              figureId,
            )}#Japanese`}
            className="group"
          >
            <span className="">
              <span className="inline-block align-middle px-2 py-1">
                <MdIcons.MdTranslate />
              </span>
              multilingual definitions
            </span>
            <span className="ml-2 opacity-70 group-hover:opacity-100 group-hover:underline text-xs">
              en.wiktionary.org
            </span>
          </A>
        </li>
        <li className="">
          <A
            href={`https://dictionary.goo.ne.jp/word/kanji/${encodeURIComponent(
              figureId,
            )}/`}
            className="group"
          >
            <span className="">
              <span className="inline-block align-middle px-2 py-1">和</span>
              in Japanese
            </span>
            <span className="ml-2 opacity-70 group-hover:opacity-100 group-hover:underline text-xs">
              dictionary.goo.ne.jp
            </span>
          </A>
        </li>
      </ul>
    </section>
  );
}
