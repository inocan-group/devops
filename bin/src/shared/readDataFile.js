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
exports.readDataFile = void 0;
const path = require("path");
const process = require("process");
const index_1 = require("./index");
/**
 * Reads a file from the `test/data` directory
 */
function readDataFile(file, defaultExtension) {
    return __awaiter(this, void 0, void 0, function* () {
        if (defaultExtension && defaultExtension.slice(0, 1) === ".") {
            defaultExtension = defaultExtension.slice(1);
        }
        let filename = path.join(process.cwd(), "test/data", file);
        if (defaultExtension && !file.includes("." + defaultExtension)) {
            filename += "." + defaultExtension;
        }
        return index_1.readFile(filename);
    });
}
exports.readDataFile = readDataFile;