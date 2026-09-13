# try-makefile

A small HTML project that teaches editing, testing, dependency builds, and serving a page with Bun and Make.

## Run locally

1. Install Bun: https://bun.com/docs/installation
2. Extract the ZIP and open a terminal in the `try-makefile` folder.
3. Run `bun run test`, then `bun run start`.
4. Open http://127.0.0.1:3000 in your browser. Press Ctrl+C to stop.

There are no external dependencies. No install step, lockfile, or Node.js installation is needed.

## Try Make

With `make` installed (macOS/Linux, or WSL on Windows):

```sh
make           # test, then build
make build     # skip work if the source and build script are unchanged
make serve     # build if needed, then start Bun's server
make clean     # remove dist/
```

Edit `src/index.html`. While the server is running, use a second terminal to run `make build`, then refresh your browser. This server does not rebuild automatically.

Bun-only alternatives work without Make, including on Windows:

```sh
bun run test
bun run build
bun run start
bun run clean
```

`bun run start` builds before serving; `bun run build` always copies the source. Make adds dependency tracking. `bun scripts/serve.js` serves an existing build. The server binds only to your local machine; set the `PORT` environment variable to use a different port.

## Files

- `src/index.html`: editable page, with styles included.
- `Makefile`: build dependencies and recipes.
- `package.json`: Bun commands; no third-party packages.
- `scripts/check.js`: checks for a non-empty `<h1>`.
- `scripts/build.js`: copies the page into `dist/`.
- `scripts/serve.js`: serves the built page using Bun.serve.
- `scripts/start.js`: builds and starts the server.
- `scripts/clean.js`: removes generated files.
- `.gitignore`: excludes generated files and local settings.

## From the browser lesson

The download includes current project files, generated files if present, and unsaved editor drafts. Downloading does not save those drafts inside the lesson. If you deliberately broke the heading or Makefile, those edits are included; fix them before running the corresponding check or command locally.

The browser models the supplied Bun scripts instead of executing JavaScript. Supporting files are read-only there; edit any file locally after downloading. The live Bun server reads the latest saved build, while the lesson preview shows the last simulated build.

## Five practice scenarios

1. **Hello, shell:** add `echo "Hello Ariser!"` to `scripts/hello.sh`, then run `sh scripts/hello.sh`.
2. **A Make recipe:** make the `hello` target run `sh scripts/hello.sh`, using a TAB before the recipe. Run `make hello`.
3. **Serve with Bun:** edit the heading in `src/index.html`, then run `make build` and `make serve` (or `bun run start`).
4. **Break and fix a test:** remove the heading, run `bun run test` to see a failure, restore the heading, and run the test again.
5. **Format, test, then serve:** add a `.PHONY: dev` declaration and a `dev` target to `Makefile`, with three TAB-indented recipe lines: `bun run format`, `bun run test`, and `bun run start`. Run `make dev`. Make stops if a recipe line fails; the server must be last because it keeps running.

The formatter removes trailing spaces/tabs, normalizes line endings, and adds one final newline. It does not re-indent HTML. It has no package dependencies.

The two `.sh` files are exercises: fill in the commented instructions. Use macOS, Linux, WSL, or Git Bash for `sh`; the Bun commands themselves also work directly on Windows. No executable permission is needed when you run `sh scripts/hello.sh` or `sh scripts/dev.sh`.

The browser lesson restores fresh files when you select a scenario and preserves completion marks. The ZIP contains the currently selected scenario and your current edits. Supporting JavaScript files stay read-only in the browser; shell scripts, HTML, and Makefile are editable. The shell model supports simple commands, full-line comments, redirection, pipes, and `&&`; it does not execute arbitrary host shell code.
