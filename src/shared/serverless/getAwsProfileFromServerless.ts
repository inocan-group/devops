import { isServerless } from "./isServerless";
import { DevopsError } from "../errors";
import chalk from "chalk";
import { emoji } from "../ui";
import { IServerlessConfig } from "common-types";
import { getServerlessYaml } from "./getServerlessYaml";
import { buildServerlessMicroserviceProject } from "./index";

/**
 * Returns the **AWS Profile** which is used as part
 * of the serverless configuration.
 *
 * If the project is detected to be a `serverless-microservice`
 * derived project then it will build the configuration first if
 * the serverless.yml is missing.
 */
export async function getAwsProfileFromServerless() {
  const sls = await isServerless();
  let config: IServerlessConfig;
  if (!sls) {
    throw new DevopsError(
      `Attempt to get the AWS profile from the serverless config failed because this project is not setup as a serverless project!`,
      "devops/not-allowed"
    );
  }

  if (
    (!sls.hasServerlessConfig || !sls.hasProviderSection) &&
    sls.isUsingTypescriptMicroserviceTemplate
  ) {
    if (!sls.hasServerlessConfig) {
      console.log(
        chalk`- it appears that the {green serverless.yml} {italic does not} exist; will build from {italic serverless-microservice} config ${
          emoji.robot
        }`
      );
    } else {
      console.log(
        chalk`- it appears that the {green serverless.yml} does not have the {bold provider} section; will build from {italic serverless-microservice} config ${
          emoji.robot
        }`
      );
    }

    await buildServerlessMicroserviceProject();

    // const stats = await buildServerlessMicroserviceProject();
    // console.log(
    //   chalk`- built the {italic microservice} configuration into the serverless.yml file ${
    //     emoji.rocket
    //   }`
    // );
    // console.log(
    //   chalk`- {grey ${stats.functions} functions found, ${
    //     stats.stepFunctions
    //   } step functions}`
    // );
  }

  try {
    config = await getServerlessYaml();
    if (!config.provider) {
      console.log(
        chalk`- the {red serverless.yaml} file doesn't have a {bold provider} section! ${
          emoji.poop
        }`
      );
      console.log("- this section must exist before you can deploy\n");
      process.exit();
    }
    return config.provider.profile;
  } catch (e) {
    console.log(chalk`- {red serverless.yml} file is missing! ${emoji.poop}`);
    console.log(`- this file must exist before you can deploy\n`);
    process.exit();
  }
}