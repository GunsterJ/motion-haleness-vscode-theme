const fs = require("fs");

const file = "themes/Motion Haleness-color-theme.json";
const theme = JSON.parse(fs.readFileSync(file, "utf8"));
const c = theme.colors;

const commentFg = (() => {
  const rule = (theme.tokenColors || []).find((r) => r.name === "Comment");
  return rule && rule.settings && rule.settings.foreground;
})();

function resolve(value) {
  return value && value.startsWith("#") ? value : c[value];
}

function rgb(hex) {
  const h = String(hex).replace("#", "");
  const full = h.length >= 6 ? h.slice(0, 6) : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const pairs = [
  ["editor.foreground", "editor.background", 4.5],
  ["editorLineNumber.foreground", "editor.background", 2.5],
  ["sideBar.foreground", "sideBar.background", 4.5],
  ["tab.activeForeground", "tab.activeBackground", 3.9],
  ["statusBar.foreground", "statusBar.background", 4.0],
  ["input.foreground", "input.background", 4.5],
  ["terminal.foreground", "terminal.background", 4.5],
  ["descriptionForeground", "editor.background", 2.5],
  ["chat.avatarForeground", "chat.avatarBackground", 3.0],
  [commentFg, "editor.background", 4.5],
];

let ok = true;
for (const [fg, bg, min] of pairs) {
  const a = resolve(fg);
  const b = resolve(bg);
  if (!a || !b) {
    console.warn(`  skip: ${fg} (${a || "?"}) / ${bg} (${b || "?"})`);
    continue;
  }
  const ratio = contrast(a, b);
  const pass = ratio >= min - 0.01;
  console.log(`${pass ? "PASS" : "FAIL"} ${ratio.toFixed(2)}:1  ${fg} vs ${bg} (min ${min}:1)`);
  if (!pass) ok = false;
}

process.exit(ok ? 0 : 1);