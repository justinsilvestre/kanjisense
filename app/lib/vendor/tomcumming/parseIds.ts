// from https://github.com/tomcumming/parse-ids

/*
  MIT License

  Copyright (c) 2016 Tom Cumming

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

export const compositions = "⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻";

export type IDS =
  | Character
  | HTMLCode
  | LeftToRight
  | AboveToBelow
  | LeftToMiddleAndRight
  | AboveToMiddleAndBelow
  | FullSurround
  | SurroundFromAbove
  | SurroundFromBelow
  | SurroundFromLeft
  | SurroundFromUpperLeft
  | SurroundFromUpperRight
  | SurroundFromLowerLeft
  | Overlaid;

export interface Character {
  type: "char";
  char: string;
}

export interface HTMLCode {
  type: "html";
  code: string;
}

export interface LeftToRight {
  type: "⿰";
  left: IDS;
  right: IDS;
}

export interface AboveToBelow {
  type: "⿱";
  above: IDS;
  below: IDS;
}

export interface LeftToMiddleAndRight {
  type: "⿲";
  left: IDS;
  middle: IDS;
  right: IDS;
}

export interface AboveToMiddleAndBelow {
  type: "⿳";
  above: IDS;
  middle: IDS;
  below: IDS;
}

export interface FullSurround {
  type: "⿴";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromAbove {
  type: "⿵";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromBelow {
  type: "⿶";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromLeft {
  type: "⿷";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromUpperLeft {
  type: "⿸";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromUpperRight {
  type: "⿹";
  outside: IDS;
  inside: IDS;
}

export interface SurroundFromLowerLeft {
  type: "⿺";
  outside: IDS;
  inside: IDS;
}

export interface Overlaid {
  type: "⿻";
  back: IDS;
  front: IDS;
}

/**
 * Return immediate children of an IDS node
 * @param ids The node to search
 * @returns List of child nodes
 */
export function children(ids: IDS): IDS[] {
  switch (ids.type) {
    case "⿰": {
      const leftToRight = <LeftToRight>ids;
      return [leftToRight.left, leftToRight.right];
    }
    case "⿱": {
      const aboveToBelow = <AboveToBelow>ids;
      return [aboveToBelow.above, aboveToBelow.below];
    }
    case "⿲": {
      const leftToMiddleAndRight = <LeftToMiddleAndRight>ids;
      return [
        leftToMiddleAndRight.left,
        leftToMiddleAndRight.middle,
        leftToMiddleAndRight.right,
      ];
    }
    case "⿳": {
      const aboveToMiddleAndBelow = <AboveToMiddleAndBelow>ids;
      return [
        aboveToMiddleAndBelow.above,
        aboveToMiddleAndBelow.middle,
        aboveToMiddleAndBelow.below,
      ];
    }
    case "⿴": {
      const fullSurround = <FullSurround>ids;
      return [fullSurround.outside, fullSurround.inside];
    }
    case "⿵": {
      const surroundsFromAbove = <SurroundFromAbove>ids;
      return [surroundsFromAbove.outside, surroundsFromAbove.inside];
    }
    case "⿶": {
      const surroundFromBelow = <SurroundFromBelow>ids;
      return [surroundFromBelow.inside, surroundFromBelow.outside];
    }
    case "⿷": {
      const surroundFromLeft = <SurroundFromLeft>ids;
      return [surroundFromLeft.outside, surroundFromLeft.inside];
    }
    case "⿸": {
      const surroundFromUpperLeft = <SurroundFromUpperLeft>ids;
      return [surroundFromUpperLeft.outside, surroundFromUpperLeft.inside];
    }
    case "⿹": {
      const surroundFromUpperRight = <SurroundFromUpperRight>ids;
      return [surroundFromUpperRight.outside, surroundFromUpperRight.inside];
    }
    case "⿺": {
      const surroundFromLowerLeft = <SurroundFromLowerLeft>ids;
      if (
        surroundFromLowerLeft.outside.type === "char" &&
        (surroundFromLowerLeft.outside.char === "⻌" ||
          surroundFromLowerLeft.outside.char === "辶")
      ) {
        return [surroundFromLowerLeft.inside, surroundFromLowerLeft.outside];
      }
      return [surroundFromLowerLeft.outside, surroundFromLowerLeft.inside];
    }
    case "⿻": {
      const overlaid = <Overlaid>ids;
      return [overlaid.back, overlaid.front];
    }
    default:
      return [];
  }
}

/**
 * Flatten an IDS tree
 * @param ids The node to flatten
 * @returns List of all child nodes (or self)
 */
