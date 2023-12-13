import * as MdIcons from "react-icons/md";

import A from "~/components/ExternalLink";

function LinkListItem({
  href,
  children,
  icon,
  className,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) {
  const urlBetweenColonAndSlash = href.match(/:\/\/(.+?)\//)?.[1];
  return (
    <li className={`leading-loose ${className}`}>
      <A href={href} className="group p-3">
        <span className="">
          <span className="inline-block pr-3 align-middle">{icon}</span>
          {children}
        </span>
        <span className="ml-2 text-xs opacity-70 group-hover:underline group-hover:opacity-100">
          {urlBetweenColonAndSlash}
        </span>
      </A>
    </li>
  );
}

export function ExternalDictionaryLinks({
  figureId,
  className,
  figureIsStandaloneCharacter,
}: {
  figureId: string;
  className?: string;
  figureIsStandaloneCharacter?: boolean;
}) {
  return (
    <section className={className}>
      <ul className=" pl-1">
        {figureIsStandaloneCharacter ? (
          <LinkListItem
            href={`https://jisho.org/search/*${encodeURIComponent(figureId)}*`}
            icon={<MdIcons.MdList />}
          >
            words containing {figureId}
          </LinkListItem>
        ) : null}
        {figureIsStandaloneCharacter ? (
          <LinkListItem
            href={`https://tatoeba.org/eng/sentences/search?query=${encodeURIComponent(
              figureId,
            )}&from=jpn&to=und`}
            icon={<MdIcons.MdChatBubbleOutline />}
          >
            sentences containing {figureId}
          </LinkListItem>
        ) : null}
        <LinkListItem
          href={`https://en.wiktionary.org/wiki/${encodeURIComponent(
            figureId,
          )}#Japanese`}
          icon={<MdIcons.MdTranslate />}
        >
          multilingual definitions
        </LinkListItem>
        {figureIsStandaloneCharacter ? (
          <LinkListItem
            href={`https://dictionary.goo.ne.jp/word/kanji/${encodeURIComponent(
              figureId,
            )}/`}
            icon={
              <span className="inline-block align-middle text-sm" role="img">
                和
              </span>
            }
          >
            in Japanese
          </LinkListItem>
        ) : null}
      </ul>
    </section>
  );
}
