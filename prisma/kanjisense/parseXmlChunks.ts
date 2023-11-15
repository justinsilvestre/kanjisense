import type { ReadStream } from "fs";
import type { Readable } from "stream";

import Emittery from "emittery";
import type { SaxesTagPlain } from "saxes";
import { SaxesParser } from "saxes";

export interface SaxesEvent {
  type: "opentag" | "text" | "closetag" | "end";
  tag?: SaxesTagPlain;
  text?: string;
}

/**
 * Generator method.
 * Parses one chunk of the iterable input (Readable stream in the string data reading mode).
 * @see https://nodejs.org/api/stream.html#stream_event_data
 * @param iterable Iterable or Readable stream in the string data reading mode.
 * @returns Array of SaxesParser events
 * @throws Error if a SaxesParser error event was emitted.
 */
async function* parseChunk(
  iterable: Iterable<string> | Readable,
): AsyncGenerator<SaxesEvent[], void, undefined> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const saxesParser = new SaxesParser<{}>();
  let error;
  saxesParser.on("error", (_error) => {
    error = _error;
  });

  // As a performance optimization, we gather all events instead of passing
  // them one by one, which would cause each event to go through the event queue
  let events: SaxesEvent[] = [];
  saxesParser.on("opentag", (tag) => {
    events.push({
      type: "opentag",
      tag,
    });
  });

  saxesParser.on("text", (text) => {
    events.push({
      type: "text",
      text,
    });
  });

  saxesParser.on("closetag", (tag) => {
    events.push({
      type: "closetag",
      tag,
    });
  });

  for await (const chunk of iterable) {
    saxesParser.write(chunk as string);
    if (error) {
      if (
        (error as unknown as { message: string } | null)?.message?.includes(
          "undefined entity",
        )
      ) {
        // console.error(error);
      } else throw error;
    }

    yield events;
    events = [];
  }

  yield [
    {
      type: "end",
    },
  ];
}

export async function parseXmlChunks(
  readStream: ReadStream,
  {
    onOpenTag,
    onCloseTag,
    onText,
    onChunkParsed,
  }: {
    onOpenTag(node: { name: string }): Promise<void>;
    onText(text: string): Promise<void>;
    onCloseTag(node: { name: string }): Promise<void>;
    onChunkParsed(): Promise<void>;
  },
) {
  const eventEmitter = new Emittery();
  eventEmitter.on("text", async (text) => {
    await new Promise<void>((resolve) => {
      onText(text).then(resolve);
    });
  });
  eventEmitter.on("opentag", async (node) => {
    await new Promise<void>((resolve) => {
      onOpenTag(node).then(resolve);
    });
  });
  eventEmitter.on("closetag", async (node) => {
    await new Promise<void>((resolve) => {
      onCloseTag(node).then(resolve);
    });
  });
  console.log("parsing chunks");

  // Read stream chunks
  for await (const saxesEvents of parseChunk(readStream) ?? []) {
    // Process batch of events
    for (const saxesEvent of saxesEvents ?? []) {
      // Emit ordered events and process them in the event handlers strictly one-by-one
      // See https://github.com/sindresorhus/emittery#emitserialeventname-data
      await eventEmitter.emitSerial(
        saxesEvent.type,
        saxesEvent.tag || saxesEvent.text,
      );
    }
    await onChunkParsed();
  }
}
