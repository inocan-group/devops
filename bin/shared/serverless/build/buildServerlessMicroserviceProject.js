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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const index_2 = require("./index");
const chalk_1 = __importDefault(require("chalk"));
const index_3 = require("../../ast/index");
const createFunctionEnum_1 = require("./createFunctionEnum");
const async_shelljs_1 = require("async-shelljs");
const file_1 = require("../../file");
const os = __importStar(require("os"));
const createWebpackEntryDictionaries_1 = require("./createWebpackEntryDictionaries");
/**
 * Builds a `serverless.yml` file from the configuration
 * available in the `/serverless-config` directory.
 *
 * The key requirement here is that the `accountInfo` hash is
 * built out. This information will be gathered from the
 * following sources (in this order):
 *
 * 1. look within the `serverless.yml` for info (if it exists)
 * 2. ask the user for the information (saving values as default for next time)
 */
function buildServerlessMicroserviceProject() {
    return __awaiter(this, void 0, void 0, function* () {
        let stage = "starting";
        const knownAccountInfo = Object.assign({}, (yield index_1.getAccountInfoFromServerlessYaml()));
        const accountInfo = yield index_1.askForAccountInfo(knownAccountInfo);
        file_1.saveYamlFile("serverless-config/account-info.yml", accountInfo);
        console.log(chalk_1.default `{bold {yellow - Starting SERVERLESS build process}}`);
        console.log(chalk_1.default `- The account info for {bold ${accountInfo.name} [ }{dim ${accountInfo.accountId}} {bold ]} has been gathered`);
        const inlineFiles = index_3.getValidServerlessHandlers();
        console.log(chalk_1.default `{grey - handler functions [ {bold ${String(inlineFiles.length)}} ] have been identified}`);
        yield index_2.createInlineExports(inlineFiles);
        console.log(chalk_1.default `{grey - The inline function configuration file [ {bold {italic serverless-config/functions/inline.ts}} ] has been configured}`);
        yield createFunctionEnum_1.createFunctionEnum(inlineFiles);
        console.log(chalk_1.default `{grey - The enumeration and type [ {bold {italic src/@types/functions.ts}} ] for the available functions has been configured }`);
        yield createWebpackEntryDictionaries_1.createWebpackEntryDictionaries(inlineFiles);
        console.log(chalk_1.default `- handing off the build of the {green {bold serverless.yml}} to the repo's {bold build} script\n`);
        yield async_shelljs_1.asyncExec(`yarn ts-node serverless-config/build.ts --color=always`, {
            env: Object.assign(Object.assign(Object.assign({}, process.env), { TERM: "xterm-color" }), (os.platform().includes("win") ? {} : { shell: "/bin/bash" }))
        });
        console.log(chalk_1.default `{green - {bold serverless.yml} has been updated successfully ${"\uD83D\uDE80" /* rocket */}}`);
    });
}
exports.buildServerlessMicroserviceProject = buildServerlessMicroserviceProject;
