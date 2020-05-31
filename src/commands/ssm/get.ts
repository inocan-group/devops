import * as chalk from "chalk";

import { DevopsError, consoleDimensions } from "../../shared";

import { CommandLineOptions } from "command-line-args";
import { SSM } from "aws-ssm";
import { format } from "date-fns";
import { table } from "table";

export async function execute(options: CommandLineOptions) {
  const profile: string = options.profile;
  const region: string = options.region;
  const secrets: string[] = options.params;
  const nonStandardPath: boolean = options.nonStandardPath;
  const { width } = await consoleDimensions();

  if (!region) {
    throw new DevopsError(
      `Getting SSM secrets requires an ${chalk.bold(
        "AWS Region"
      )} and none could be deduced. You can explicitly state this by adding "--region XYZ" to the command.`
    );
  }

  if (!profile) {
    throw new DevopsError(
      `Getting SSM secrets requires an ${chalk.bold(
        "AWS Profile"
      )} and none could be deduced. You can explicitly state this by adding "--profile XYZ" to the command.`
    );
  }

  console.log(`- Getting SSM details for: ${chalk.italic.grey.bold(secrets.join(", "))}\n`);

  const tableConfig = {
    columns: {
      0: { width: 30, alignment: "left" },
      1: { width: width > 125 ? 60 : width > 100 ? 40 : 35 },
      2: { width: 8, alignment: "center" },
      3: { width: 16, alignment: "center" },
    },
  };
  const ssm = new SSM({ profile, region });

  for await (const secret of secrets) {
    let tableData = [
      [
        chalk.yellow.bold("Path"),
        chalk.yellow.bold("ARN"),
        chalk.yellow.bold("Version"),
        chalk.yellow.bold("LastUpdated"),
      ],
    ];
    const data = await ssm.get(secret, { decrypt: true, nonStandardPath });
    tableData.push([data.path, data.arn, String(data.version), format(data.lastUpdated, "dd MMM, yyyy")]);
    console.log(table(tableData, tableConfig as any));
    console.log(chalk.yellow.bold("VALUE:\n"));
    console.log(String(data.value));
    console.log();
  }

  // let content;
  // if (width > 130) {
  //   content = table(tableData, tableConfig as any);
  // } else if (width > 115) {
  //   delete tableConfig.columns["3"];
  //   content = table(tableData.map(i => i.slice(0, 3)), tableConfig as any);
  // } else {
  //   delete tableConfig.columns["2"];
  //   delete tableConfig.columns["3"];
  //   content = table(tableData.map(i => i.slice(0, 2)), tableConfig as any);
  // }
  // console.log(content);
}
