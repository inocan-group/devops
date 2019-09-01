"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const inquirer = require("inquirer");
const index_2 = require("../errors/index");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Asks the user to choose an AWS profile
 */
function askForAwsProfile(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        opts = opts ? Object.assign({ exitOnError: false }, opts) : { exitOnError: false };
        const profiles = yield index_1.getAwsProfileList();
        const profileNames = Object.keys(profiles);
        if (!profiles) {
            const message = `Attempt to "ask" for the AWS profile assumes there is at least one defined AWS profile in the credentials file but that could not be found.`;
            if (opts.exitOnError) {
                console.log(chalk_1.default `{red - Missing AWS credentials file}`);
                console.log(message + "\n");
                process.exit();
            }
            throw new index_2.DevopsError(message, "devops/not-allowed");
        }
        const defaultProfile = opts.defaultProfile
            ? profiles[opts.defaultProfile] || profiles[profileNames[0]]
            : profiles[profileNames[0]];
        const question = {
            name: "profile",
            type: "list",
            choices: Object.keys(profiles),
            message: "choose a profile from your AWS credentials file",
            default: defaultProfile,
            when: () => true
        };
        const answer = yield inquirer.prompt(question);
        return answer.profile;
    });
}
exports.askForAwsProfile = askForAwsProfile;
