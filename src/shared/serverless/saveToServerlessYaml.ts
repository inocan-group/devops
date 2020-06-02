import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

import { dump, safeDump } from "js-yaml";

import { IServerlessConfig } from "common-types";
import { emoji } from "../ui";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

export async function saveToServerlessYaml(data: IServerlessConfig) {
  try {
    const filename = path.join(process.cwd(), "serverless.yml");
    console.log({ filename, data });
    const yamlData = dump(data);

    await writeFile(filename, yamlData, { encoding: "utf-8" });
  } catch (e) {
    console.log(chalk`- {red writing the {bold serverless.yml} file has failed!} ${emoji.poop}`);
    console.log(e.message);
    console.log(chalk`{dim ${e.stack}}`);
    process.exit();
  }
}
