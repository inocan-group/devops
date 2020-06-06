import { IExportableFiles, removeExtension } from "./index";

import { exportsAsEsm } from "../../../shared";

/**
 * Given a set of files and directories that are exportable, this function will
 * boil this down to just the string needed for the autoindex block.
 */
export function namedExports(exportable: IExportableFiles) {
  const contentLines: string[] = [];
  exportable.files.forEach((file) => {
    contentLines.push(`export * from "./${exportsAsEsm() ? removeExtension(file) + ".js" : removeExtension(file)}";`);
  });
  exportable.dirs.forEach((dir) => {
    contentLines.push(`export * from "./${dir}/index${exportsAsEsm() ? ".js" : ""}";`);
  });

  return contentLines.join("\n");
}
