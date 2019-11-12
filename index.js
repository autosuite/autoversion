const { exec } = require('child_process');
const core = require('@actions/core');
const fs = require('fs');
const path = process.cwd();

/* Add the .trim() method to the String type. */

if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.trim = function () {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

/**
 * Mapping of supported frameworks to their files and regular expressions used to replace. The 2nd group to capture
 * is what is replaced, and all of these require three capturing groups.
 *
 * Please open a pull request if this is not good enough, as I have a feeling it isn't for a few popular package
 * management/configuration management tools.
 */
const frameworksToFilesAndRegexes = {
    "npm": {
        "file": "package.json",
        "regex": /("version": ")(\d\.\d\.\d)(")/
    },
    "cargo": {
        "file": "Cargo.toml",
        "regex": /(version = ")(\d\.\d\.\d)(")/
    }
};

exec('git fetch --tags', (_err, _stdout, _stderr) => {
    exec('git describe --abbrev=0', (_err, stdout, _stderr) => {
        let tag = stdout;

        /* All tags must contain SemVer versions, and we need to extract the version. */

        const rawMatch = tag.match(/\d\.\d\.\d/);
        let version = "0.0.0";

        if (!rawMatch || !rawMatch.length == 1) {
            console.log("The latest tag should be/contain a SemVer version. We couldn't find it; assuming [0.0.0].");
        } else {
            version = rawMatch[0].toString();
        }

        /* Iterate all of the frameworks provided by the Action's configuration. */

        core.getInput("managers").split(",").forEach(manager => {
            const cleanedManager = manager.trim();
            const metainfo = frameworksToFilesAndRegexes[cleanedManager];

            if (!metainfo) {
                console.error("Autoversioning script does not understand manager: [" + cleanedManager + "].");

                process.exit(1);
            }

            const absPath = path + "/" + metainfo.file;
            const newContent = fs.readFileSync(absPath).toString().replace(metainfo.regex, "$1" + version + "$3");

            fs.writeFileSync(absPath, newContent);
        });
    });
});
