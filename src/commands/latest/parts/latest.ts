import chalk from "chalk";
import { git } from "~/shared/git";
import { emoji } from "~/shared/ui";
import { getPackageJson } from "~/shared/npm";
import { DoDevopsHandler } from "~/@types/command";

export const handler: DoDevopsHandler = async ({ opts }) => {
  const g = git();

  const latest = (await g.tags()).latest;
  const status = await g.status();
  const pkg = getPackageJson();
  if (!pkg) {
    console.log(
      `- the "latest" command provides you with the latest version of the repo in the {italic current} directory`
    );
    console.log(
      `   however it appears you're in directory without a package.json file! ${emoji.shocked}\n`
    );
    console.log(
      chalk`- please move to a new directory or pass in the optional '--repo [repo]' parameter to name a repo`
    );

    process.exit();
  }
  const pkgVersion = pkg.version;

  const aheadBehind =
    status.ahead === 0 && status.behind === 0
      ? ""
      : `\n- Your local repo is ${
          status.ahead > 0
            ? `ahead by ${status.ahead} commits`
            : `behind by ${status.behind} commits`
        }`;

  const changes =
    status.not_added.length === 0 && status.modified.length === 0
      ? ""
      : chalk`\n- Locally you have {yellow ${
          status.not_added.length > 0 ? status.not_added.length : "zero"
        }} {italic new} files and {yellow ${
          status.modified.length
        }} {italic modified} files`;

  const conflicts =
    status.conflicted.length === 0
      ? ""
      : chalk`- ${emoji.poop} There are {bold {red ${status.conflicted.length}}} conflicted files!`;

  if (opts.verbose) {
    console.log(
      chalk`The remote repo's latest version is {bold {yellow ${latest}}}; {blue package.json} is ${
        pkgVersion === latest ? "the same" : `is {bold ${pkgVersion}}`
      }.${aheadBehind}${changes}${conflicts}`
    );

    console.log("\n");
  } else {
    console.log(latest);
  }
  return latest;
};
