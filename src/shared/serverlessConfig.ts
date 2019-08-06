import { IServerlessConfig } from "common-types";
import { safeLoad } from "js-yaml";
import path from "path";

/**
 * Get the `serverless.yml` file in the root of the project; if
 * the file does not exist then return _false_
 */
export async function getServerlessYml(): Promise<IServerlessConfig | false> {
  try {
    const config: IServerlessConfig = safeLoad(
      path.join(process.cwd(), "serverless.yml")
    );
    return config;
  } catch (e) {
    return false;
  }
}

/**
 * For people using the `typescript-microservice` template,
 * this function will interactively ask a user questions
 * so that the serverless configuration can be built.
 */
export async function askAboutConfig() {
  //
}
