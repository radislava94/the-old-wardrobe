import { readFile } from "node:fs/promises";
import path from "node:path";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal" | "italic";
};

function asArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

let fonts: Promise<OgFont[]> | null = null;

/** Playfair Display (OFL), full Cyrillic and Latin, so every listing title draws. */
export function loadOgFonts(): Promise<OgFont[]> {
  fonts ??= (async () => {
    const dir = path.join(process.cwd(), "lib/og/fonts");
    const [bold, italic] = await Promise.all([
      readFile(path.join(dir, "PlayfairDisplay-Bold.ttf")),
      readFile(path.join(dir, "PlayfairDisplay-Italic.ttf")),
    ]);
    return [
      { name: "Playfair Display", data: asArrayBuffer(bold), weight: 700, style: "normal" },
      { name: "Playfair Display", data: asArrayBuffer(italic), weight: 400, style: "italic" },
    ];
  })();
  return fonts;
}
