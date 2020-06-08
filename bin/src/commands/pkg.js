"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.aliases = exports.syntax = exports.options = exports.description = void 0;
const chalk = require("chalk");
const shared_1 = require("../shared");
const async_shelljs_1 = require("async-shelljs");
const deploy_helpers_1 = require("./deploy-helpers");
function description(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return chalk `Package up resources for {bold Serverless} publishing but do not actually {italic deploy}.`;
    });
}
exports.description = description;
exports.options = [
    {
        name: "dir",
        alias: "d",
        type: String,
        typeLabel: "<directory>",
        group: "pkg",
        description: chalk `by default assets are saved to the {italic .serverless} directory but you can change this to a different directory if you like.`,
    },
    {
        name: "validate",
        type: Boolean,
        group: "pkg",
        description: chalk `after the package is completed the {bold cloudformation} template can be validated`,
    },
];
exports.syntax = "do pkg <options>";
exports.aliases = ["package"];
/**
 * **Package Handler**
 *
 * The `package` command is used in **Serverless** projects to build all of
 * the _deployable_ assets but without actually deploying.
 */
function handler(argv, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pkg } = yield shared_1.getConfig();
        const detect = yield deploy_helpers_1.detectTarget();
        const target = detect.target;
        const stage = yield shared_1.determineStage(opts);
        const region = yield shared_1.determineRegion(opts);
        if (!target) {
            console.log(`  - ${"\uD83D\uDCA9" /* poop */} You must state a valid "target" [ ${target ? target + "{italic not valid}" : "no target stated"} ]`);
        }
        console.log(chalk `- {bold Serverless} {italic packaging} for {bold ${stage}} stage ${"\uD83C\uDF89" /* party */}`);
        const command = `sls package --stage ${stage} --region ${region} ${opts.dir ? `--package ${opts.dir}` : ""}`;
        console.log(chalk `{dim {italic ${command}}}\n`);
        yield async_shelljs_1.asyncExec(command, { silent: opts.quiet ? true : false });
        const directory = opts.dir ? opts.dir : ".serverless";
        console.log(chalk `\n{bold {green - Packaging is complete!}} ${"\uD83D\uDE80" /* rocket */}`);
        console.log(chalk `- the assets can all be found in the {italic {blue ${directory}} directory.}`);
        yield async_shelljs_1.asyncExec(`ls -l ${directory}`);
        if (opts.validate) {
            console.log(chalk `\n- validating the {bold cloudformation} {italic create} template ${"\uD83D\uDC40" /* eyeballs */}`);
            const validateCmd = `aws cloudformation validate-template --template-body file://${directory}/cloudformation-template-create-stack.json`;
            try {
                console.log(chalk `{dim    ${validateCmd}}`);
                yield async_shelljs_1.asyncExec(validateCmd);
            }
            catch (e) {
                console.log(chalk `{red - Error validating the {italic create} template!}`);
            }
            console.log(chalk `\n- validating the {bold cloudformation} {italic update} template ${"\uD83D\uDC40" /* eyeballs */}`);
            const validateUpdate = `aws cloudformation validate-template --template-body file://${directory}/cloudformation-template-update-stack.json`;
            try {
                console.log(chalk `{dim    ${validateUpdate}}`);
                yield async_shelljs_1.asyncExec(validateUpdate);
            }
            catch (e) {
                console.log(chalk `{red - Error validating the {italic update} template!} ${"\uD83D\uDCA9" /* poop */}`);
            }
        }
        // await runHooks(deploy.preDeployHooks);
    });
}
exports.handler = handler;