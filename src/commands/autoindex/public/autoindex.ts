import * as chalk from "chalk";
import * as globby from "globby";

import { IDictionary, wait } from "common-types";
import { askHowToHandleMonoRepoIndexing, processFiles } from "../private/index";

import { getMonoRepoPackages } from "../../../shared";
import { join } from "path";

import { watch } from "chokidar";

/**
 * Finds all `index.ts` and `index.js` files and looks for the `#autoindex`
 * signature. If found then it _auto_-builds this file based on files in
 * the file's current directory
 */
export async function handler(argv: string[], opts: IDictionary): Promise<void> {
  const monoRepoPackages: false | string[] = getMonoRepoPackages(process.cwd());

  if (monoRepoPackages && !opts.dir) {
    const response: string = await askHowToHandleMonoRepoIndexing(monoRepoPackages);

    if (response === "ALL") {
      for await (const pkg of monoRepoPackages) {
        if (!opts.quiet) {
          console.log(chalk`Running {bold autoindex} for the {green ${pkg}}:`);
        }
        await handler(argv, { ...opts, dir: join(opts.dir || process.env.PWD, "packages", pkg), withinMonorepo: true });
      }
      return;
    } else {
      return handler(argv, {
        ...opts,
        dir: join(opts.dir || process.env.PWD, "packages", response),
        withinMonorepo: true,
      });
    }
  }

  const globInclude = opts.glob ? (opts.glob as string[]).concat("!node_modules") : false;
  const srcDir = opts.dir ? join(process.cwd(), opts.dir) : join(process.cwd(), "src");

  const globPattern = globInclude || [
    `${srcDir}/**/index.ts`,
    `${srcDir}/**/index.js`,
    `${srcDir}/**/private.ts`,
    `${srcDir}/**/private.js`,
  ];

  let watcherReady: boolean = false;

  if (opts.watch) {
    const watcher = watch(srcDir + "/**/*", {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    });
    const log = console.log.bind(console);
    watcher.on("ready", () => {
      log(chalk`- autoindex {italic watcher} has {bold {green started}} monitoring {blue ${srcDir}} for changes`);
      watcherReady = true;
    });
    watcher.on("add", async (path) => {
      // if (watcherReady) {
      //   log(chalk`- file added [ {blue ${path}} ]; re-running autoindex `);
      // }
      const paths = await globby(globPattern.concat("!node_modules"));
      processFiles(paths, { ...opts, quiet: true }).catch((e: Error) =>
        log(chalk`Error re-running autoindex (on {italic add} event): ${e.message}\n`, e.stack)
      );
    });
    watcher.on("unlink", async (path) => {
      const paths = await globby(globPattern.concat("!node_modules"));
      processFiles(paths, { ...opts, quiet: true }).catch((e: Error) =>
        log(chalk`Error re-running autoindex (on {italic unlink} event): ${e.message}\n`, e.stack)
      );
    });
    watcher.on("addDir", async (path) => {
      const paths = await globby(globPattern.concat("!node_modules"));
      processFiles(paths, { ...opts, quiet: true }).catch((e: Error) =>
        log(chalk`Error re-running autoindex (on {italic addDir} event): ${e.message}\n`, e.stack)
      );
    });
    watcher.on("unlinkDir", async (path) => {
      const paths = await globby(globPattern.concat("!node_modules"));
      processFiles(paths, { ...opts, quiet: true }).catch((e: Error) =>
        log(chalk`Error re-running autoindex (on {italic unlinkDir} event): ${e.message}\n`, e.stack)
      );
    });

    watcher.on("error", (e) => {
      log(`- An error occurred while watching autoindex paths: ${e.message}`);
    });
  } else {
    const paths = await globby(globPattern.concat("!node_modules"));
    console.log({ paths });

    const results = await processFiles(paths, opts);
    if (!opts.quiet) {
      console.log();
    }
  }
}
