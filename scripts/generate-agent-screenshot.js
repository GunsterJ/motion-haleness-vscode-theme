// Renders a screenshot of a real Kilo Code conversation, styled with the
// Motion Haleness chat colors. Requires the Kilo CLI (@kilocode/cli) and
// highlight.js (see scripts/make-screenshots.sh for the one-time install).
// Usage: NODE_PATH=/tmp/mh-tools/node_modules node scripts/generate-agent-screenshot.js [outPng]
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const hljs = require("highlight.js");
const lib = require("./generate-screenshots.js");

const W = lib.W;
const H = lib.H;
const FONT = lib.FONT;
const ORDER_INDEX = 11;

const PROMPT =
  "Explain binary search in 3 short sentences, then give a short Python implementation with a couple of comments.";

function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function parseResponse(raw) {
  const clean = stripAnsi(raw);
  const lines = clean.split("\n").filter((l) => l.trim().length > 0 && !/^> /.test(l));
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^```(\w*)/);
    if (m) {
      const lang = m[1] || "text";
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, text: code.join("\n") });
    } else {
      blocks.push({ type: "text", text: lines[i] });
      i += 1;
    }
  }
  return blocks;
}

function wrap(text, maxChars) {
  const out = [];
  for (const line of text.split("\n")) {
    if (line.length <= maxChars) {
      out.push(line);
      continue;
    }
    let rest = line;
    while (rest.length > maxChars) {
      const cut = rest.lastIndexOf(" ", maxChars);
      const idx = cut > 0 ? cut : maxChars;
      out.push(rest.slice(0, idx));
      rest = rest.slice(idx).replace(/^ /, "");
    }
    if (rest) out.push(rest);
  }
  return out;
}

function renderInline(text, color, fontSize, x0) {
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  let x = x0;
  const parts = [];
  for (const seg of segments) {
    let col = color;
    let bold = false;
    let t = seg;
    if (seg.startsWith("**") && seg.endsWith("**")) {
      col = "#FF715B";
      bold = true;
      t = seg.slice(2, -2);
    } else if (seg.startsWith("`") && seg.endsWith("`")) {
      col = "#76E5FC";
      t = seg.slice(1, -1);
    }
    parts.push(
      `<tspan x="${x.toFixed(1)}" fill="${col}"${bold ? ' font-weight="bold"' : ""}>${lib.escapeXml(t)}</tspan>`
    );
    x += t.length * fontSize * 0.6;
  }
  return parts.join("");
}

function buildConversationSvg(model, blocks) {
  const PAD = 56;
  const RADIUS = 14;
  const winX = PAD;
  const winY = PAD;
  const winW = W - 2 * PAD;
  const winH = H - 2 * PAD;
  const titleBarH = 54;
  const headerH = 52;
  const composerH = 64;
  const chatY = winY + titleBarH + headerH;
  const chatW = winW - 48;
  const chatX = winX + 24;
  const fontSize = 15;
  const lineH = 24;
  const CHAR_W = fontSize * 0.6;
  const maxChars = Math.floor(chatW / CHAR_W) - 2;
  const charWidth = (t) => [...t].reduce((n, ch) => n + (ch === "\t" ? 4 : 1), 0);

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`);
  parts.push(`<defs><filter id="blurB" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="90"/></filter>
<clipPath id="win"><rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}"/></clipPath></defs>`);
  parts.push(lib.backgroundFragment(ORDER_INDEX));
  parts.push(`<g clip-path="url(#win)">`);

  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${titleBarH}" fill="#262A33"/>`);
  for (const [i, col] of ["#FF715B", "#F4D35E", "#55D6BE"].entries()) {
    parts.push(`<circle cx="${winX + 26 + i * 18}" cy="${winY + 27}" r="7" fill="${col}"/>`);
  }
  parts.push(
    `<text x="${W / 2}" y="${winY + 36}" fill="#a0aec0" font-family="${FONT}" font-size="16" text-anchor="middle">Kilo Code &#8212; Motion Haleness</text>`
  );

  parts.push(`<rect x="${winX}" y="${winY + titleBarH}" width="${winW}" height="${headerH}" fill="#2b2d34"/>`);
  parts.push(`<circle cx="${winX + 28}" cy="${winY + titleBarH + headerH / 2}" r="11" fill="#0F8B8D"/>`);
  parts.push(`<text x="${winX + 48}" y="${winY + titleBarH + 21}" fill="#EEFFFF" font-family="${FONT}" font-size="15">Kilo Code</text>`);
  parts.push(`<text x="${winX + 48}" y="${winY + titleBarH + 38}" fill="#a0aec0" font-family="${FONT}" font-size="12">${lib.escapeXml(model || "AI coding agent")}</text>`);

  const chatH = winH - titleBarH - headerH - composerH;
  parts.push(`<rect x="${winX}" y="${chatY}" width="${winW}" height="${chatH}" fill="#262A33"/>`);

  let y = chatY + 26;
  const chatBottom = chatY + chatH;

  const userLines = wrap(PROMPT, maxChars);
  const bubbleW = Math.max(...userLines.map((l) => l.length * CHAR_W)) + 32;
  const bubbleH = userLines.length * lineH + 18;
  const bubbleX = winX + winW - 24 - bubbleW;
  parts.push(`<rect x="${bubbleX}" y="${y}" width="${bubbleW}" height="${bubbleH}" rx="10" fill="#2B2D34" stroke="#4A5667"/>`);
  userLines.forEach((line, i) => {
    parts.push(`<text x="${bubbleX + 16}" y="${y + 26 + i * lineH}" fill="#EEFFFF" font-family="${FONT}" font-size="${fontSize}">${lib.escapeXml(line)}</text>`);
  });
  parts.push(`<text x="${bubbleX + bubbleW - 16}" y="${y + bubbleH + 12}" fill="#a0aec0" font-family="${FONT}" font-size="11" text-anchor="end">You</text>`);
  y += bubbleH + 30;

  parts.push(`<text x="${chatX}" y="${y}" fill="#55D6BE" font-family="${FONT}" font-size="13">Kilo Code</text>`);
  y += 24;

  for (const block of blocks) {
    if (block.type === "code") {
      const codeLines = block.text.split("\n");
      const cbW = Math.max(...codeLines.map((l) => l.length)) * CHAR_W + 40;
      const cbH = codeLines.length * lineH + 28;
      parts.push(`<rect x="${chatX}" y="${y}" width="${cbW}" height="${cbH}" rx="8" fill="#212329" stroke="#4A5667"/>`);
      const lang = hljs.getLanguage(block.lang) ? block.lang : "text";
      const highlighted = hljs.highlight(block.text, { language: lang }).value;
      const lines = [];
      let line = [];
      for (const run of lib.tokensFromHtml(highlighted)) {
        if (run.text.includes("\n")) {
          const ps = run.text.split("\n");
          ps.forEach((p, i) => {
            if (p.length) line.push({ ...run, text: p });
            if (i < ps.length - 1) {
              lines.push(line);
              line = [];
            }
          });
        } else {
          line.push(run);
        }
      }
      lines.push(line);
      lines.forEach((runs, li) => {
        const yy = y + 24 + li * lineH;
        let pos = 0;
        for (const r of runs) {
          for (const seg of lib.splitByChar(r.text, lib.colorFor(r.classes))) {
            const trimmed = seg.text.trim();
            if (!trimmed) {
              pos += charWidth(seg.text);
              continue;
            }
            const leading = (seg.text.match(/^\s*/) || [""])[0];
            const trailing = (seg.text.match(/\s*$/) || [""])[0];
            pos += charWidth(leading);
            parts.push(
              `<text x="${(chatX + 20 + pos * CHAR_W).toFixed(1)}" y="${yy}" font-family="${FONT}" font-size="${fontSize}"><tspan fill="${seg.color}">${lib.escapeXml(trimmed)}</tspan></text>`
            );
            pos += charWidth(trimmed) + charWidth(trailing);
          }
        }
      });
      y += cbH + 18;
    } else {
      for (const line of wrap(block.text, maxChars)) {
        if (y > chatBottom - lineH) break;
        parts.push(
          `<text x="${chatX}" y="${y}" font-family="${FONT}" font-size="${fontSize}">${renderInline(line, "#EEFFFF", fontSize, chatX)}</text>`
        );
        y += lineH;
      }
      y += 6;
    }
  }

  parts.push(`</g>`);

  const compY = winY + winH - composerH;
  parts.push(`<rect x="${winX}" y="${compY}" width="${winW}" height="${composerH}" fill="#2b2d34"/>`);
  parts.push(`<rect x="${winX + 24}" y="${compY + 14}" width="${winW - 48 - 90}" height="36" rx="8" fill="#212329" stroke="#4A5667"/>`);
  parts.push(`<text x="${winX + 38}" y="${compY + 36}" fill="#a0aec0" font-family="${FONT}" font-size="14">Ask Kilo Code anything&#8230;</text>`);
  parts.push(`<rect x="${winX + winW - 24 - 78}" y="${compY + 14}" width="78" height="36" rx="8" fill="#0F8B8D"/>`);
  parts.push(`<text x="${winX + winW - 24 - 39}" y="${compY + 36}" fill="#EEFFFF" font-family="${FONT}" font-size="14" text-anchor="middle">Send</text>`);
  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}" fill="none" stroke="#3a4150" stroke-width="2"/>`);
  parts.push("</svg>");
  return parts.join("\n");
}

let raw;
try {
  raw = fs.readFileSync("/tmp/kilo-out.txt", "utf8");
} catch {
  raw = execFileSync("kilo", ["run", PROMPT], { encoding: "utf8", cwd: "/tmp" });
}
const modelLine = stripAnsi(raw).split("\n").find((l) => /^> /.test(l)) || "";
const model = modelLine.replace(/^>\s*/, "").trim();
const blocks = parseResponse(raw);

const OUT_PNG = process.argv[2] || "assets/screenshots/agent-kilo.png";
const svgPath = "/tmp/agent-kilo.svg";
fs.writeFileSync(svgPath, buildConversationSvg(model, blocks));
execFileSync("qlmanage", ["-t", "-s", "1100", "-o", "/tmp", svgPath], { stdio: "ignore" });
fs.mkdirSync(path.dirname(OUT_PNG), { recursive: true });
fs.copyFileSync("/tmp/agent-kilo.svg.png", OUT_PNG);
console.log(`wrote ${OUT_PNG}`);