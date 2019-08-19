import { IServerlessConfig } from "common-types";
import { IServerlessAccountInfo } from "../@types";
import path from "path";
import { DevopsError } from "../errors";
import { asyncExec } from "async-shelljs";

/**
 * Gets the typescript configuration file for serverless
 * projects which use the `typescript-microservice` yeoman
 * template and generates a `serverless.yml` file from it.
 */
export async function getMicroserviceConfig(
  accountInfo: IServerlessAccountInfo
) {
  const cliFile = path.join(process.env.PWD, "serverless-config", "build.ts");
  try {
    const config = await asyncExec(
      `yarn ts-node ${cliFile} '${JSON.stringify(accountInfo)}'`,
      { silent: true }
    );
    return config;
  } catch (e) {
    throw new DevopsError(
      `Problem getting the microservice config file: ${e.message}`,
      "devops/missing-config"
    );
  }
}