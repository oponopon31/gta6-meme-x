// main.ts — gta6-meme-x-01 entry (meme v2: "CHAPTER 13").
//
// What this does:
//   Copies POST.json from the bot directory into the output directory,
//   byte for byte. The house reads the X post named in POST.json and
//   hands its first picture and its text to the judge.
//
// Inputs:
//   POST.json in MAKEFUN_BOT_DIR (or the current working directory).
// Outputs:
//   POST.json in MAKEFUN_OUTPUT_DIR (or ./out).
//
// Deterministic: no network, no randomness, no clock reads. Node 22,
// standard library only.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// An env var that is set but empty counts as unset.
function envOr(value: string | undefined, fallback: string): string {
  return value !== undefined && value !== "" ? value : fallback;
}

// Resolve the two directories first so a relative env value still
// behaves the same no matter where the process is started from.
const botDir = resolve(envOr(process.env.MAKEFUN_BOT_DIR, process.cwd()));
const outDir = resolve(
  envOr(process.env.MAKEFUN_OUTPUT_DIR, join(process.cwd(), "out")),
);

const source = join(botDir, "POST.json");

// Validate before copying: the file must be JSON with a "url" string,
// so a typo or a half-written placeholder fails loudly here instead of
// reaching the judge as a silent bad entry.
const parsed: unknown = JSON.parse(readFileSync(source, "utf8"));
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string" ||
  (parsed as { url: string }).url === ""
) {
  throw new Error(`POST.json in ${botDir} has no usable "url" field`);
}

// Create the output directory (no-op when it already exists), then
// copy the file unchanged.
mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, "POST.json"));
