import * as core from '@actions/core';

import * as autolib from 'autolib';

/**
 * A file with a regular expression used in this context to represent a management file and the regular expression
 * that will match the version.
 */
interface FileWithRegex {
    /** The package file for a framework. */
    file: string,
    /** A regular expression for the file contents to find its SemVer version. */
    regex: RegExp,
};

/**
 * Mapping of supported frameworks to their files and regular expressions used to replace. The 2nd group to capture
 * is what is replaced, and all of these require three capturing groups.
 */
const FRAMEWORKS_TO_FILES_AND_REGEXES: { [key: string]: FileWithRegex } = {
    "npm": {
        file: "package.json",
        regex: /("version": ")(\d\.\d\.\d)(")/
    },
    "cargo": {
        file: "Cargo.toml",
        regex: /(version = ")(\d\.\d\.\d)(")/
    },
};

async function run() {
    const latestStableVersion: autolib.SemVer = autolib.findLatestVersionFromGitTags(true);

    /* Iterate all of the frameworks provided by the Action's configuration. */

    core.getInput("managers").split(",").map((manage: string) => manage.trim()).forEach((manager: string) => {
        const metainfo: FileWithRegex = FRAMEWORKS_TO_FILES_AND_REGEXES[manager];

        if (!metainfo) {
            core.setFailed(`Autoversioning script does not understand manager: [${manager}].`);
        }

        autolib.rewriteFileContentsWithReplacements(metainfo.file, [
            new autolib.ReplacementMap(
                metainfo.regex,
                `$1${latestStableVersion.toString()}$3`,
            ),
        ]);
    });
}

run();
