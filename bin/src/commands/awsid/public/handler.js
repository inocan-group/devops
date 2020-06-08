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
exports.handler = void 0;
const shared_1 = require("../../../shared");
const askUser_1 = require("../private/askUser");
const chalk = require("chalk");
function handler(argv, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const profiles = yield shared_1.getAwsProfileList();
        const profileNames = Object.keys(profiles);
        let chosen = [];
        if (!profiles) {
            console.log(chalk `- ${"\uD83E\uDD16" /* robot */} you do not have {italic any} AWS profiles in your credentials file!\n`);
            process.exit();
        }
        if (opts.all) {
            chosen = profileNames;
        }
        else if (argv.length === 0) {
            chosen = yield askUser_1.askUser(Object.keys(profiles));
        }
        else {
            chosen = argv.filter((i) => profileNames.includes(i));
            if (chosen.length === 0) {
                console.log(chalk `- there were {red no} valid profiles provided!`);
                console.log(chalk `- valid profile names are: {blue ${profileNames.join(", ")}`);
            }
            if (chosen.length !== argv.length) {
                console.log(chalk `- some profiles provided were not valid; valid ones are listed below`);
            }
        }
        const results = [];
        const errors = [];
        for (const profile of chosen) {
            try {
                results.push(Object.assign({ profile }, (yield shared_1.getAwsIdentityFromProfile(profiles[profile]))));
                process.stdout.write(chalk `{green .}`);
            }
            catch (e) {
                errors.push(Object.assign(Object.assign({}, e), { profile }));
                process.stdout.write(chalk `{red .}`);
            }
        }
        console.log();
        console.log(results);
        if (errors.length > 0) {
            console.log(chalk `- there ${errors.length === 1 ? "was" : "were"} ${errors.length} profile${errors.length === 1 ? "" : "s"} which encountered errors trying to authenticate, the rest were fine.`);
            errors.forEach((e) => console.log(chalk `- {bold {red ${e.profile}}}: {grey ${e.message}}`));
        }
    });
}
exports.handler = handler;