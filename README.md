# Autoversion

| Summary           | Badge                                              |
| ----------------- | -------------------------------------------------- |
| Release Stability | ![Autobadger Release Stability][release-stability] |
| Latest Release    | ![Autobadger Latest Release][latest-release]       |
| Code Quality      | [![Maintainability][quality-image]][quality-link]  |
| Code Coverage     | [![Test Coverage][coverage-image]][coverage-link]  |

[release-stability]: https://img.shields.io/static/v1?label=latest&message=0.0.0&color=purple
[latest-release]: https://img.shields.io/static/v1?label=stability&message=unusable&color=red
[quality-image]: https://api.codeclimate.com/v1/badges/72874b4fc4e4703d3a25/maintainability
[quality-link]: https://codeclimate.com/github/autosuite/autoversion/maintainability
[coverage-image]: https://api.codeclimate.com/v1/badges/72874b4fc4e4703d3a25/test_coverage
[coverage-link]: https://codeclimate.com/github/autosuite/autoversion/test_coverage

## Introduction

Simple Action that increments the version to the most recent tag found when called. This supports:

- Rust/Cargo (`cargo`)
- Node/NPM (`npm`)

Feel free to open a pull request if you would like to support additional frameworks!

## Usage

Add this to your `main.yml` file (or whatever your workflow is called).

Note that you will need to have an action that performs a pre-commit (stage, commit) and push:

```yaml
name: my-workflow

on: [push]

jobs:
  autoversion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: teaminkling/autoversion@master
        with:
          managers: npm, cargo
      - uses: teaminkling/autocommit@master
      - uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

> You can see all configuration in the [action.yml](action.yml) file.

| Variable | Value                             | Example      | Default | Required? |
| -------- | --------------------------------- | ------------ | ------- | --------- |
| managers | Comma-separated enum (see above.) | `npm, cargo` | `npm`   | Yes.      |

## Caveats

There is obviously only one set of version tags in any `git` repository, meaning you cannot do something like have a frontend and backend of an application in the same repository while they have different versions. You can, however, force them to always keep the same version, even if they do not change between different tags.

## Documentation

If you would like to contribute to this project, please read our [contributors documentation](CONTRIBUTING.md) and our [code of conduct](CODE_OF_CONDUCT.md).

The license we use for this project is defined in [the license file](LICENSE).
