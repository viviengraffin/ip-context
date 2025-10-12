import { join as pathJoin } from "@std/path";
import denoJson from "../deno.json" with { type: "json" };
import { existsSync } from "@std/fs";

export const DIRNAME = pathJoin(import.meta.dirname!, "..") satisfies string;
export const DIST = pathJoin(DIRNAME, "dist") satisfies string;
export const NPM = pathJoin(DIRNAME, "npm") satisfies string;
export const NODE_MODULES = pathJoin(DIRNAME, "node_modules") satisfies string;
export const DOCS = pathJoin(DIRNAME, "docs") satisfies string;

export const IIFE_GLOBAL_NAME = "ip_context" satisfies string;
export const ENTRYPOINT = pathJoin(DIRNAME, "src/main.ts") satisfies string;

export const VERSION = denoJson.version;
export const PKGNAME = denoJson.name;

export function removeIfExists(path: string) {
    if(existsSync(path)) {
        Deno.removeSync(path,{ recursive: true })
    }
}
