import jsrJson from "../jsr.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };
import { join as pathJoin } from "@std/path";
import { DIRNAME } from "./common.ts";
import { writeFileSync } from "node:fs";

const { argv, spawnSync } = Bun;

const version = argv.pop();

jsrJson.version = version;
packageJson.version = version;

const packageJsonContent = JSON.stringify(packageJson, null, 2);
const jsrJsonContent = JSON.stringify(jsrJson, null, 2);

writeFileSync(pathJoin(DIRNAME, "package.json"), packageJsonContent, {
  encoding: "utf-8",
});
writeFileSync(pathJoin(DIRNAME, "jsr.json"), jsrJsonContent, {
  encoding: "utf-8",
});

spawnSync({
  cmd: ["bun", "fmt"],
});
