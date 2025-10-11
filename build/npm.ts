import { join as pathJoin } from "@std/path";
import { build } from "@deno/dnt";
import { DIRNAME, ENTRYPOINT, NPM, PKGNAME, VERSION } from "./common.ts";
import { emptyDirSync } from "@std/fs";

emptyDirSync(NPM);

build({
  entryPoints: [ENTRYPOINT],
  outDir: NPM,
  test: false,
  shims: {
    deno: true,
  },
  package: {
    name: PKGNAME,
    version: VERSION,
    description:
      "TypeScript library to have datas for network context or an IPv4/IPv6 address",
    licence: "MIT",
    author: "viviengraffin",
    repository: {
      type: "git",
      url: "git+https://github.com/viviengraffin/ip-context",
    },
    keywords: [
      "ipv4",
      "ipv6",
      "subnet",
    ],
  },
  postBuild() {
    Deno.copyFileSync(
      pathJoin(DIRNAME, "LICENCE"),
      pathJoin(NPM, "LICENCE"),
    );
    Deno.copyFileSync(
      pathJoin(DIRNAME, "README.md"),
      pathJoin(NPM, "README.md"),
    );
  },
});
