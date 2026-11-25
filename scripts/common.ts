import { join as pathJoin } from "@std/path";
import denoJson from "../package.json" with { type: "json" };
import { existsSync, readdirSync, rmSync } from "node:fs";

export const DIRNAME = pathJoin(import.meta.dirname!, "..") satisfies string;
export const DIST = pathJoin(DIRNAME, "dist-web") satisfies string;
export const NPM = pathJoin(DIRNAME, "npm") satisfies string;
export const NODE_MODULES = pathJoin(DIRNAME, "node_modules") satisfies string;
export const DOCS = pathJoin(DIRNAME, "docs") satisfies string;

export const IIFE_GLOBAL_NAME = "ip_context" satisfies string;
export const ENTRYPOINT = pathJoin(DIRNAME, "src/main.ts") satisfies string;

export const VERSION = denoJson.version;
export const PKGNAME = denoJson.name;

export function removeIfExists(path: string) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true });
  }
}

export async function readBenchmarkDirectory(directory: string) {
  const files = readdirSync(directory, { withFileTypes: true }).filter(
    (file) => ![".", "..", "lib.ts"].includes(file.name),
  );

  for (const file of files) {
    if (file.isDirectory()) {
      await readBenchmarkDirectory(pathJoin(directory, file.name));
    } else if (file.isFile() && file.name.endsWith(".ts")) {
      await import(pathJoin(directory, file.name));
    }
  }
}