export function flatten(ids: IDS): (Character | HTMLCode)[] {
  switch (ids.type) {
    case "char":
      return [<Character>ids];
    case "html":
      return [<HTMLCode>ids];
    case "⿰":
    case "⿱":
    case "⿲":
    case "⿳":
    case "⿴":
    case "⿵":
    case "⿶":
    case "⿷":
    case "⿸":
    case "⿹":
    case "⿺":
    case "⿻":
      return children(ids)
        .map(flatten)
        .reduce((l, r) => l.concat(r), []);
    default:
      throw new Error("Invalid type: " + JSON.stringify(ids));
  }
}

/**
 * Parse an Ideographic Descrizption Sequences
 * @param str The string to parse (must not contain white space)
 * @returns IDS structure or null if the parse failed
 */
export function parse(str: string): IDS | null {
  const parsed = parsePart(str);
  if (parsed !== null && parsed.rest === "") return parsed.ids;
  else return null;
}

function parsePart(str: string): { ids: IDS; rest: string } | null {
  if (str.length === 0) return null;

  const nextCharacter = nextChar(str);
  if (!nextCharacter) return null;

  const { next, rest } = nextCharacter;
  switch (next) {
    case "&":
      return parseHTMLCode(rest);
    case "⿰":
      return parseLeftToRight(rest);
    case "⿱":
      return parseAboveToBelow(rest);
    case "⿲":
      return parseLeftToMiddleAndRight(rest);
    case "⿳":
      return parseAboveToMiddleAndBelow(rest);
    case "⿴":
      return parseFullSurround(rest);
    case "⿵":
      return parseSurroundFromAbove(rest);
    case "⿶":
      return parseSurroundFromBelow(rest);
    case "⿷":
      return parseSurroundFromLeft(rest);
    case "⿸":
      return parseSurroundFromUpperLeft(rest);
    case "⿹":
      return parseSurroundFromUpperRight(rest);
    case "⿺":
      return parseSurroundFromLowerLeft(rest);
    case "⿻":
      return parseOverlaid(rest);
    default:
      // parse single unicode char
      return {
        ids: { type: "char", char: next },
        rest: rest,
      };
  }
}

function parseHTMLCode(str: string): { ids: HTMLCode; rest: string } | null {
  const end = str.indexOf(";");
  if (end === -1) return null;
  else
    return {
      ids: { type: "html", code: str.substr(0, end) },
      rest: str.substr(end + 1),
    };
}

function parseLeftToRight(
  str: string
): { ids: LeftToRight; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿰", left: parsed.ids[0], right: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseAboveToBelow(
  str: string
): { ids: AboveToBelow; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿱", above: parsed.ids[0], below: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseLeftToMiddleAndRight(
  str: string
): { ids: LeftToMiddleAndRight; rest: string } | null {
  const parsed = parseParts(str, 3);
  if (parsed === null) return null;
  else
    return {
      ids: {
        type: "⿲",
        left: parsed.ids[0],
        middle: parsed.ids[1],
        right: parsed.ids[2],
      },
      rest: parsed.rest,
    };
}

function parseAboveToMiddleAndBelow(
  str: string
): { ids: AboveToMiddleAndBelow; rest: string } | null {
  const parsed = parseParts(str, 3);
  if (parsed === null) return null;
  else
    return {
      ids: {
        type: "⿳",
        above: parsed.ids[0],
        middle: parsed.ids[1],
        below: parsed.ids[2],
      },
      rest: parsed.rest,
    };
}

function parseFullSurround(
  str: string
): { ids: FullSurround; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿴", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromAbove(
  str: string
): { ids: SurroundFromAbove; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿵", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromBelow(
  str: string
): { ids: SurroundFromBelow; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿶", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromLeft(
  str: string
): { ids: SurroundFromLeft; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿷", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromUpperLeft(
  str: string
): { ids: SurroundFromUpperLeft; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿸", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromUpperRight(
  str: string
): { ids: SurroundFromUpperRight; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿹", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseSurroundFromLowerLeft(
  str: string
): { ids: SurroundFromLowerLeft; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿺", outside: parsed.ids[0], inside: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseOverlaid(str: string): { ids: Overlaid; rest: string } | null {
  const parsed = parseParts(str, 2);
  if (parsed === null) return null;
  else
    return {
      ids: { type: "⿻", back: parsed.ids[0], front: parsed.ids[1] },
      rest: parsed.rest,
    };
}

function parseParts(
  str: string,
  count: number
): { ids: IDS[]; rest: string } | null {
  var parts: IDS[] = [];
  for (var i = 0; i < count; i++) {
    const parsed = parsePart(str);
    if (parsed === null) return null;
    parts.push(parsed.ids);
    str = parsed.rest;
  }
  return { ids: parts, rest: str };
}

/**
 * Helper to split first char from string
 * @param str - Non-empty string to split
 * @returns - object with next and rest, or null
 */
export function nextChar(str: string): { next: string; rest: string } | null {
  for (const c of str) return { next: c, rest: str.slice(c.length) };
  return null;
}
