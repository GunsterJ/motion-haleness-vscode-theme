// Renders a screenshot of a real Kilo Code conversation, styled with the
// Motion Haleness chat colors. The conversation data comes from a real Kilo
// session snapshot (assets/examples/kilo-turn.json).
// Usage: NODE_PATH=/tmp/mh-tools/node_modules node scripts/generate-agent-screenshot.js [outPng]
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const lib = require("./generate-screenshots.js");

const W = lib.W;
const H = lib.H;
const FONT = lib.FONT;
const ORDER_INDEX = 11;

const snap = JSON.parse(fs.readFileSync("assets/examples/kilo-turn.json", "utf8"));

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
    parts.push(`<tspan x="${x.toFixed(1)}" fill="${col}"${bold ? ' font-weight="bold"' : ""}>${lib.escapeXml(t)}</tspan>`);
    x += t.length * fontSize * 0.6;
  }
  return parts.join("");
}

function buildConversationSvg() {
  const PAD = 56;
  const RADIUS = 14;
  const winX = PAD;
  const winY = PAD;
  const winW = W - 2 * PAD;
  const winH = H - 2 * PAD;
  const titleBarH = 54;
  const headerH = 66;
  const composerH = 76;
  const chatY = winY + titleBarH + headerH;
  const chatX = winX + 24;
  const chatW = winW - 48;
  const fontSize = 15;
  const lineH = 24;
  const CHAR_W = fontSize * 0.6;
  const maxChars = Math.floor(chatW / CHAR_W) - 2;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`);
  parts.push(`<defs><filter id="blurB" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="90"/></filter>
<clipPath id="win"><rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}"/></clipPath></defs>`);
  parts.push(lib.backgroundFragment(ORDER_INDEX));
  parts.push(`<g clip-path="url(#win)">`);

  // title bar
  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${titleBarH}" fill="#262A33"/>`);
  for (const [i, col] of ["#FF715B", "#F4D35E", "#55D6BE"].entries()) {
    parts.push(`<circle cx="${winX + 26 + i * 18}" cy="${winY + 27}" r="7" fill="${col}"/>`);
  }
  parts.push(
    `<text x="${W / 2}" y="${winY + 36}" fill="#a0aec0" font-family="${FONT}" font-size="16" text-anchor="middle">Kilo Code &#8212; Motion Haleness</text>`
  );

  // header row: title, model, token info, New Session
  parts.push(`<rect x="${winX}" y="${winY + titleBarH}" width="${winW}" height="${headerH}" fill="#2b2d34"/>`);
  parts.push(`<circle cx="${winX + 28}" cy="${winY + titleBarH + 28}" r="11" fill="#0F8B8D"/>`);
  parts.push(`<text x="${winX + 48}" y="${winY + titleBarH + 24}" fill="#EEFFFF" font-family="${FONT}" font-size="15">Kilo Code</text>`);
  parts.push(`<text x="${winX + 48}" y="${winY + titleBarH + 42}" fill="#a0aec0" font-family="${FONT}" font-size="12">${lib.escapeXml(snap.model)}</text>`);

  const totalK = snap.tokens.total != null ? (snap.tokens.total / 1000).toFixed(1) : "0";
  parts.push(`<text x="${winX + winW - 196}" y="${winY + titleBarH + 26}" fill="#a0aec0" font-family="${FONT}" font-size="12" text-anchor="end">${totalK}k tokens</text>`);
  parts.push(`<text x="${winX + winW - 196}" y="${winY + titleBarH + 42}" fill="#576773" font-family="${FONT}" font-size="11" text-anchor="end">reasoning ${Math.round(((snap.tokens.reasoning || 0) / (snap.tokens.total || 1)) * 100)}%</text>`);
  parts.push(`<rect x="${winX + winW - 172}" y="${winY + titleBarH + 16}" width="96" height="32" rx="8" fill="#0F8B8D"/>`);
  parts.push(`<text x="${winX + winW - 124}" y="${winY + titleBarH + 36}" fill="#EEFFFF" font-family="${FONT}" font-size="13" text-anchor="middle">New Session</text>`);

  // chat background
  const chatH = winH - titleBarH - headerH - composerH;
  parts.push(`<rect x="${winX}" y="${chatY}" width="${winW}" height="${chatH}" fill="#262A33"/>`);
  let y = chatY + 24;
  const chatBottom = chatY + chatH;

  // user message bubble
  const userLines = wrap(snap.user, maxChars);
  const bubbleW = Math.max(...userLines.map((l) => l.length * CHAR_W)) + 32;
  const bubbleH = userLines.length * lineH + 18;
  const bubbleX = winX + winW - 24 - bubbleW;
  parts.push(`<rect x="${bubbleX}" y="${y}" width="${bubbleW}" height="${bubbleH}" rx="10" fill="#2B2D34" stroke="#4A5667"/>`);
  userLines.forEach((line, i) => {
    parts.push(`<text x="${bubbleX + 16}" y="${y + 26 + i * lineH}" fill="#EEFFFF" font-family="${FONT}" font-size="${fontSize}">${lib.escapeXml(line)}</text>`);
  });
  parts.push(`<text x="${bubbleX + bubbleW - 16}" y="${y + bubbleH + 12}" fill="#a0aec0" font-family="${FONT}" font-size="11" text-anchor="end">You</text>`);
  y += bubbleH + 28;

  // assistant header
  parts.push(`<circle cx="${chatX + 9}" cy="${y - 6}" r="8" fill="#55D6BE"/>`);
  parts.push(`<text x="${chatX + 24}" y="${y}" fill="#55D6BE" font-family="${FONT}" font-size="13">Kilo Code</text>`);
  y += 20;

  // thinking block (real reasoning)
  const thinkLines = wrap(snap.thinking, maxChars - 6);
  const thinkH = thinkLines.length * lineH + 40;
  parts.push(`<rect x="${chatX}" y="${y}" width="${chatW}" height="${thinkH}" rx="8" fill="#2b2d34" stroke="#4A5667"/>`);
  parts.push(`<circle cx="${chatX + 18}" cy="${y + 19}" r="5" fill="#F4D35E"/>`);
  parts.push(`<text x="${chatX + 30}" y="${y + 24}" fill="#F4D35E" font-family="${FONT}" font-size="12">Thinking</text>`);
  thinkLines.forEach((line, i) => {
    parts.push(`<text x="${chatX + 16}" y="${y + 46 + i * lineH}" font-family="${FONT}" font-size="13">${renderInline(line, "#a0aec0", 13, chatX + 16)}</text>`);
  });
  y += thinkH + 18;

  // response text
  for (const line of wrap(snap.response, maxChars)) {
    if (y > chatBottom - lineH) break;
    parts.push(`<text x="${chatX}" y="${y}" font-family="${FONT}" font-size="${fontSize}">${renderInline(line, "#EEFFFF", fontSize, chatX)}</text>`);
    y += lineH;
  }
  y += 10;

  // files changed chip
  const chipTxt = `${snap.filesChanged} files changed`;
  const chipW = chipTxt.length * 12 * 0.6 + 40;
  parts.push(`<rect x="${chatX}" y="${y}" width="${chipW}" height="28" rx="14" fill="#12352E" stroke="#55D6BE"/>`);
  parts.push(`<circle cx="${chatX + 19}" cy="${y + 14}" r="5" fill="#55D6BE"/>`);
  parts.push(`<text x="${chatX + 32}" y="${y + 19}" fill="#55D6BE" font-family="${FONT}" font-size="12">${chipTxt}</text>`);

  parts.push(`</g>`);

  // composer
  const compY = winY + winH - composerH;
  parts.push(`<rect x="${winX}" y="${compY}" width="${winW}" height="${composerH}" fill="#2b2d34"/>`);
  const inX = winX + 24;
  const inW = winW - 48 - 160;
  parts.push(`<rect x="${inX}" y="${compY + 16}" width="${inW}" height="44" rx="10" fill="#212329" stroke="#4A5667"/>`);
  parts.push(`<path d="M${inX + 24} ${compY + 34} c-3 0 -5 2 -5 5 l0 8 c0 3 2 5 5 5 l14 0 c3 0 5 -2 5 -5 l0 -8 c0 -3 -2 -5 -5 -5" stroke="#a0aec0" stroke-width="1.5" fill="none"/>`);
  parts.push(`<path d="M${inX + 27} ${compY + 40} l3 3 l3 -3" stroke="#a0aec0" stroke-width="1.5" fill="none"/>`);
  parts.push(`<circle cx="${inX + 60}" cy="${compY + 38}" r="6" stroke="#a0aec0" stroke-width="1.5" fill="none"/>`);
  parts.push(`<path d="M${inX + 57} ${compY + 38} l6 0 M${inX + 60} ${compY + 35} l0 6" stroke="#a0aec0" stroke-width="1.5" fill="none"/>`);
  parts.push(`<text x="${inX + 78}" y="${compY + 42}" fill="#a0aec0" font-family="${FONT}" font-size="14">Ask Kilo Code&#8230;</text>`);

  const modW = 96;
  const modX = inX + inW + 10;
  parts.push(`<rect x="${modX}" y="${compY + 16}" width="${modW}" height="44" rx="10" fill="#262A33" stroke="#4A5667"/>`);
  parts.push(`<circle cx="${modX + 14}" cy="${compY + 38}" r="6" fill="#55D6BE"/>`);
  parts.push(`<text x="${modX + 26}" y="${compY + 33}" fill="#EEFFFF" font-family="${FONT}" font-size="11">deepseek</text>`);
  parts.push(`<text x="${modX + 26}" y="${compY + 48}" fill="#a0aec0" font-family="${FONT}" font-size="9">v4-flash-0731</text>`);
  parts.push(`<path d="M${modX + modW - 14} ${compY + 36} l4 4 l-4 4" stroke="#a0aec0" stroke-width="1.5" fill="none"/>`);

  const sndX = modX + modW + 8;
  parts.push(`<rect x="${sndX}" y="${compY + 16}" width="54" height="44" rx="10" fill="#0F8B8D"/>`);
  parts.push(`<text x="${sndX + 27}" y="${compY + 41}" fill="#EEFFFF" font-family="${FONT}" font-size="13" text-anchor="middle">Send</text>`);

  parts.push(`<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="${RADIUS}" fill="none" stroke="#3a4150" stroke-width="2"/>`);
  parts.push("</svg>");
  return parts.join("\n");
}

const OUT_PNG = process.argv[2] || "assets/screenshots/agent-kilo.png";
const svgPath = "/tmp/agent-kilo.svg";
fs.writeFileSync(svgPath, buildConversationSvg());
execFileSync("qlmanage", ["-t", "-s", "1100", "-o", "/tmp", svgPath], { stdio: "ignore" });
fs.mkdirSync(path.dirname(OUT_PNG), { recursive: true });
fs.copyFileSync("/tmp/agent-kilo.svg.png", OUT_PNG);
console.log(`wrote ${OUT_PNG}`);