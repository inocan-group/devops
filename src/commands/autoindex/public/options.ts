import { OptionDefinition } from "command-line-usage";
import chalk = require("chalk");

export const options: OptionDefinition[] = [
  {
    name: "add",
    type: String,
    group: "autoindex",
    description: `adds additional glob patterns to look for`,
  },
  {
    name: "glob",
    type: String,
    group: "autoindex",
    description: `replaces the glob file matching pattern with your own (however "node_modules" still excluded)`,
  },
  {
    name: "dir",
    type: String,
    group: "autoindex",
    description: `by default will look for files in the "src" directory but you can redirect this to a different directory`,
  },
  {
    name: "quiet",
    alias: "q",
    type: Boolean,
    group: "autoindex",
    description: chalk`stops most output to {italic stdout}; changes are still output`,
  },
  {
    name: "watch",
    alias: "w",
    type: Boolean,
    group: "autoindex",
    description: chalk`watches for changes and runs {italic autoindex} when detected`,
  },
];
