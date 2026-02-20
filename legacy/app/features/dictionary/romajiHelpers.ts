const ROMAJI_REGEX =
  /^(([kstnmhgzdbpzjf]{1,2}y?|[rywj]|sh|ch|tch|cch)?[aeiouāēīōū][hnm]?[-.']?)+$/i;

const AMBIGUOUS_N = /(?<=[aeiou])n(?=[aeiouy])/g;

export function couldBeRomaji(str: string) {
  return ROMAJI_REGEX.test(str);
}

const DOUBLE_VOWELS_AT_END = /aa|ii|uu|ee|oo|ou$/;

export function toModifiedHepburn(strRaw: string) {
  const str = strRaw
    .replace(/[.-\s]/g, "")
    .toLowerCase()
    .trim();
  const options: string[] = [];
  const strContainsNPlusVowelOrY = AMBIGUOUS_N.test(str);

  const hepburn = replaceNonstandardConsonants(
    str
      .toLowerCase()
      .replace(/ah|aa|â/g, "ā")
      .replace(/ih|ii|î/g, "ī")
      .replace(/uh|uu|û/g, "ū")
      .replace(/eh|ee|ê/g, "ē")
      .replace(/oh|ô|oo|ou/g, "ō"),
  );
  options.push(hepburn);
  if (strContainsNPlusVowelOrY) {
    options.push(hepburn.replace(AMBIGUOUS_N, "n'"));
  }

  if (DOUBLE_VOWELS_AT_END.test(str)) {
    const hepburnForDoubleVowels = replaceNonstandardConsonants(
      replaceNonstandardLongVowelsExceptPotentialOkuriganaBoundaries(str),
    );
    options.push(hepburnForDoubleVowels);

    if (strContainsNPlusVowelOrY) {
      options.push(hepburnForDoubleVowels.replace(AMBIGUOUS_N, "n'"));
    }
  }
  return options;
}

function replaceNonstandardConsonants(str: string) {
  return str
    .replace(/s[iīî]/g, "shi")
    .replace(/t[iīî]/g, "chi")
    .replace(/t[uū]/g, "tsu")
    .replace(/d[uū]/g, "zu")
    .replace(/[zd][iīî]/g, "ji")
    .replace(/[zjd]y/g, "j")
    .replace(/ty/g, "ch")
    .replace(/sy/g, "sh")
    .replace(/ty/g, "ch")
    .replace(/m([bpm])/g, "n$1")
    .replace(/h[uū]/g, "fu")
    .replace(/cch/g, "tch");
}
function replaceNonstandardLongVowelsExceptPotentialOkuriganaBoundaries(
  str: string,
) {
  return str
    .replace(/ah|aa(?<!$)|â/g, "ā")
    .replace(/ih|ii(?<!$)|î/g, "ī")
    .replace(/uh|uu(?<!$)|û/g, "ū")
    .replace(/eh|ee(?<!$)|ê/g, "ē")
    .replace(/oh|ô|oo(?<!$)|ou(?<!$)/g, "ō");
}
