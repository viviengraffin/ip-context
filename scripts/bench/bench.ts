import { join as pathJoin } from "@std/path";
import { DIRNAME, readBenchmarkDirectory } from "../common.ts";

await readBenchmarkDirectory(pathJoin(DIRNAME, "benchmarks"));
