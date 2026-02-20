import fs from "fs";
import readline from "readline";

export type LineReader = readline.Interface;

export async function getLineReader(filename: string): Promise<LineReader> {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    // recognize all instances of CR LF
    // ('\r\n') in input as a single line break.
    crlfDelay: Infinity,
  });
  return rl;
}
export async function forEachLine(
  filename: string,
  callback: (line: string) => void,
) {
  const rl = await getLineReader(filename);
  for await (const line of rl) {
    callback(line);
  }
}
