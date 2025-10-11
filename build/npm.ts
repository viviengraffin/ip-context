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
    licence: "MIT",
    author: "viviengraffin",
    repository:{
      type:"git",
      url:"git+https://github.com/viviengraffin/ip-context"
    }
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
