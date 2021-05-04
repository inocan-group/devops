import type { Stats } from "node:fs";

/**
 * Optional configuration for the `file/write()` function
 */
export interface IWriteOptions {
  /**
   * By default when things are stringified, they are done with the aim of keeping file
   * size small but if you want it to be more readable you can turn this flag on and
   * the JSON string will have CR and spacing built into it.
   */
  pretty?: boolean;
  /**
   * if set to `true` it will add a numeric offset to the filename to avoid collisions
   */
  offsetIfExists?: boolean;

  /**
   * Allow the file to be overwritten if it already exists.
   */
  allowOverwrite?: boolean;
}

export interface IFileWithStats {
  file: string;
  stats: Stats;
}

/**
 * Options for all the base directory functions provided by `do-devops`
 */
export interface IDirectoryOptions {
  /** a directory path that will be joined into the root path the function starts at */
  offset?: string;
  /**
   * if you want to work with a "relative path" from some known "base dir" this can be
   * passed in to get the relative path.
   */
  base?: string;
}
