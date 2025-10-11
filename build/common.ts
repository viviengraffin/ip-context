import { join as pathJoin } from "@std/path";
import denoJson from "../deno.json" with { type: "json" };

export const DIRNAME = pathJoin(import.meta.dirname!, "..") satisfies string;
export const DIST = pathJoin(DIRNAME, "dist") satisfies string;
export const NPM = pathJoin(DIRNAME, "npm") satisfies string;
export const IIFE_GLOBAL_NAME = "ip_context" satisfies string;
export const ENTRYPOINT = pathJoin(DIRNAME, "src/main.ts") satisfies string;

export const VERSION = denoJson.version;
export const PKGNAME = denoJson.name;
