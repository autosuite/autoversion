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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var replace_in_file_1 = __importDefault(require("replace-in-file"));
var core = __importStar(require("@actions/core"));
var autolib = __importStar(require("@teaminkling/autolib"));
/**
 * Mapping of supported frameworks to their files and regular expressions used to replace. The 2nd group to capture
 * is what is replaced, and all of these require three capturing groups.
 *
 * Just add to this list if you want to support more package metadata types.
 */
var FRAMEWORKS_TO_FILES_AND_REGEXES = {
    "npm": {
        file: "package.json",
        regex: /(?<key>"version": ")(?<version>\d\.\d\.\d)(?<tail>")/
    },
    "cargo": {
        file: "Cargo.toml",
        regex: /(?<key>version = ")(?<version>\d\.\d\.\d)(?<tail>")/
    },
};
function runAction() {
    return __awaiter(this, void 0, void 0, function () {
        var latestStableVersion, managersInConfigText, managersInConfig, cleanedManagersInConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, autolib.findLatestVersionFromGitTags(true)];
                case 1:
                    latestStableVersion = _a.sent();
                    managersInConfigText = core.getInput("managers");
                    managersInConfig = managersInConfigText.split(",");
                    cleanedManagersInConfig = managersInConfig.map(String.prototype.trim);
                    cleanedManagersInConfig.forEach(function (manager) {
                        var metainfo = FRAMEWORKS_TO_FILES_AND_REGEXES[manager];
                        if (!metainfo) {
                            core.setFailed("Autoversioning script does not understand manager: [" + manager + "].");
                        }
                        /* Perform an in-group regex replace. */
                        replace_in_file_1.default.sync({
                            files: metainfo.file,
                            from: metainfo.regex,
                            to: "$1" + latestStableVersion + "$3",
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
var actionRunner = runAction();
/* Handle action promise. */
actionRunner.then(function () { });
