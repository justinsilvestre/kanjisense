import { getHeadingsMeanings } from "~/features/dictionary/getHeadingsMeanings";

export function DictionaryHeadingMeanings({
  headingsMeanings,
}: {
  headingsMeanings: ReturnType<typeof getHeadingsMeanings>;
}) {
  return (
    <div>
      {headingsMeanings.currentCharacter ? (
        <h1>{headingsMeanings.currentCharacter.join("; ")}</h1>
      ) : null}
      {headingsMeanings.componentHistoricalMeaning ? (
        <h1>{headingsMeanings.componentHistoricalMeaning}</h1>
      ) : null}
      {headingsMeanings.componentMnemonic ? (
        <h1>
          <div className="text-gray-500">component mnemonic:</div>
          {headingsMeanings.componentMnemonic.text}
          {headingsMeanings.componentMnemonic.reference ? (
            <>
              {" "}
              ({headingsMeanings.componentMnemonic.referenceTypeText}{" "}
              {headingsMeanings.componentMnemonic.reference})
            </>
          ) : null}
        </h1>
      ) : null}
      {headingsMeanings.obsoleteCharacter ? (
        <h1>
          <div className="text-gray-500">historical character meaning:</div>
          {headingsMeanings.obsoleteCharacter.join("; ")}
        </h1>
      ) : null}
    </div>
  );
}