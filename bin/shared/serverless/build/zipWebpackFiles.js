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
Object.defineProperty(exports, "__esModule", { value: true });
const bestzip_1 = __importDefault(require("bestzip"));
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
/**
 * Zips up a number of
 *
 * @param fns a list of functions to zip
 */
function zipWebpackFiles(fns) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        try {
            const fnWithPath = (f) => path_1.join(".webpack", f);
            fns.forEach(fn => promises.push(bestzip_1.default({
                source: `./${fnWithPath(fn)}.js`,
                destination: `./${fnWithPath(fn)}.zip`
            }).catch((e) => {
                throw e;
            })));
            return Promise.all(promises);
        }
        catch (e) {
            console.log(chalk_1.default `{red - Problem zipping webpack files! ${"\uD83D\uDE21" /* angry */}}`);
            console.log(`- ${e.message}`);
            console.log(chalk_1.default `{grey \n${e.stack}}\n`);
            process.exit();
        }
    });
}
exports.zipWebpackFiles = zipWebpackFiles;