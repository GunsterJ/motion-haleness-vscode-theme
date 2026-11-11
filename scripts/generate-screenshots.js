// Generates README screenshots from the example files in assets/examples.
// Requires highlight.js:  npm install --prefix /tmp/mh-tools highlight.js
// Usage: NODE_PATH=/tmp/mh-tools/node_modules node scripts/generate-screenshots.js [outDir]
const fs = require("fs");
const path = require("path");
const hljs = require("highlight.js");

const EXAMPLES_DIR = "assets/examples";
const OUT_DIR = process.argv[2] || "/tmp/mh-screenshots";

const LANGS = {
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  go: "go",
  rs: "rust",
  html: "xml",
  css: "css",
  sql: "sql",
  js: "javascript",
};

const COLORS = {
  "hljs-keyword": "#55D6BE",
  "hljs-selector-tag": "#55D6BE",
  "hljs-literal": "#55D6BE",
  "hljs-section": "#55D6BE",
  "hljs-link": "#55D6BE",
  "hljs-string": "#76E5FC",
  "hljs-regexp": "#76E5FC",
  "hljs-addition": "#76E5FC",
  "hljs-attribute": "#76E5FC",
  "hljs-number": "#9F5EF4",
  "hljs-symbol": "#9F5EF4",
  "hljs-bullet": "#9F5EF4",
  "hljs-template-variable": "#9F5EF4",
  "hljs-variable": "#9F5EF4",
  "hljs-selector-id": "#9F5EF4",
  "hljs-selector-class": "#9F5EF4",
  "hljs-selector-pseudo": "#9F5EF4",
  "hljs-attr": "#A9B4C2",
  "hljs-type": "#A9B4C2",
  "hljs-title": "#76E5FC",
  "hljs-name": "#F4D35E",
  "hljs-tag": "#F4D35E",
  "hljs-meta": "#F4D35E",
  "hljs-built_in": "#F4D35E",
  "hljs-deletion": "#FF715B",
  "hljs-insertion": "#CCF5AC",
  "hljs-emphasis": "#FF715B",
  "hljs-strong": "#FF715B",
  "hljs-operator": "#a0aec0",
  "hljs-punctuation": "#55D6BE",
};

function colorFor(classes) {
  if (classes.some((c) => c.includes("class_"))) return "#F4D35E";
  if (classes.some((c) => c.includes("function_"))) return "#76E5FC";
  if (classes.some((c) => c.includes("comment") || c.includes("quote"))) return "#a0aec0";
  for (const c of classes) {
    if (COLORS[c]) return COLORS[c];
  }
  return "#EEFFFF";
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tokensFromHtml(html) {
  const runs = [];
  const stack = [];
  let text = "";
  let i = 0;
  const openRe = /^<span class="([^"]+)">/;
  const push = (classes) => {
    if (text) {
      runs.push({ classes: [...classes], text: decodeHtml(text) });
      text = "";
    }
  };
  while (i < html.length) {
    if (html.startsWith("<span class=", i)) {
      const m = openRe.exec(html.slice(i));
      push(stack.length ? stack[stack.length - 1] : []);
      stack.push(m[1].split(/\s+/));
      i += m[0].length;
    } else if (html.startsWith("</span>", i)) {
      push(stack.length ? stack[stack.length - 1] : []);
      stack.pop();
      i += 7;
    } else {
      text += html[i];
      i += 1;
    }
  }
  push([]);
  return runs;
}

const PUNCT_RE = /[{}()[\];,.:]/;
const OP_RE = /[=+\-*/%&|!<>?]/;

function splitByChar(text, color) {
  if (color !== "#EEFFFF") return [{ text, color }];
  const out = [];
  let buf = "";
  let bufColor = "#EEFFFF";
  const flush = () => {
    if (buf) {
      out.push({ text: buf, color: bufColor });
      buf = "";
    }
  };
  for (const ch of text) {
    const c = PUNCT_RE.test(ch) ? "#55D6BE" : OP_RE.test(ch) ? "#a0aec0" : "#EEFFFF";
    if (c !== bufColor) {
      flush();
      bufColor = c;
    }
    buf += ch;
  }
  flush();
  return out;
}

const W = 1440;
const H = 1440;
const FONT = "Menlo, Monaco, monospace";

