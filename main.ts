// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself. This program does nothing about the
// post except hand its address to the house: it reads POST.json from
// the repository root and writes the very same bytes to the output
// directory, where the gate picks the file up. Nothing this program
// writes is judged.
//
// The grader runs `node /bot/main.ts` with /bot read-only and /output
// a fresh mount. Outside the grader the same run is:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "POST.json");
const targetPath = join(outDir, "POST.json");

let postBytes: Buffer;
try {
  postBytes = readFileSync(sourcePath);
} catch (error) {
  console.error(`cannot read ${sourcePath}: ${(error as Error).message}`);
  process.exit(1);
}

// Fail loudly on a malformed file instead of handing the gate garbage:
// the house refuses any POST.json that is not a JSON object naming an
// X post address, so there is no point copying it through.
try {
  const parsed: unknown = JSON.parse(postBytes.toString("utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("POST.json must be a JSON object");
  }
  if (typeof (parsed as { url?: unknown }).url !== "string") {
    throw new Error("POST.json must carry a string url field");
  }
} catch (error) {
  console.error(`invalid ${sourcePath}: ${(error as Error).message}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

try {
  writeFileSync(targetPath, postBytes);
} catch (error) {
  console.error(`cannot write ${targetPath}: ${(error as Error).message}`);
  process.exit(1);
}
