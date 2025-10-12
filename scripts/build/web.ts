import { emptyDirSync } from "@std/fs";
import { join as pathJoin } from "@std/path";
import { build } from "esbuild";
import type { BuildOptions, SameShape } from "esbuild";
import { DIST, ENTRYPOINT, IIFE_GLOBAL_NAME } from "../common.ts";

emptyDirSync(DIST);

const BUILD_CONFIGS = [
  {
    entryPoints: [ENTRYPOINT],
    bundle: true,
    platform: "browser",
    outfile: pathJoin(DIST, "ip-context.js"),
    format: "iife",
    sourcemap: "inline",
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
    sourcemap: "inline",
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
