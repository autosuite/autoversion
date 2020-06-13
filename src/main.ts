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

/**
 * From the tag `string`, return the SemVer part of it.
 *
 * @param description the tag `string`
 */
function extractVersion(description: string): string {
    /* All tags must contain SemVer versions, and we need to extract the version. The v-prefix is optional. */

    const rawMatch: RegExpMatchArray | null = description.match(/(?<=v)?\d\.\d\.\d/);

    if (!rawMatch || !(rawMatch.length == 1)) {
        core.warning(
            "The latest tag should be/contain a SemVer version. We couldn't find it; assuming [0.0.0]."
        );

        return "0.0.0";
    }

    return rawMatch[0].toString();
}

async function run() {
    await exec.exec("git fetch --tags");
    await exec.exec("git describe --abbrev=0", [], {
        listeners: {
            stdout: (data: Buffer) => {
                const version: string = extractVersion(data.toString());

                /* Iterate all of the frameworks provided by the Action's configuration. */

                core.getInput("managers").split(",").forEach((manager: string) => {
                    const cleanedManager: string = manager.trim();
                    const metainfo: FileWithRegex = FRAMEWORKS_TO_FILES_AND_REGEXES[cleanedManager];

                    if (!metainfo) {
                        core.setFailed(`Autoversioning script does not understand manager: [${cleanedManager}].`);
                    }

                    const newContent: string = fs.readFileSync(
                        metainfo.file
                    ).toString().replace(metainfo.regex, `$1${version}$3`);

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
