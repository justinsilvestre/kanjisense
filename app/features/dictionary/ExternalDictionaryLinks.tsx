import * as MdIcons from "react-icons/md";

import A from "~/components/ExternalLink";

export function ExternalDictionaryLinks({
  figureId,
  className,
}: {
  figureId: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <ul className=" pl-1">
        <li className=" leading-loose">
          <A
            href={`https://jisho.org/search/*${encodeURIComponent(figureId)}*`}
            className="group p-3"
          >
            <span className="">
              <span className="inline-block pr-3 align-middle">
                <MdIcons.MdList />
              </span>
              words containing {figureId}
            </span>
            <span className="ml-2 text-xs opacity-70 group-hover:underline group-hover:opacity-100">
              jisho.org
            </span>
          </A>
        </li>
        <li className=" leading-loose">
          <A
            href={`https://tatoeba.org/eng/sentences/search?query=${encodeURIComponent(
              figureId,
            )}&from=jpn&to=und`}
            className="group p-3"
          >
            <span className="">
              <span className="inline-block pr-3 align-middle">
                <MdIcons.MdChatBubbleOutline />
              </span>
              sentences containing {figureId}
            </span>
            <span className="ml-2 text-xs opacity-70 group-hover:underline group-hover:opacity-100">
              tatoeba.org
            </span>
          </A>
        </li>
        <li className=" leading-loose">
          <A
            href={`https://en.wiktionary.org/wiki/${encodeURIComponent(
              figureId,
            )}#Japanese`}
            className="group p-3"
          >
            <span className="">
              <span className=" inline-block pr-3 align-middle">
                <MdIcons.MdTranslate />
              </span>
              multilingual definitions
            </span>
            <span className="ml-2  text-xs opacity-70 group-hover:underline group-hover:opacity-100">
              en.wiktionary.org
            </span>
          </A>
        </li>
        <li className=" leading-loose">
          <A
            href={`https://dictionary.goo.ne.jp/word/kanji/${encodeURIComponent(
              figureId,
            )}/`}
            className="group p-3"
          >
            <span className="">
              <span
                className="inline-block pr-3 align-middle text-sm"
                role="img"
              >
                和
              </span>
              in Japanese
            </span>
            <span className="ml-2 text-xs opacity-70 group-hover:underline group-hover:opacity-100">
              dictionary.goo.ne.jp
            </span>
          </A>
        </li>
      </ul>
    </section>
  );
}
