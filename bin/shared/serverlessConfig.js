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
const js_yaml_1 = require("js-yaml");
const path_1 = __importDefault(require("path"));
/**
 * Get the `serverless.yml` file in the root of the project; if
 * the file does not exist then return _false_
 */
function getServerlessYml() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = js_yaml_1.safeLoad(path_1.default.join(process.cwd(), "serverless.yml"));
            return config;
        }
        catch (e) {
            return false;
        }
    });
}
exports.getServerlessYml = getServerlessYml;
/**
 * For people using the `typescript-microservice` template,
 * this function will interactively ask a user questions
 * so that the serverless configuration can be built.
 */
function askAboutConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        //
    });
}
exports.askAboutConfig = askAboutConfig;