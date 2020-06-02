import {} from "..";

import { AWS_REGIONS, IServerlessAccountInfo } from "common-types";
import {
  emoji,
  getAwsIdentityFromProfile,
  getAwsProfile,
  getAwsProfileList,
  getPackageJson,
  getServerlessYaml,
  userHasAwsProfile,
} from "../../../shared";

import inquirer = require("inquirer");
import chalk = require("chalk");

export async function askForAccountInfo(config: Partial<IServerlessAccountInfo> = {}): Promise<IServerlessAccountInfo> {
  const pkgJson = await getPackageJson();
  const profiles = await getAwsProfileList();
  const profileMessage = "choose a profile from your AWS credentials file";

  if (
    config.profile &&
    config.name &&
    config.accountId &&
    config.region &&
    config.pluginsInstalled &&
    (config.logForwarding || !Object.keys(pkgJson.devDependencies).includes("serverless-log-forwarding"))
  ) {
    return config as IServerlessAccountInfo;
  }

  const baseProfileQuestion = {
    name: "profile",
    message: "Choose a profile from your AWS credentials file",
    default: config.profile,
    when: () => !config.profile,
  };
  const profileQuestion: inquirer.Question | inquirer.ListQuestion = profiles
    ? {
        ...baseProfileQuestion,
        ...{
          type: "list",
          choices: Object.keys(profiles),
        },
      }
    : { ...baseProfileQuestion, ...{ type: "input" } };

  let questions: Array<inquirer.Question | inquirer.ListQuestion> = [
    {
      type: "input",
      name: "name",
      message: "What is the Service Name for this repo?",
      default: config.name || pkgJson.name,
      when: () => !config.name,
    },
    profileQuestion,
  ];

  let answers: Partial<IServerlessAccountInfo> = await inquirer.prompt(questions);
  const merged = {
    ...config,
    ...answers,
  };

  if (!userHasAwsProfile(merged.profile)) {
    console.log(
      chalk`- you are deploying with the {green ${merged.profile} AWS profile but you do not have this defined yet! ${emoji.angry}`
    );
    console.log(chalk`{grey - AWS profiles must be added in {blue ~/.aws/credentials}}`);
    console.log(
      chalk`{grey - if you want to override the default behavior you can state a different profile with the {blue --profile} tag}`
    );
    process.exit();
  }

  if (!merged.profile) {
    console.log(chalk`- you have not provided an AWS {bold profile}; exiting ...`);
    process.exit();
  }
  if (!(await userHasAwsProfile(merged.profile))) {
    console.log(
      chalk`- you do {bold NOT} have the credentials for the profile {blue ${merged.profile}}! Please add this before\n  trying again. ${emoji.angry}\n`
    );
    console.log(chalk`{grey - the credentials file is located at {blue ~/.aws/credentials}}\n`);

    process.exit();
  }

  const awsProfile = await getAwsProfile(merged.profile as string);

  if (merged.region) {
    config.region = awsProfile.region;
  }
  if (!merged.accountId) {
    console.log(chalk`- looking up the Account ID for the given profile`);
    try {
      merged.accountId = (await getAwsIdentityFromProfile(awsProfile)).accountId;
    } catch (e) {}
  }

  questions = [
    {
      type: "input",
      name: "accountId",
      message: "what is the Amazon Account ID which you are deploying to?",
      when: () => !merged.accountId,
    },
    {
      type: "list",
      name: "region",
      message: "what is the region you will be deploying to?",
      choices: AWS_REGIONS,
      default: merged.region || awsProfile.region || "us-east-1",
      when: () => !config.region,
    },
  ];
  let plugins: { pluginsInstalled: string[] };
  try {
    const sls = await getServerlessYaml();
    plugins = { pluginsInstalled: sls.plugins };
  } catch (e) {
    plugins = { pluginsInstalled: [] };
  }
  answers = {
    ...plugins,
    ...answers,
    ...(await inquirer.prompt(questions)),
  };

  return merged as IServerlessAccountInfo;
}
