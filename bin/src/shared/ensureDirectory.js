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
exports.ensureDirectory = void 0;
const fs = require("fs");
const util_1 = require("util");
const exists = util_1.promisify(fs.exists);
const mkdir = util_1.promisify(fs.mkdir);
/**
 * Makes sure that the given directory exists and if not then it creates it
 */
function ensureDirectory(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const doesExist = yield exists(dir);
        if (!doesExist) {
            yield mkdir(dir, { recursive: true });
        }
    });
}
exports.ensureDirectory = ensureDirectory;