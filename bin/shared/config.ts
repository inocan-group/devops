import { readFileSync, existsSync } from "fs";
import chalk from "chalk";
import { writeConfig, writeWholeFile } from "./writeDefaultConfig";
import * as defaults from "../commands/defaults";
import { IDoRootConfig, IDoConfig } from "../commands/defaults";

export type IDoConfigSections = keyof typeof defaults;

/**
 * **getConfigFilename**
 *
 * returns the path to the configuration filename
 */
export function getConfigFilename() {
  return `${process.env.PWD}/do.config.ts`;
}

/**
 * **getCurrentConfig**
 *
 * returns the current configuration as a `IDoConfig` object
 */
export function getCurrentConfig() {
  return JSON.parse(
    readFileSync(getConfigFilename(), { encoding: "utf-8" })
  ) as IDoConfig;
}

/**
 * **getConfigSectionNames**
 *
 * returns a list of configuration section names; this includes
 * the `root` section.
 */
export function getConfigSectionNames(): string[] {
  return Object.keys(defaults).filter((section: IDoConfigSections) => {
    return typeof defaults[section] === "function";
  });
}

/**
 * **getDefaultForConfigSection**
 *
 * returns the default config for a given section
 */
export function getDefaultForConfigSection(section: IDoConfigSections) {
  return defaults[section]();
}

/**
 * **getDefaultConfig**
 *
 * Returns the full _default_ configuration; use `getConfigSection()` if you
 * only want a particular section.
 */
export function getDefaultConfig() {
  return getConfigSectionNames().reduce(
    (acc, section: IDoConfigSections) => {
      if (section === "root") {
        acc = { ...acc, ...getDefaultForConfigSection(section as any) };
      } else {
        acc = { ...acc, [section]: getDefaultForConfigSection(section) };
      }
      return acc;
    },
    {} as Partial<IDoConfig>
  ) as IDoConfig;
}

/**
 * **getConfig**
 *
 * Gets the current configuration based on the `do.config.ts` file.
 */
export async function getConfig() {
  const filename = getConfigFilename();
  let config: IDoConfig;
  if (!existsSync(filename)) {
    console.log(`- configuration file not found [ %s ]`, chalk.grey(process.env.PWD));
    writeWholeFile();
    console.log(
      `- default configuration was written to "%s" in project root`,
      chalk.bold.italic("do.config.ts")
    );
    console.log(
      `- please review/edit configuration first before running additional commands\n`
    );
    process.exit();
  }

  try {
    config = await import(filename);
  } catch (e) {
    console.log(
      "- \ud83d\udca9  Problem importing the config file: %s",
      chalk.grey(e.message)
    );
    console.log(
      "- Either edit the file to the correct %s or delete the config and it will be recreated with the default values\n",
      chalk.italic("typing")
    );
    process.exit();
  }
}
