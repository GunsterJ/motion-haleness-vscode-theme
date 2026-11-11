# Change Log

All notable changes to the "motion-haleness" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.4.0] - 2026-11-11

### Added
- Diff editor and git gutter colors for added, modified and deleted lines
- Terminal ANSI colors matching the theme palette
- Bracket pair highlight colors
- Editor widget, suggest and peek view colors
- Semantic token colors for TypeScript and JavaScript highlighting

### Changed
- Increased comment contrast so comments stay readable in diffs and Source Control
- Differentiated operators from keywords (operators are now muted gray)
- Made editor whitespace and indent guides visible
- Toned down the editor pane background

### Fixed
- Markdown fenced code blocks and language hints are now visible
- Removed dead token rules and duplicate scopes, and fixed a trailing comma so the theme files are valid JSON
