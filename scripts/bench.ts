import { join as pathJoin } from "@std/path";
import { readdirSync } from "node:fs";
import { DIRNAME } from "./common.ts";


async function readBenchmarkDirectory(directory: string) {
    const files = readdirSync(directory, { withFileTypes: true })
                    .filter(file=>![".","..","lib.ts"].includes(file.name));

    
    for(const file of files) {
        if (file.isDirectory()) {
            await readBenchmarkDirectory(pathJoin(directory, file.name));
        }
        else if (file.isFile() && file.name.endsWith(".ts")) {
            await import(pathJoin(directory, file.name));
        }
    }
}

await readBenchmarkDirectory(pathJoin(DIRNAME, "benchmarks"));