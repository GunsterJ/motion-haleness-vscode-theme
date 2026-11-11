# Motion Haleness

A modern dark color theme for Visual Studio Code. Motion Haleness combines a balanced, high-contrast palette with full semantic highlighting support, and keeps your code readable even in diffs and Source Control.

Language-agnostic by design: consistent, balanced highlighting for TypeScript, JavaScript, Python, Go, Rust, HTML, CSS, SQL and everything else your editor can parse.

## Features

- High-contrast dark palette tuned for long coding sessions
- Readable comments, including inside diff and Source Control views
- Semantic highlighting for TypeScript and JavaScript
- Themed terminal with matching ANSI colors
- Bracket pair, editor widget and peek view colors that match the theme
- Two variants: **Motion Haleness** and **Motion Haleness Italic**

## Works with coding agents

Motion Haleness pairs nicely with coding agents that run in your terminal.

### Kilo Code

Works out of the box — Kilo Code renders inside VS Code and automatically uses the active color theme.

### Codex CLI

Motion Haleness syntax highlighting for code blocks and diffs:

1. Copy `coding-agents/codex/motion-haleness.tmTheme` to `~/.codex/themes/`
2. Run `codex` and select it via `/theme`, or set it in `~/.codex/config.toml`:

   ```toml
   [tui]
   theme = "motion-haleness"
   ```

Codex renders its main UI (chat text, borders, banners) with your terminal's ANSI palette, not the theme — the theme only colors code blocks and diffs. For a colorful, high-contrast Codex UI, run it in a terminal with the Motion Haleness palette:

- **VS Code integrated terminal:** already uses the theme's palette (open a new terminal after switching the theme)
- **macOS Terminal.app:** double-click `coding-agents/terminal/motion-haleness.terminal` to import the "Motion Haleness" profile, then set it as default via Terminal → Preferences → Profiles → Default

### Codex (VS Code extension)

The Codex chat panel is a self-contained webview with its own appearance settings — it does not fully follow the VS Code theme. To match Motion Haleness:

1. Open the Codex panel → **Settings → Appearance**
2. **Import** the Motion Haleness theme: paste the `codex-theme-v1:` value from `coding-agents/codex/motion-haleness-codex-theme.txt`
3. Or simply pick a built-in high-contrast theme (e.g. `one-dark-pro` or `dark-plus`) and set the accent to `#55D6BE`

### Claude Code

Requires Claude Code 2.1.118 or later:

1. Copy `coding-agents/claude-code/motion-haleness.json` to `~/.claude/themes/`
2. Run `claude` and select it via `/theme` (appears as `custom:motion-haleness`), or set `"theme": "custom:motion-haleness"` in `~/.claude/settings.json`

## Fonts

Motion Haleness ships **Inconsolata** for code and **Atkinson Hyperlegible** for prose, bundled in `assets/fonts/` under the SIL Open Font License 1.1:

- **Inconsolata** — monospace variable font (200–900), used for the editor and integrated terminal (default weight 400)
- **Atkinson Hyperlegible** — proportional, used for the Markdown preview (Atkinson Hyperlegible Mono is also bundled as an alternative monospace)

To use them, install the fonts on your system:

- **macOS:** run `./scripts/install-fonts.sh`, or copy the `.ttf` files from `assets/fonts/` to `~/Library/Fonts`
- **Other platforms:** install the `.ttf` files from `assets/fonts/` with your platform's font manager

Restart VS Code after installing. The defaults set `"Inconsolata"` for `editor.fontFamily` and `terminal.integrated.fontFamily`, and `"Atkinson Hyperlegible"` for `markdown.preview.fontFamily` — you can always override these in your own settings.

## Screenshots

<img src="assets/screenshots/demo-ts.png" width="700" alt="TypeScript">

<img src="assets/screenshots/demo-py.png" width="700" alt="Python">

<img src="assets/screenshots/demo-go.png" width="700" alt="Go">

<img src="assets/screenshots/demo-rs.png" width="700" alt="Rust">

<img src="assets/screenshots/demo-js.png" width="700" alt="JavaScript">

<img src="assets/screenshots/demo-html.png" width="700" alt="HTML">

<img src="assets/screenshots/demo-css.png" width="700" alt="CSS">

<img src="assets/screenshots/demo-sql.png" width="700" alt="SQL">

The example files live in [`assets/examples/`](assets/examples/); you can regenerate the screenshots with `npm run screenshots`.

## Installation

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Open the **Extensions** view (`Ctrl+Shift+X`)
3. Search for **Motion Haleness**
4. Click **Install**
5. Open the Command Palette (`Ctrl+Shift+P`) and run **Preferences: Color Theme**
6. Select **Motion Haleness** or **Motion Haleness Italic**

## Feedback

Found a bug or have a suggestion? Please [file an issue](https://github.com/erole-attack/motion-haleness-vscode-theme/issues). Feedback is very welcome.
