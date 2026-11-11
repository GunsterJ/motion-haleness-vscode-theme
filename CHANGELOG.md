# Change Log

All notable changes to the "motion-haleness" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.1.1] - 2026-11-11

### Changed
- Screenshots now use rounded macOS-style window frames and a continuous theme-colored background with grain that flows seamlessly across images
- Example code extended and polished: pure TypeScript, React (TSX), JSON and Markdown screenshots added, with accurate theme colors and indentation

## [1.1.0] - 2026-11-11

### Added
- Bundled **Inconsolata** font (editor, terminal and Markdown preview), with configuration defaults
- Coding agent themes:
  - Codex CLI syntax theme (`.tmTheme`)
  - Codex VS Code extension theme import (`codex-theme-v1` string)
  - Claude Code custom theme
  - macOS Terminal.app profile with the Motion Haleness ANSI palette
- Language-agnostic example screenshots in the README (TypeScript, JavaScript, Python, Go, Rust, HTML, CSS, SQL)
- MIT license and a sales-pitch README focused on AI coding agents
- New marketplace description and search-friendly keywords (Claude Code, Codex, Kilo Code)
- Development tooling: theme validation, WCAG contrast checks and a screenshot generator

### Changed
- Font weight tuned to 400 and font size to 15 for the bundled Inconsolata font

## [1.0.0] - 2026-11-11

### Added
- Diff editor and git gutter colors for added, modified and deleted lines
- Terminal ANSI colors matching the theme palette
- Bracket pair highlight colors
- Editor widget, suggest and peek view colors
- Semantic token colors for TypeScript and JavaScript highlighting
- High-contrast chat colors (`chat.*`) for chat-based agents such as Codex, Kilo Code and Copilot Chat

### Changed
- Comments now use a muted gray that stays readable in diffs and Source Control
- Operators are differentiated from keywords (muted gray)
- Editor whitespace and indent guides are now visible
- Toned down the editor pane background
- Bright workbench foreground so chat and agent response text renders white, with a muted description color for "thinking" states

### Fixed
- Markdown fenced code blocks and language hints are now visible
- Removed dead token rules and duplicate scopes, and fixed a trailing comma so the theme files are valid JSON

## [0.4.0]

- Maintenance release

## [0.3.0] - 2020-12-04

### Added
- New **Motion Haleness Italic** variant: a full second theme with italic styling on functions, methods and attributes
- Refined token colors in the base theme

### Fixed
- Contrast fix for tab highlighting

## [0.2.0] - 2020-12-03

### Added
- Extension icon
- Updated extension description and marketplace metadata
- Packaging fixes across the 0.2.x line (correct directory structure, duplicate icon cleanup)

## [0.1.0] - 2020-12-03

- Initial release of Motion Haleness: a full dark color theme for Visual Studio Code with 80 workbench colors and 40+ syntax token groups — comments, keywords, operators, functions, strings, classes, CSS, HTML, decorators, regular expressions, git markup and a rainbow JSON key scheme