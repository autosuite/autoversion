import * as fs from 'fs';

import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 * A file with a regular expression used in this context to represent a management file and the regular expression
 * that will match the version.
 */
interface FileWithRegex {
    /** The package file for a framework. */
    file: string,
    /** A regular expression for the file contents to find its SemVer version. */
    regex: RegExp
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
    }
};

async function run() {
    await exec.exec("git fetch --tags");
    await exec.exec("git describe --abbrev=0", [], {
        listeners: {
            stdout: (data: Buffer) => {
                /* All tags must contain SemVer versions, and we need to extract the version. */

                const rawMatch: RegExpMatchArray | null = data.toString().match(/\d\.\d\.\d/);

                let version: string = "0.0.0";

                if (!rawMatch || !(rawMatch.length == 1)) {
                    core.info(
                        "The latest tag should be/contain a SemVer version. We couldn't find it; assuming [0.0.0]."
                    );
                } else {
                    version = rawMatch[0].toString();
                }

                /* Iterate all of the frameworks provided by the Action's configuration. */

                core.getInput("managers").split(",").forEach((manager: string) => {
                    const cleanedManager: string = manager.trim();
                    const metainfo: FileWithRegex = FRAMEWORKS_TO_FILES_AND_REGEXES[cleanedManager];

                    if (!metainfo) {
                        core.setFailed(`Autoversioning script does not understand manager: [${cleanedManager}].`);
                    }

                    const newContent = fs
                        .readFileSync(metainfo.file)
                        .toString()
                        .replace(metainfo.regex, `$1${version}$3`);

                    fs.writeFileSync(metainfo.file, newContent);
                });
            },
            stderr: (data: Buffer) => {
                core.error(data.toString());
            }
        },
    });
}

run();
