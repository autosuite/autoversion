# Autoversion

Simple Action that increments the version to the most recent tag found when called. This supports:

- Rust and Cargo (`cargo`)
- Node and NPM (`npm`)

Feel free to open a pull request if you would like to support additional frameworks!

## Usage

Add this to your `mail.yml` file (or whatever your workflow is called):

```yaml
name: my-workflow

on:
  push:
    branches:
      - master

jobs:
  autoversion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: teaminkling/skip-commit@master
        with:
          commit-filter: skip-log, skip-ci, automated
      - uses: teaminkling/autoversion@master
        with:
          managers: npm, cargo
      - name: Pre-remote commit actions
        run: |
          git add CHANGELOG.md
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git commit -m "[skip-ci, auto] Make changes automatically to meta files."
      - uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Caveats

There is obviously only one set of version tags in any `git` repository, meaning you cannot do something like have a frontend and backend of an application in the same repository while they have different versions. You can, however, force them to always keep the same version, even if they do not change between different tags.

## Documentation

If you would like to contribute to this project, please read our [contributors documentation](CONTRIBUTING.md) and our [code of conduct](CODE_OF_CONDUCT.md).

The license we use for this project is defined in [the license file](LICENSE).

Thanks!
