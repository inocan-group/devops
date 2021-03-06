import { statSync, Stats } from "fs";
import path from "path";
import { DevopsError } from "~/errors";

export interface IFileInfo {
  /** the file with the _path_ removed. */
  file: string;
  /** the file with the _path_ and _extension_ removed. */
  fileName: string;
  /** the file's _extension_ */
  extension: string;
  /** the _path_ of the file (without the file). */
  path: string;
  /** the fully qualified _path_, _file_, and _extension_. */
  filePath: string;
  /** the stats of the file (from **Node**'s fs.stat function). */
  stats: Stats;
}

/**
 * Get's file info from an array of files (using Node's `stat` operation).
 *
 * @param files the list of files to **stat**. The files will automatically
 * be associated with the current working directory unless the filenames start
 * with a `/`.
 */
export function filesInfo(...files: string[]): IFileInfo[] {
  let rememberFile: string | undefined;
  try {
    return files.reduce((agg, filePath: string) => {
      rememberFile = filePath;

      const stats = statSync(
        filePath.slice(0, 1) !== "/" ? path.join(process.cwd(), filePath) : filePath
      );

      const pathParts = filePath.split("/");
      const file = pathParts.pop() || "";
      const filepath = pathParts.slice(0, -1).join("/");

      const nameParts = file.split(".");
      const fileName = nameParts.slice(0, -1).join(".");
      const extension = nameParts.pop() || "";

      agg.push({ filePath, fileName, file, path: filepath, extension, stats });
      return agg;
    }, [] as IFileInfo[]);
  } catch (error) {
    throw new DevopsError(
      `Attempt to get info/stat from the file "${rememberFile}" [ ${path.join(
        process.cwd(),
        rememberFile || ""
      )} ] failed [ call included request for ${files.length} files ]: ${error.message}`,
      "do-devops/filesInfo"
    );
  }
}