function buildSvg(langLabel, fileName, code) {
  const highlighted = hljs.highlight(code, { language: LANGS[langLabel] }).value;
  const lines = [];
  let line = [];
  for (const run of tokensFromHtml(highlighted)) {
    if (run.text.includes("\n")) {
      const parts = run.text.split("\n");
      parts.forEach((p, i) => {
        if (p.length) line.push({ ...run, text: p });
        if (i < parts.length - 1) {
          lines.push(line);
          line = [];
        }
      });
    } else {
      line.push(run);
    }
  }
  lines.push(line);

  const tabBarH = 46;
  const titleBarH = 54;
  const editorY = titleBarH + tabBarH;
  const lineH = 32;
  const fontSize = 18;
  const codeX = 88;
  const gutterX = 62;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`);

  // title bar
  parts.push(`<rect width="${W}" height="${titleBarH}" fill="#262A33"/>`);
  for (const [i, col] of ["#FF715B", "#F4D35E", "#55D6BE"].entries()) {
    parts.push(`<circle cx="${26 + i * 18}" cy="27" r="7" fill="${col}"/>`);
  }
  parts.push(
    `<text x="${W / 2}" y="36" fill="#a0aec0" font-family="${FONT}" font-size="16" text-anchor="middle">${escapeXml(fileName)} &#8212; Motion Haleness</text>`
  );

  // tab bar
  parts.push(`<rect y="${titleBarH}" width="${W}" height="${tabBarH}" fill="#2b2d34"/>`);
  parts.push(`<rect x="8" y="${titleBarH + 2}" width="170" height="${tabBarH - 2}" fill="#0F8B8D" rx="4"/>`);
  parts.push(
    `<text x="24" y="${titleBarH + tabBarH / 2 + 6}" fill="#EEFFFF" font-family="${FONT}" font-size="15">${escapeXml(fileName)}</text>`
  );
  parts.push(
    `<text x="190" y="${titleBarH + tabBarH / 2 + 6}" fill="#a0aec0" font-family="${FONT}" font-size="15">utils.ts</text>`
  );
  parts.push(
    `<text x="280" y="${titleBarH + tabBarH / 2 + 6}" fill="#a0aec0" font-family="${FONT}" font-size="15">README.md</text>`
  );

  // editor background
  parts.push(`<rect y="${editorY}" width="${W}" height="${H - editorY}" fill="#212329"/>`);

  // line numbers + code
  lines.forEach((runs, i) => {
    const y = editorY + 38 + i * lineH;
    parts.push(
      `<text x="${gutterX}" y="${y}" fill="#576773" font-family="${FONT}" font-size="${fontSize}" text-anchor="end">${i + 1}</text>`
    );
    const tspans = [];
    for (const r of runs) {
      for (const seg of splitByChar(r.text, colorFor(r.classes))) {
        tspans.push(`<tspan fill="${seg.color}">${escapeXml(seg.text).replace(/ /g, "&#160;")}</tspan>`);
      }
    }
    parts.push(`<text x="${codeX}" y="${y}" fill="#EEFFFF" font-family="${FONT}" font-size="${fontSize}">${tspans.join("")}</text>`);
  });

  // status bar
  const sbY = H - 48;
  parts.push(`<rect y="${sbY}" width="${W}" height="${48}" fill="#0F8B8D"/>`);
  parts.push(
    `<text x="16" y="${sbY + 29}" fill="#EEFFFF" font-family="${FONT}" font-size="14">${langLabel.toUpperCase()}</text>`
  );
  parts.push(
    `<text x="${W - 16}" y="${sbY + 29}" fill="#EEFFFF" font-family="${FONT}" font-size="14" text-anchor="end">Ln ${lines.length}, Col 1 &#160; UTF-8</text>`
  );

  parts.push("</svg>");
  return parts.join("\n");
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const file of fs.readdirSync(EXAMPLES_DIR)) {
  const ext = path.extname(file).slice(1);
  if (!LANGS[ext]) continue;
  const code = fs.readFileSync(path.join(EXAMPLES_DIR, file), "utf8");
  const name = path.basename(file, path.extname(file));
  const svg = buildSvg(ext, file, code);
  const out = path.join(OUT_DIR, `${name}-${ext}.svg`);
  fs.writeFileSync(out, svg);
  console.log(`wrote ${out}`);
}