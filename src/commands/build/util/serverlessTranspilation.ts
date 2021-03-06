import chalk from "chalk";
import matcher from "matcher";
import { IDictionary } from "common-types";

import { hasDevDependency } from "~/shared/npm";
import {
  askForFunctions,
  getLocalServerlessFunctionsFromServerlessYaml,
} from "~/shared/serverless";
import { getValidServerlessHandlers } from "~/shared/ast";
import { DevopsError } from "~/errors";

async function filterOutInvalidFunction(fns: string[]) {
  const validFns = Object.keys((await getLocalServerlessFunctionsFromServerlessYaml()) || {});
  const results: {
    valid: string[];
    invalid: string[];
    explicit: string[];
    implicit: string[];
  } = {
    valid: [],
    invalid: [],
    /** shows fn names which were NOT a direct match but are a soft match */
    explicit: [],
    implicit: [],
  };

  for (const f of fns) {
    if (f.includes("*") || f.includes("!")) {
      // explicit soft match
      results.explicit = [...results.explicit, ...matcher(validFns, [f])];
    } else if (validFns.includes(f)) {
      results.valid.push(f);
    } else {
      // implicit soft match
      results.implicit = [...results.explicit, ...matcher(validFns, [f, `${f}*`])];
      results.invalid.push(f);
    }
  }

  return results;
}

/**
 * Handles any needed transpilation for a **Serverless** project
 */
export async function serverlessTranspilation(c: IDictionary) {
  const { argv, opts, config, tooling } = c;
  let fns: string[];
  const validity = await filterOutInvalidFunction(argv);

  fns =
    opts.interactive || argv.length > 0
      ? await askForFunctions(
          validity.invalid.length > 0
            ? chalk`Some of the functions you stated were invalid [ {grey ${validity.invalid.join(
                ", "
              )}} ].\nChoose the functions from the list below:`
            : "Which functions should be transpiled?",
          [...validity.valid, ...validity.explicit, ...validity.implicit]
        )
      : argv;

  if (opts.force || fns.length > 0) {
    if (hasDevDependency("serverless-webpack")) {
      throw new DevopsError(
        "You have installed the 'serverless-webpack' plugin which indicates that transpilation will be done by the plugin at \"deploy\" time but you are forcing transpilation at build time.",
        "do-devops/invalid-transpilation"
      );
    }
    if (fns.length > 0) {
      console.log(
        chalk`{grey - transpiling {bold ${String(
          fns.length
        )}} handler functions {italic prior} to building {blue serverless.yml}}`
      );
    }
    fns = fns.length > 0 ? fns : getValidServerlessHandlers();
    await tooling({ fns, opts });
    console.log();
  } else {
    console.log(
      chalk`{grey - {bold Note:} you're using {bold "${config.buildTool}}" for build/bundling which means that by default your TS\nwill not be transpiled to JS during a build. The build process is entirely focused on\nbuilding the "serverless.yml" file. If you want to force transpilation you can do so\nwith the {blue --force} switch.}`
    );
    console.log(chalk`\n{grey - {bold Note:} for most people using this config, {blue yarn do watch} will be the most efficient way
to ensure that you always have transpiled code when you {italic deploy}. If you do not then 
the {italic deploy} command will detect this and transpile at deploy-time.}\n`);
  }
}
