import { existsSync, rmSync } from "node:fs";
import { build } from "esbuild";
import type { BuildOptions, SameShape } from "esbuild";

if (existsSync("dist")) {
  rmSync("dist", { recursive: true });
}

const BUILD_CONFIGS = [
  {
    entryPoints: ["src/browser.ts"],
    bundle: true,
    platform: "browser",
    outfile: "dist/ip-context.js",
  },
  {
    entryPoints: ["src/browser.ts"],
    bundle: true,
    platform: "browser",
    minify: true,
    outfile: "dist/ip-context.min.js",
  },
  {
    entryPoints: ["src/main.ts"],
    bundle: true,
    platform: "browser",
    minify: false,
    outfile: "dist/ip-context.es.js",
    format: "esm",
  },
  {
    entryPoints: ["src/main.ts"],
    bundle: true,
    platform: "browser",
    minify: true,
    outfile: "dist/ip-context.es.min.js",
    format: "esm",
  },
] as const satisfies SameShape<BuildOptions, BuildOptions>[];

async function buildConfigs() {
  for (const buildConfig of BUILD_CONFIGS) {
    await build(buildConfig);
  }
}

buildConfigs();
