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
  json: "json",
  md: "markdown",
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

const W = 1100;
const H = 1100;
const FONT = "Menlo, Monaco, monospace";

const ORDER = ["ts", "tsx", "py", "go", "rs", "js", "html", "css", "sql", "json", "md"];
const STRIP_H = ORDER.length * H;
const BG_PALETTE = ["#55D6BE", "#9F5EF4", "#F4D35E", "#FF715B", "#76E5FC"];

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0xc0ffee);
const blobs = [];
for (let i = 0; i < 88; i++) {
  blobs.push({
    x: rng() * W,
    y: rng() * STRIP_H,
    r: 170 + rng() * 260,
    color: BG_PALETTE[Math.floor(rng() * BG_PALETTE.length)],
    opacity: 0.12 + rng() * 0.11,
  });
}
const dots = [];
for (let i = 0; i < 2600; i++) {
  dots.push({
    x: rng() * W,
    y: rng() * STRIP_H,
    r: 1 + rng() * 1.6,
    opacity: 0.04 + rng() * 0.05,
  });
}

function backgroundFragment(idx) {
  const y0 = idx * H;
  const y1 = (idx + 1) * H;
  const parts = [];
  parts.push(`<linearGradient id="strip" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#161a24"/>
    <stop offset="0.3" stop-color="#1a2633"/>
    <stop offset="0.62" stop-color="#292039"/>
    <stop offset="1" stop-color="#132a2e"/>
  </linearGradient>`);
  parts.push(`<rect x="0" y="0" width="${W}" height="${STRIP_H}" fill="url(#strip)"/>`);
  for (const b of blobs) {
    if (b.y < y0 - 480 || b.y > y1 + 480) continue;
    parts.push(`<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" fill="${b.color}" opacity="${b.opacity.toFixed(3)}" filter="url(#blurB)"/>`);
  }
  for (const d of dots) {
    if (d.y < y0 - 2 || d.y > y1 + 2) continue;
    parts.push(`<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r.toFixed(1)}" fill="#ffffff" opacity="${d.opacity.toFixed(3)}"/>`);
  }
  return `<g transform="translate(0, ${-y0})">${parts.join("\n")}</g>`;
}

function buildSvg(langLabel, fileName, code, idx) {
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

  const PAD = 56;
  const RADIUS = 14;
  const winX = PAD;
  const winY = PAD;
  const winW = W - 2 * PAD;
  const winH = H - 2 * PAD;
  const tabBarH = 46;
  const titleBarH = 54;
  const editorY = titleBarH + tabBarH;
  const lineH = 32;
  const fontSize = 18;
  const codeX = winX + 88;
  const gutterX = winX + 62;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`);
  parts.push(`<defs><filter id="blurB" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="90"/></filter>
<clipPath id="win"><rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}"/></clipPath></defs>`);
  parts.push(backgroundFragment(idx));
  parts.push(`<g clip-path="url(#win)">`);

  // title bar
  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${titleBarH}" fill="#262A33"/>`);
  for (const [i, col] of ["#FF715B", "#F4D35E", "#55D6BE"].entries()) {
    parts.push(`<circle cx="${winX + 26 + i * 18}" cy="${winY + 27}" r="7" fill="${col}"/>`);
  }
  parts.push(
    `<text x="${W / 2}" y="${winY + 36}" fill="#a0aec0" font-family="${FONT}" font-size="16" text-anchor="middle">${escapeXml(fileName)} &#8212; Motion Haleness</text>`
  );

  // tab bar
  parts.push(`<rect x="${winX}" y="${winY + titleBarH}" width="${winW}" height="${tabBarH}" fill="#2b2d34"/>`);
  parts.push(`<rect x="${winX + 8}" y="${winY + titleBarH + 2}" width="170" height="${tabBarH - 2}" fill="#0F8B8D" rx="4"/>`);
  parts.push(
    `<text x="${winX + 24}" y="${winY + titleBarH + tabBarH / 2 + 6}" fill="#EEFFFF" font-family="${FONT}" font-size="15">${escapeXml(fileName)}</text>`
  );
  parts.push(
    `<text x="${winX + 190}" y="${winY + titleBarH + tabBarH / 2 + 6}" fill="#a0aec0" font-family="${FONT}" font-size="15">utils.ts</text>`
  );
  parts.push(
    `<text x="${winX + 280}" y="${winY + titleBarH + tabBarH / 2 + 6}" fill="#a0aec0" font-family="${FONT}" font-size="15">README.md</text>`
  );

  // editor background
  parts.push(`<rect x="${winX}" y="${winY + editorY}" width="${winW}" height="${winH - editorY}" fill="#212329"/>`);

  // line numbers + code
  const CHAR_W = fontSize * 0.6;
  const charWidth = (t) => [...t].reduce((n, ch) => n + (ch === "\t" ? 4 : 1), 0);
  lines.forEach((runs, i) => {
    const y = winY + editorY + 38 + i * lineH;
    parts.push(
      `<text x="${gutterX}" y="${y}" fill="#576773" font-family="${FONT}" font-size="${fontSize}" text-anchor="end">${i + 1}</text>`
    );
    const tspans = [];
    let pos = 0;
    let prevWord = "";
    for (const r of runs) {
      for (const raw of splitByChar(r.text, colorFor(r.classes))) {
        const trimmed = raw.text.trim();
        if (!trimmed) {
          pos += charWidth(raw.text);
          continue;
        }
        const leading = (raw.text.match(/^\s*/) || [""])[0];
        const trailing = (raw.text.match(/\s*$/) || [""])[0];
        pos += charWidth(leading);
        let color = raw.color;
        if (langLabel === "go" && prevWord === "type" && color === "#EEFFFF") color = "#F4D35E";
        tspans.push(`<tspan x="${codeX + pos * CHAR_W}" fill="${color}">${escapeXml(trimmed)}</tspan>`);
        pos += charWidth(trimmed) + charWidth(trailing);
        prevWord = trimmed;
      }
    }
    parts.push(`<text x="${codeX}" y="${y}" fill="#EEFFFF" font-family="${FONT}" font-size="${fontSize}">${tspans.join("")}</text>`);
  });

  // status bar
  const sbY = winY + winH - 48;
  parts.push(`<rect x="${winX}" y="${sbY}" width="${winW}" height="${48}" fill="#0F8B8D"/>`);
  parts.push(
    `<text x="${winX + 16}" y="${sbY + 29}" fill="#EEFFFF" font-family="${FONT}" font-size="14">${langLabel.toUpperCase()}</text>`
  );
  parts.push(
    `<text x="${winX + winW - 16}" y="${sbY + 29}" fill="#EEFFFF" font-family="${FONT}" font-size="14" text-anchor="end">Ln ${lines.length}, Col 1 &#160; UTF-8</text>`
  );

  parts.push(`</g>`);
  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}" fill="none" stroke="#3a4150" stroke-width="2"/>`);
  parts.push("</svg>");
  return parts.join("\n");
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const ext of ORDER) {
  const file = `demo.${ext}`;
  const code = fs.readFileSync(path.join(EXAMPLES_DIR, file), "utf8");
  const name = path.basename(file, path.extname(file));
  const svg = buildSvg(ext, file, code, ORDER.indexOf(ext));
  const out = path.join(OUT_DIR, `${name}-${ext}.svg`);
  fs.writeFileSync(out, svg);
  console.log(`wrote ${out}`);
}