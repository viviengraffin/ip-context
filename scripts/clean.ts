import { DIST, DOCS, NODE_MODULES, NPM, removeIfExists } from "./common.ts";

removeIfExists(DIST);
removeIfExists(NPM);
removeIfExists(NODE_MODULES);
removeIfExists(DOCS);
