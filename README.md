# 📦 docr-install-action

> A convenient installer for the [Docr](https://github.com/notashelf/Docr)
> Static Site Generator

[![Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)

## Usage

### Configuration

Values below will be used to write your `settings.json` in the same directory as
the `Docr` executable.

| Option                     | Description                                                                                |      Required      |     Default      |
| :------------------------- | :----------------------------------------------------------------------------------------- | :----------------: | :--------------: |
| `github-repo`              | The GitHub repository (e.g., owner/repo) to fetch releases from.                           |        :x:         | `NotAShelf/Docr` |
| `install-dir`              | The installation directory for your application. Defaults to current directory             |        :x:         |       `./`       |
| `github-username`          | Your GitHub username to be displayed on generated pages                                    | :white_check_mark: |      `N/A`       |
| `website-name`             | A short name for your website or application, will be displayed on pages                   | :white_check_mark: |      `N/A`       |
| `template-dir`             | The directory where templates are stored                                                   |        :x:         |   `templates/`   |
| `markdown-dir`             | The directory where markdown files will be stored                                          |        :x:         |   `markdown/`    |
| `output-dir`               | The directory to place generated html files to. Useful for serving static pages over Pages |        :x:         |    `output/`     |
| `website-url`              | Root URL of your website. Will be used for RSS feeds and buttons                           | :white_check_mark: |      `N/A`       |
| `website-description`      | Meta description of your website. Useful for setting embed descriptions                    | :white_check_mark: |      `N/A`       |
| `timestamps-from-filename` | Whether to extract timestamps from filenames that are named `title-dd-mm-yyyy.md`          |        :x:         |      `true`      |

### Output

- installed-version: The installed version of your application.

## Developing

All contributions are welcome.

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

Nix users may use the provided `flake.nix` for automatically setting up a
convenient dev env.

### Testing

<!-- TODO -->

## License

This repository is licensed under the MIT License. See [License](LICENSE) for
more details.
