# install-docr-action

[![Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy. If you are using a version manager like
> [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), you can run `nodenv install` in the
> root of your repository to install the version specified in
> [`package.json`](./package.json). Otherwise, 20.x or later should work!

### Inputs

- github-repo (required): The GitHub repository (e.g., owner/repo) to fetch
  releases from. `Default: NotAShelf/Docr`
- install-dir (required): The installation directory for your application.
- github-username (required): Your GitHub username.
- website-name (required): The name of your website or application.
- template-dir (required): The directory where templates are stored.
- markdown-dir (required): The directory for markdown files.
- output-dir (required): The output directory for your application.
- website-url (required): The URL of your website or application.
- website-description (required): A description of your website or application.
- timestamps-from-filename (required): Set to 'true' to enable extracting
  timestamps from filenames.

### Outputs

- installed-version: The installed version of your application.

## Developing

All contributions are welcome. Nix users may use the provided `flake.nix` for
automatically setting up a convenient dev env.

## License

This repository is licensed under the MIT License. See [License](LICENSE) for
more details.
