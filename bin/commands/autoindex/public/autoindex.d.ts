import { IDictionary } from "common-types";
/**
 * Finds all `index.ts` and `index.js` files and looks for the `#autoindex`
 * signature. If found then it _auto_-builds this file based on files in
 * the file's current directory
 */
export declare function handler(argv: string[], opts: IDictionary): Promise<void>;