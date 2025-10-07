import { emptyDirSync } from "@std/fs";
import { join as pathJoin } from "@std/path";
import { build } from "esbuild";
import type { BuildOptions, SameShape } from "esbuild";

const DIST = pathJoin(import.meta.dirname!, "dist") satisfies string;
const IIFE_GLOBAL_NAME = "ip_context" as const satisfies string;
const ENTRYPOINT = "src/main.ts" as const satisfies string;

emptyDirSync(DIST);

const BUILD_CONFIGS = [
  {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    platform: "browser",
    outfile: pathJoin(DIST, "ip-context.js"),
    format: "iife",
    globalName: IIFE_GLOBAL_NAME,
  },
  {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    platform: "browser",
    minify: true,
    outfile: pathJoin(DIST, "ip-context.min.js"),
    format: "iife",
    globalName: IIFE_GLOBAL_NAME,
  },
  {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    platform: "browser",
    minify: false,
    outfile: pathJoin(DIST, "ip-context.es.js"),
    format: "esm",
  },
  {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    platform: "browser",
    minify: true,
    outfile: pathJoin(DIST, "ip-context.es.min.js"),
    format: "esm",
  },
] as const satisfies SameShape<BuildOptions, BuildOptions>[];

async function buildConfigs() {
  for (const buildConfig of BUILD_CONFIGS) {
    await build(buildConfig);
  }
}

buildConfigs();
