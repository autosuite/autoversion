import replace from 'replace-in-file';

import * as core from '@actions/core';

import * as autolib from '@teaminkling/autolib';


/**
 * A file with a regular expression used in this context to represent a management file and the regular expression
 * that will match the version.
*/
interface FileWithRegex {
    /** The package file for a framework. */
    file: string,
    /** A regular expression for the file contents to find its SemVer version. */
    regex: RegExp,
}


/**
 * Mapping of supported frameworks to their files and regular expressions used to replace. The 2nd group to capture
 * is what is replaced, and all of these require three capturing groups.
 *
 * Just add to this list if you want to support more package metadata types.
 */
const FRAMEWORKS_TO_FILES_AND_REGEXES: { [key: string]: FileWithRegex } = {
    "npm": {
        file: "package.json",
        regex: /(?<key>"version": ")(?<version>\d\.\d\.\d)(?<tail>")/
    },
    "cargo": {
        file: "Cargo.toml",
        regex: /(?<key>version = ")(?<version>\d\.\d\.\d)(?<tail>")/
    },
};


async function runAction() {
    const latestStableVersion: string = await autolib.findLatestVersionFromGitTags(true);

    /* Iterate all of the frameworks provided by the Action's configuration. */

    const managersInConfigText: any = core.getInput("managers");
    const managersInConfig: string[] = managersInConfigText.split(",");
    const cleanedManagersInConfig: string[] = managersInConfig.map(String.prototype.trim);

    cleanedManagersInConfig.forEach((manager: string) => {
        const metainfo: FileWithRegex = FRAMEWORKS_TO_FILES_AND_REGEXES[manager];

        if (!metainfo) {
            core.setFailed(`Autoversioning script does not understand manager: [${manager}].`);
        }

        /* Perform an in-group regex replace. */

        replace.sync({
            files: metainfo.file,
            from: metainfo.regex,
            to: `$1${latestStableVersion}$3`,
        })
    });
}


const actionRunner: Promise<void> = runAction();

/* Handle action promise. */

actionRunner.then(() => {});
