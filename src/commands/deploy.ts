import {
  getConfig,
  runHooks,
  getOptions,
  emoji,
  isServerless,
  isNpmPackage
} from "../shared";
import { OptionDefinition } from "command-line-usage";
import { IDictionary } from "common-types";
import { IDoDeployConfig } from "./defaults";

export async function description(opts: IDictionary) {
  const base = `Deployment services that for {bold Serverless} or {bold NPM} publishing.\n\n`;
  const { deploy: config } = await getConfig();
  const detect = await detectTarget();

  const possibleTargets = {
    serverless: `This project was detected to be a {bold Serverless} project. Unless you state explicitly that you want to use {bold NPM} targetting it will use Serverless.`,
    npm: `This project was detected to be a {bold NPM} project. Unless you state explicitly that you want to use "serverless" targetting it will use NPM. `,
    both: `This project was detected to have both {bold Serverless} functions {italic and} be an {bold NPM} library. By default the deploy command will assume you want to use {bold Serverless} deployment but the {italic options} listed below allow for both targets.`,
    bespoke: "not implemented yet"
  };

  return base + possibleTargets[detect.target as keyof typeof possibleTargets];
}

export type IDetectedTarget = {
  detected: IDoDeployConfig["target"] | "both";
  override: boolean;
  target: IDoDeployConfig["target"] | "both";
};

/**
 * Detects the type of
 */
async function detectTarget(opts?: IDictionary): Promise<IDetectedTarget> {
  const { deploy: config } = await getConfig();
  const override = opts ? opts.target : undefined;
  const serverless = isServerless();
  const npm = await isNpmPackage();
  const detected: IDoDeployConfig["target"] | "both" =
    serverless && !npm
      ? "serverless"
      : npm && !serverless
      ? "npm"
      : npm && serverless
      ? "both"
      : "unknown";

  return {
    detected,
    override: override && override !== detected ? override : false,
    target: override || detected
  };
}

export const syntax =
  "do deploy [fn1] [fn2] <options>\n\n{dim Note: {italic stating particular functions is {italic optional} and if excluded will result in a full deployment of all functions.}}";

export async function options(opts: IDictionary): Promise<OptionDefinition[]> {
  const { deploy: config } = await getConfig();
  const target = opts.target || config.target;

  return [
    {
      name: "interactive",
      alias: "i",
      type: Boolean,
      group: "serverlessDeploy",
      description: `allow interactive choices for the functions you want to deploy`
    },
    {
      name: "target",
      alias: "t",
      typeLabel: "<target>",
      type: String,
      group: "deploy",
      description: "manually override the project target (serverless, npm)"
    }
  ];
}

/**
 * **Deploy Handler**
 *
 * The _deploy_ command is used when you want to push your changes
 * to an environment where they will be used. This can mean different
 * things based on context and this handler will support the following
 * deployment scenarios:
 *
 * 1. Deploy to `npm` (aka, publish)
 * 2. Deploy to a serverless environment by leveraging the **Serverless** framework
 *
 * Over time we may add other targets for deployment.
 */
export async function handler(argv: string[], opts: any) {
  const { deploy, global } = await getConfig();
  const target = opts.target || deploy.target;
  console.log(opts);

  if (!target) {
    console.log(
      `  - ${emoji.poop} You must state a valid "target" [ ${
        target ? target + "{italic not valid}" : "no target stated"
      } ]`
    );
  }

  await runHooks(deploy.preDeployHooks);
  const helper = (await import(`./deploy-helpers/${target}-deploy`)).default;
  await helper(deploy, global);
}
