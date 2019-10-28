import { getLocalHandlerInfo } from "../../shared/serverless/index";
import chalk from "chalk";
import { filesInfo, getAllFilesOfType } from "../../shared/file";
import { emoji } from "../../shared/ui";
import { IServerlessDeployMeta } from "./deploy-serverless";

/**
 * Tests whether webpack transpilation is needed
 * based on the timestamps of the source and transpiled files
 *
 * @param meta the meta information from CLI
 * @param fns optionally pass in a subset of functions which are being deployed
 */
export function isTranspileNeeded(meta: IServerlessDeployMeta, fns?: string[]) {
  const handlerInfo = getLocalHandlerInfo();
  const fnsNotTranspiled = handlerInfo.filter(
    i => i.sourceModified > i.webpackModified
  );

  if (fnsNotTranspiled.length > 0) {
    console.log(
      chalk`{grey - there are ${String(
        fnsNotTranspiled.length
      )} which have NOT been transpiled since the source was modified: {dim ${fnsNotTranspiled
        .map(i => i.fn)
        .join(", ")}}}`
    );
  } else {
    console.log(
      chalk`{grey - transpiled handler functions newer than handler source {green ${emoji.thumbsUp}}}`
    );
  }

  const handlerFns = handlerInfo.map(i => i.source);
  const sharedFnInfo = filesInfo(
    ...getAllFilesOfType("ts").filter(i => !handlerFns.includes(i))
  );

  const mostRecentShared = sharedFnInfo.reduce((agg: Date, fn) => {
    return fn.stats.mtime > agg ? fn.stats.mtime : agg;
  }, new Date("1970-01-01"));
  const fnsOlderThanShared = handlerInfo.filter(i =>
    mostRecentShared > i.webpackModified
      ? { fn: i.fn, source: i.source }
      : false
  );

  if (fnsOlderThanShared.length > 0) {
    console.log(
      chalk`{dim {yellow - there are {bold {red ${String(
        fnsOlderThanShared.length
      )}}} transpiled handler functions which are older than changes made to shared files ${
        emoji.angry
      } }}`
    );
  } else {
    console.log(
      chalk`{grey - transpiled handler functions newer than shared functions {green ${emoji.thumbsUp}}}`
    );
  }
  const needsTranspilation = new Set<string>(
    fnsOlderThanShared.map(i => i.source)
  );
  fnsNotTranspiled.forEach(i => needsTranspilation.add(i.source));

  return Array.from(needsTranspilation);
}
