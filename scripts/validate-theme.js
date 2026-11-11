const fs = require("fs");

const files = [
  "themes/Motion Haleness-color-theme.json",
  "themes/Motion Haleness Italics Variation-color-theme.json",
];

let ok = true;

for (const file of files) {
  try {
    const theme = JSON.parse(fs.readFileSync(file, "utf8"));
    const colorKeys = Object.keys(theme.colors || {});
    const dups = colorKeys.filter((k, i) => colorKeys.indexOf(k) !== i);
    if (dups.length > 0) {
      console.error(`${file}: duplicate color keys: ${dups.join(", ")}`);
      ok = false;
    }
    const rules = theme.tokenColors || [];
    const named = rules.filter((r) => r.name).map((r) => r.name);
    const dupNames = named.filter((n, i) => named.indexOf(n) !== i);
    if (dupNames.length > 0) {
      console.error(`${file}: duplicate token rule names: ${dupNames.join(", ")}`);
      ok = false;
    }
    console.log(`${file}: OK (${colorKeys.length} colors, ${rules.length} token rules)`);
  } catch (e) {
    console.error(`${file}: invalid JSON - ${e.message}`);
    ok = false;
  }
}

process.exit(ok ? 0 : 1);