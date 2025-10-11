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
