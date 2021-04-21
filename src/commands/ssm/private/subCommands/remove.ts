import chalk from "chalk";
import * as process from "process";

import { CommandLineOptions } from "command-line-args";
import { SSM } from "aws-ssm";
import {
  askForStage,
  determineProfile,
  determineRegion,
  emoji,
  getAwsIdentityFromProfile,
  getAwsProfile,
} from "../../../../shared";
import { completeSsmName } from "..";

export async function execute(argv: string[], options: CommandLineOptions) {
  let [name] = argv;
  const profile = await determineProfile({
    cliOptions: options,
    interactive: true,
  });
  const profileInfo = await getAwsProfile(profile);
  const identity = await getAwsIdentityFromProfile(profileInfo);
  const region =
    options.region ||
    profileInfo.region ||
    (await determineRegion({ cliOptions: options, interactive: true }));
  const stage =
    process.env.AWS_STAGE ||
    process.env.NODE_ENV ||
    (await askForStage(
      chalk`SSM variables should be namespaced to a STAGE, what stage are you setting for {dim [ profile: {italic ${profile}}, region: {italic ${region}}, account: {italic ${identity.accountId}} ]}?`
    ));

  if (!profile || !region) {
    console.log(chalk`{red - missing information!}`);
    console.log(
      chalk`To remove SSM params the AWS {italic profile} and {italic region} must be stated. These could {bold not} be determined so exiting.`
    );
    console.log(
      chalk`{dim note that the easiest way to get an explicit profile/region is to use the {bold --profile} and {bold --region} switches on the command line.}\n`
    );

    process.exit(1);
  }

  const ssm = new SSM({
    profile,
    region,
  });

  name = await completeSsmName(name, options);

  if (!options.force) {
    console.log(
      chalk`{red - you must use force option to delete an parameter!}`
    );
    process.exit(1);
  }
  ssm.delete(name);

  console.log(
    chalk`\n- ${emoji.party} the {bold {yellow ${name}}} variable was deleted successfully to the {italic ${region}} region {dim [ profile: {italic ${profile}}, region: {italic ${region}}, account: {italic ${identity.accountId}} ]}\n`
  );
  console.log();
  process.exit();
}
