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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const npm_1 = require("../npm");
const getServerlessYaml_1 = require("./getServerlessYaml");
/**
 * returns a set of flags indicating whether it appears the serverless framework
 * is being used in this repo
 */
function isServerless() {
    return __awaiter(this, void 0, void 0, function* () {
        const hasServerlessConfig = fs_1.default.existsSync(path_1.default.join(process.cwd(), "serverless.yml"));
        let slsConfig;
        try {
            slsConfig = yield getServerlessYaml_1.getServerlessYaml();
        }
        catch (e) {
            //
        }
        const pkgJson = npm_1.getPackageJson();
        const hasAsDevDep = pkgJson
            ? Object.keys(pkgJson.devDependencies).includes("serverless")
            : false;
        const isUsingTypescriptMicroserviceTemplate = fs_1.default.existsSync(path_1.default.join(process.cwd(), "serverless-config/config.ts"));
        const hasProviderSection = slsConfig && slsConfig.provider ? true : false;
        const configIsParsable = hasServerlessConfig && slsConfig ? true : false;
        return hasServerlessConfig ||
            hasAsDevDep ||
            isUsingTypescriptMicroserviceTemplate
            ? {
                hasServerlessConfig,
                hasAsDevDep,
                isUsingTypescriptMicroserviceTemplate,
                hasProviderSection,
                configIsParsable
            }
            : false;
    });
}
exports.isServerless = isServerless;