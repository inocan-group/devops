import globby from "globby";
import { getConfig, emoji } from "../../shared";
import { pathJoin } from "common-types";
import chalk from "chalk";
import { askForSpecificTests, SpecificTestReason } from "./askForSpecificTests";
import { testName } from "./testName";
import { asyncExec } from "async-shelljs";

const tsExecution = async (fns: string[]) => {
  return asyncExec(
    `yarn mocha --no-timeouts --require ts-node/register --exit ${fns.join(
      " "
    )}`
  );
};

const mocha = async (args: string[]) => {
  const config = await getConfig();
  const allTests = await globby([
    pathJoin(config.test.testDirectory, config.test.testPattern)
  ]);
  let selectedTests: string[] = [];
  if (args.length > 0) {
    args.forEach(searchTerm => {
      const found = allTests.filter(t => t.includes(searchTerm));
      if (found.length === 0) {
        console.log(
          chalk`- the {italic.blue ${searchTerm}} search term found no matches in the available tests`
        );
      } else {
        selectedTests = selectedTests.concat(...found);
      }
    });
    if (selectedTests.length === 0) {
      const selectedTests = await askForSpecificTests(
        SpecificTestReason.noResultsFound,
        allTests
      );
    }
    if (selectedTests.length === 0) {
      console.log(chalk`- no tests matched; valid tests include:\n`);
      console.log(
        chalk`{dim ${allTests
          .map(t => testName(t, config.test.testPattern).padEnd(20))
          .join("\t")}}`
      );
    } else {
      console.log(
        chalk`- ${emoji.run} running {bold ${String(
          selectedTests.length
        )}} ({italic of} {bold ${String(
          allTests.length
        )}}) mocha tests: {grey ${selectedTests
          .map(t => testName(t, config.test.testPattern))
          .join(", ")}}`
      );
    }
  } else {
    selectedTests = allTests;
    if (selectedTests.length === 0) {
      console.log(
        chalk`- There were {red.bold NO} mocha unit tests in the "${config.test.testDirectory}" directory [ pattern: {grey.italic ${config.test.testPattern}} ]\n`
      );
      process.exit();
    } else {
      console.log(
        chalk`- ${emoji.run} running {italic all} {bold ${String(
          selectedTests.length
        )}} mocha tests: {grey ${selectedTests
          .map(t => testName(t, config.test.testPattern))
          .join(", ")}}`
      );
    }
  }
  console.log();
  await tsExecution(selectedTests).catch(e => {
    console.log(
      chalk`\n- ${emoji.angry}  tests completed but {red errors} were encountered`
    );
    process.exit();
  });
  console.log(chalk`- ${emoji.party}  all tests completed successfully\n`);
  process.exit();
};

export default mocha;