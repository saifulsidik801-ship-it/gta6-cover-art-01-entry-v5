/* Velvet Horizon — Cover Studio.
   All client-side. Photos never leave the device: uploads are read with
   FileReader into memory and drawn to canvas locally; nothing is posted. */
"use strict";

const $ = (s) => document.querySelector(s);
const coverEl = $("#cover");

/* ---------------- state ---------------- */
const DEMO = [
  { src: "samples/sample-01.jpg", role: "THE DRIVER",  name: "Mara Voss",   px: 50, py: 30, zoom: 112 },
  { src: "samples/sample-02.jpg", role: "THE BOSS",    name: "Dario Fonte", px: 50, py: 26, zoom: 118, hero: true },
  { src: "samples/sample-03.jpg", role: "THE MECHANIC", name: "Lena Cruz",  px: 50, py: 32, zoom: 112 },
  { src: "samples/sample-04.jpg", role: "THE CAPTAIN", name: "Eddie Sol",   px: 50, py: 30, zoom: 112 },
  { src: "samples/sample-05.jpg", role: "THE RIDER",   name: "Kai Mercer",  px: 50, py: 30, zoom: 112 },
  { src: "samples/sample-06.jpg", role: "THE BRAINS",  name: "Ines Duarte", px: 50, py: 30, zoom: 112 },
  { src: "samples/sample-07.jpg", role: "THE GETAWAY", name: "Rico Hale",   px: 50, py: 32, zoom: 112 },
  { src: "samples/sample-08.jpg", role: "THE LOOKOUT", name: "Sofia Reyes", px: 50, py: 30, zoom: 112 },
];

const GRADES = {
  sunset: { label: "Sunset",     css: "saturate(1.28) contrast(1.06) sepia(0.28) hue-rotate(-8deg) brightness(1.03)" },
  vice:   { label: "Vice",       css: "saturate(1.55) contrast(1.12) hue-rotate(-28deg) brightness(1.05)" },
  neon:   { label: "Neon",       css: "saturate(1.85) contrast(1.16) hue-rotate(12deg) brightness(1.04)" },
  golden: { label: "Golden Hour", css: "sepia(0.45) saturate(1.45) contrast(1.06) brightness(1.07)" },
  noir:   { label: "Noir",       css: "grayscale(0.92) contrast(1.22) brightness(0.96)" },
  palm:   { label: "Palm",       css: "saturate(1.12) hue-rotate(10deg) contrast(1.03) brightness(1.02)" },
};

/* Panel rects as fractions of the cover box. Index 1 is the hero (2-3x a small panel).
   Order: [driver, BOSS hero, mechanic, captain, rider, brains, getaway, lookout] */
const LAYOUTS = {
  center: {
    landscape: [
      { x: .012, y: .062, w: .223, h: .42 },   // driver
      { x: .245, y: .062, w: .305, h: .45 },   // HERO (overlaps bottom row top edge)
      { x: .560, y: .062, w: .209, h: .42 },   // mechanic
      { x: .779, y: .062, w: .209, h: .42 },   // captain
      { x: .012, y: .50, w: .223, h: .225 },   // rider
      { x: .245, y: .50, w: .305, h: .225 },   // brains
      { x: .560, y: .50, w: .209, h: .225 },   // getaway
      { x: .779, y: .50, w: .209, h: .225 },   // lookout
    ],
    portrait: [
      { x: .02, y: .365, w: .23, h: .15 },
      { x: .02, y: .05, w: .96, h: .30 },      // HERO banner
      { x: .265, y: .365, w: .23, h: .15 },
      { x: .51, y: .365, w: .23, h: .15 },
      { x: .755, y: .365, w: .225, h: .15 },
      { x: .02, y: .53, w: .31, h: .15 },
      { x: .345, y: .53, w: .31, h: .15 },
      { x: .67, y: .53, w: .31, h: .15 },
    ],
  },
  left: {
    landscape: [
      { x: .357, y: .062, w: .155, h: .32 },
      { x: .012, y: .062, w: .335, h: .663 },  // HERO full height
      { x: .522, y: .062, w: .155, h: .32 },
      { x: .687, y: .062, w: .155, h: .32 },
      { x: .842, y: .062, w: .146, h: .32 },
      { x: .357, y: .40, w: .20, h: .325 },
      { x: .577, y: .40, w: .20, h: .325 },
      { x: .797, y: .40, w: .191, h: .325 },
    ],
    portrait: [
      { x: .48, y: .05, w: .24, h: .15 },
      { x: .02, y: .05, w: .44, h: .63 },      // HERO left column
      { x: .74, y: .05, w: .24, h: .15 },
      { x: .48, y: .215, w: .24, h: .15 },
      { x: .74, y: .215, w: .24, h: .15 },
      { x: .48, y: .38, w: .24, h: .15 },
      { x: .74, y: .38, w: .24, h: .15 },
      { x: .48, y: .545, w: .50, h: .135 },
    ],
  },
  top: {
    landscape: [
      { x: .012, y: .36, w: .236, h: .175 },
      { x: .012, y: .062, w: .976, h: .28 },   // HERO wide banner
      { x: .258, y: .36, w: .236, h: .175 },
      { x: .504, y: .36, w: .236, h: .175 },
      { x: .750, y: .36, w: .238, h: .175 },
      { x: .012, y: .55, w: .318, h: .175 },
      { x: .340, y: .55, w: .318, h: .175 },
      { x: .668, y: .55, w: .320, h: .175 },
    ],
    portrait: [
      { x: .02, y: .365, w: .23, h: .15 },
      { x: .02, y: .05, w: .96, h: .30 },      // HERO banner
      { x: .265, y: .365, w: .23, h: .15 },
      { x: .51, y: .365, w: .23, h: .15 },
      { x: .755, y: .365, w: .225, h: .15 },
      { x: .02, y: .53, w: .31, h: .15 },
      { x: .345, y: .53, w: .31, h: .15 },
      { x: .67, y: .53, w: .31, h: .15 },
    ],
  },
};

const state = {
  layout: "center",
  grade: "sunset",
  size: "16:9",
  titleA: "VELVET",
  titleB: "HORIZON",
  subtitle: "Where the palms burn gold",
  tagline: "EIGHT CREW · ONE SUNSET · NO WAY BACK",
  quote: "A GOLDEN-HOUR GETAWAY WITH TEETH",
  pub: "THE PALM COURT POST",
  seal: "BEST CAST",
  panels: DEMO.map((p) => ({ ...p })),
  selected: 1,
};

const mode = () => (state.size === "16:9" ? "landscape" : "portrait");
const titleText = () => `${state.titleA} ${state.titleB}`.trim();

/* ---------------- DOM render ---------------- */
const BARCODE_BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1];

function barcodeSVG(w, h) {
  let x = 0; const unit = w / BARCODE_BARS.reduce((a, b) => a + b + 1, 0);
  let rects = "";
  for (const b of BARCODE_BARS) {
    rects += `<rect x="${x.toFixed(1)}" y="0" width="${(b * unit).toFixed(1)}" height="${h}"/>`;
    x += (b + 1) * unit;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g fill="#111">${rects}</g></svg>`;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderCover() {
  const rects = LAYOUTS[state.layout][mode()];
  const grade = GRADES[state.grade].css;
  const credits = `A VELVET HORIZON PICTURES PRODUCTION · STARRING YOU AND YOUR CREW · ${state.panels.map((p) => p.name.toUpperCase()).join(" · ")} · SHOT ON YOUR OWN PHONE · GRADED BY HAND · NO PHOTO EVER LEAVES YOUR DEVICE`;
  let html = "";
  state.panels.forEach((p, i) => {
    const r = rects[i];
    html += `<div class="cpanel${p.hero ? " hero" : ""}${i === state.selected ? " selected" : ""}" data-i="${i}"
        style="left:${(r.x * 100).toFixed(2)}%;top:${(r.y * 100).toFixed(2)}%;width:${(r.w * 100).toFixed(2)}%;height:${(r.h * 100).toFixed(2)}%">
      <img src="${esc(p.src)}" alt="${esc(p.name)}" draggable="false"
        style="filter:${grade};object-position:${p.px}% ${p.py}%;transform:scale(${p.zoom / 100})">
      <span class="role" contenteditable="true" spellcheck="false" data-i="${i}">${esc(p.role)}</span>
    </div>`;
  });
  const tbTop = mode() === "landscape" ? 60 : 70;
  const title = titleText();
  html += `
    <div class="topstrip"><span class="stars">★★★★★</span><span>&ldquo;${esc(state.quote)}&rdquo;</span><span class="pub">&mdash; ${esc(state.pub)}</span><span class="volbadge">VOL. 1</span></div>
    <div class="titleblock" style="top:${tbTop}%">
      <div class="title-stack">
        <h2 class="cover-title" id="coverTitle">${esc(title)}</h2>
      </div>
      <div class="script-sub" id="coverScript">${esc(state.subtitle)}</div>
      <div class="tagline">${esc(state.tagline)}</div>
    </div>
    <div class="seal" id="sealEl"><span><small>★ ORIGINAL ★</small>${esc(state.seal)}<small>COVER ART</small></span></div>
    <div class="bottomstrip"><span class="soon">COMING SOON</span><span class="credits">${esc(credits)}</span><span class="barcode">${barcodeSVG(74, 22)}<span>0 10472 85991 8</span></span></div>`;
  coverEl.innerHTML = html;
  coverEl.className = "cover size-" + state.size.replace(":", "-");
  fitTitle();
  placeSeal();
  renderCastStrip();
  syncCropCard();
}

function fitTitle() {
  const t = $("#coverTitle"); if (!t) return;
  const cw = coverEl.clientWidth || 1000;
  // Size from character count, not measurement: this renderer's canvas
  // measureText returns a constant (7560) at every size, and a block h2's
  // scrollWidth never drops below its clientWidth — neither can fit text.
  // Liberation Sans Bold caps average ~0.60em; 0.66 leaves a safety margin.
  const len = Math.max(titleText().length, 1);
  const base = mode() === "landscape" ? cw * 0.105 : cw * 0.13;
  const size = Math.max(20, Math.min(base, (cw * 0.96) / (len * 0.66)));
  t.style.fontSize = size + "px";
  const script = $("#coverScript");
  if (script) script.style.fontSize = (mode() === "landscape" ? cw * 0.038 : cw * 0.052) + "px";
  const tag = coverEl.querySelector(".tagline");
  if (tag) tag.style.fontSize = (mode() === "landscape" ? cw * 0.0165 : cw * 0.021) + "px";
  const roles = coverEl.querySelectorAll(".role");
  roles.forEach((r) => { r.style.fontSize = (cw * (mode() === "landscape" ? 0.0155 : 0.0165)) + "px"; });
  const top = coverEl.querySelector(".topstrip");
  if (top) top.style.fontSize = (cw * 0.0145) + "px";
  const bot = coverEl.querySelector(".bottomstrip");
  if (bot) bot.style.fontSize = (cw * 0.0115) + "px";
}

function placeSeal() {
  const seal = $("#sealEl"); if (!seal) return;
  const cw = coverEl.clientWidth || 1000;
  const d = cw * (mode() === "landscape" ? 0.115 : 0.14);
  seal.style.width = d + "px"; seal.style.height = d + "px";
  seal.style.fontSize = (d * 0.12) + "px";
  seal.style.right = (cw * 0.015) + "px";
  seal.style.top = (mode() === "landscape" ? "63%" : "52%");
  seal.style.clipPath = "polygon(50% 0%,61% 9%,74% 4%,80% 17%,93% 18%,93% 32%,100% 43%,93% 55%,96% 68%,84% 74%,82% 88%,68% 88%,60% 100%,47% 92%,33% 98%,27% 85%,13% 84%,11% 70%,0% 60%,7% 47%,1% 34%,12% 26%,12% 12%,26% 12%)";
}

function renderCastStrip() {
  const strip = $("#castStrip");
  strip.innerHTML = state.panels.map((p, i) =>
    `<figure data-i="${i}" class="${i === state.selected ? "used" : ""}" title="${esc(p.name)} — click to select panel">
      <img src="${esc(p.src)}" alt="${esc(p.name)}"><figcaption>${esc(p.role)}</figcaption></figure>`).join("");
}

function syncCropCard() {
  const p = state.panels[state.selected];
  $("#selName").textContent = `— ${p.name} (${p.role})`;
  $("#inRole").value = p.role;
  $("#inPX").value = p.px; $("#inPY").value = p.py; $("#inZoom").value = p.zoom;
}

/* ---------------- events: cover ---------------- */
coverEl.addEventListener("click", (e) => {
  const panel = e.target.closest(".cpanel");
  if (!panel) return;
  if (e.target.classList.contains("role")) return;
  state.selected = Number(panel.dataset.i);
  renderCover();
});
coverEl.addEventListener("focusout", (e) => {
  if (!e.target.classList || !e.target.classList.contains("role")) return;
  const i = Number(e.target.dataset.i);
  const v = e.target.textContent.trim().toUpperCase().replace(/\s+/g, " ").slice(0, 18) || "THE CREW";
  state.panels[i].role = v;
  renderCover();
});
coverEl.addEventListener("keydown", (e) => {
  if (e.target.classList && e.target.classList.contains("role") && e.key === "Enter") {
    e.preventDefault(); e.target.blur();
  }
});

/* drag to pan the photo inside its panel */
let drag = null;
coverEl.addEventListener("pointerdown", (e) => {
  const panel = e.target.closest(".cpanel");
  if (!panel || e.target.classList.contains("role")) return;
  const i = Number(panel.dataset.i);
  state.selected = i;
  drag = { i, x0: e.clientX, y0: e.clientY, px: state.panels[i].px, py: state.panels[i].py, moved: false };
  coverEl.setPointerCapture(e.pointerId);
});
coverEl.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const panel = coverEl.querySelector(`.cpanel[data-i="${drag.i}"]`);
  if (!panel) return;
  const r = panel.getBoundingClientRect();
  const dx = ((e.clientX - drag.x0) / r.width) * 100;
  const dy = ((e.clientY - drag.y0) / r.height) * 100;
  if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 3) drag.moved = true;
  const p = state.panels[drag.i];
  p.px = Math.max(0, Math.min(100, drag.px - dx * 1.4));
  p.py = Math.max(0, Math.min(100, drag.py - dy * 1.4));
  const img = panel.querySelector("img");
  img.style.objectPosition = `${p.px}% ${p.py}%`;
  $("#inPX").value = p.px; $("#inPY").value = p.py;
});
coverEl.addEventListener("pointerup", (e) => {
  const wasDrag = drag && drag.moved;
  drag = null;
  if (wasDrag) renderCover();
});

/* ---------------- events: sidebar ---------------- */
$("#castStrip").addEventListener("click", (e) => {
  const fig = e.target.closest("figure"); if (!fig) return;
  state.selected = Number(fig.dataset.i); renderCover();
});

$("#upload").addEventListener("change", (e) => {
  const files = [...e.target.files].filter((f) => f.type.startsWith("image/"));
  if (!files.length) return;
  let idx = state.selected;
  files.forEach((f) => {
    const rd = new FileReader();
    rd.onload = () => {
      state.panels[idx % state.panels.length].src = String(rd.result);
      idx += 1; renderCover();
    };
    rd.readAsDataURL(f); // local only — never uploaded anywhere
  });
  e.target.value = "";
});

$("#layoutRow").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  state.layout = b.dataset.layout;
  [...$("#layoutRow").children].forEach((x) => x.classList.toggle("on", x === b));
  renderCover();
});

$("#sizeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  state.size = b.dataset.size;
  [...$("#sizeSeg").children].forEach((x) => x.classList.toggle("on", x === b));
  renderCover();
});

/* grades */
const gradeRow = $("#gradeRow");
gradeRow.innerHTML = Object.entries(GRADES).map(([k, g]) =>
  `<button class="grade${k === state.grade ? " on" : ""}" data-grade="${k}">
    <span class="swatch sw-${k}"></span><span>${g.label}</span></button>`).join("");
gradeRow.addEventListener("click", (e) => {
  const b = e.target.closest(".grade"); if (!b) return;
  state.grade = b.dataset.grade;
  [...gradeRow.children].forEach((x) => x.classList.toggle("on", x === b));
  renderCover();
});

/* words */
const bindWord = (id, key, upper) => {
  $(id).addEventListener("input", (e) => {
    state[key] = upper ? e.target.value.toUpperCase() : e.target.value;
    renderCover();
  });
};
bindWord("#inTitleA", "titleA", true);
bindWord("#inTitleB", "titleB", true);
bindWord("#inSubtitle", "subtitle", false);
bindWord("#inTagline", "tagline", true);
bindWord("#inQuote", "quote", true);
bindWord("#inPub", "pub", true);
bindWord("#inSeal", "seal", true);

$("#inRole").addEventListener("input", (e) => {
  state.panels[state.selected].role = e.target.value.toUpperCase().slice(0, 18);
  const tag = coverEl.querySelector(`.role[data-i="${state.selected}"]`);
  if (tag) tag.textContent = state.panels[state.selected].role;
  renderCastStrip();
});
const bindCrop = (id, key) => {
  $(id).addEventListener("input", (e) => {
    state.panels[state.selected][key] = Number(e.target.value);
    const panel = coverEl.querySelector(`.cpanel[data-i="${state.selected}"]`);
    if (!panel) return;
    const img = panel.querySelector("img"); const p = state.panels[state.selected];
    img.style.objectPosition = `${p.px}% ${p.py}%`;
    img.style.transform = `scale(${p.zoom / 100})`;
  });
};
bindCrop("#inPX", "px"); bindCrop("#inPY", "py"); bindCrop("#inZoom", "zoom");

$("#shuffleBtn").addEventListener("click", () => {
  const srcs = state.panels.map((p) => p.src);
  for (let i = srcs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [srcs[i], srcs[j]] = [srcs[j], srcs[i]];
  }
  state.panels.forEach((p, i) => { p.src = srcs[i]; });
  renderCover();
});
$("#resetBtn").addEventListener("click", () => {
  state.panels = DEMO.map((p) => ({ ...p }));
  state.selected = 1; renderCover();
});

/* ---------------- PNG export (canvas, mirrors the DOM) ---------------- */
const EXPORT_SIZE = { "16:9": [1920, 1080], "1:1": [1080, 1080], "4:5": [1080, 1350] };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

function drawCoverPhoto(ctx, im, x, y, w, h, p) {
  const base = Math.max(w / im.naturalWidth, h / im.naturalHeight) * (p.zoom / 100);
  const dw = im.naturalWidth * base, dh = im.naturalHeight * base;
  const dx = x + (w - dw) * (p.px / 100), dy = y + (h - dh) * (p.py / 100);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.filter = GRADES[state.grade].css;
  ctx.drawImage(im, dx, dy, dw, dh);
  ctx.restore();
  // warm sunset wash
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const wash = ctx.createLinearGradient(0, y, 0, y + h);
  wash.addColorStop(0, "rgba(255,150,40,0.10)");
  wash.addColorStop(0.78, "rgba(255,60,120,0.12)");
  wash.addColorStop(1, "rgba(40,10,60,0.18)");
  ctx.fillStyle = wash; ctx.fillRect(x, y, w, h);
  ctx.restore();
}


// Estimate a line's width from its characters: Liberation Sans Bold caps
// average ~0.62em, narrow glyphs less. Used instead of ctx.measureText,
// which this headless renderer answers with a constant.
function estWidth(text, px) { return text.length * px * 0.62; }

function drawRoleTag(ctx, x, y, h, text, maxW) {
  ctx.font = `900 ${h}px "Arial Black","Liberation Sans",Arial,sans-serif`;
  const tw = Math.min(estWidth(text, h), maxW);
  const pad = h * 0.55, slash = h * 0.42;
  const bw = tw + pad * 2 + slash;
  ctx.save();
  ctx.fillStyle = "rgba(8,4,16,0.92)";
  ctx.fillRect(x, y, bw, h * 1.5);
  ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
  ctx.strokeRect(x, y, bw, h * 1.5);
  // yellow/pink diagonal slash
  const g = ctx.createLinearGradient(x, y, x + slash, y + h * 1.5);
  g.addColorStop(0, "#ffc93c"); g.addColorStop(1, "#ff2e88");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + slash * 0.3, y); ctx.lineTo(x + slash, y);
  ctx.lineTo(x + slash * 0.7, y + h * 1.5); ctx.lineTo(x, y + h * 1.5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(text, x + slash + pad * 0.7, y + h * 0.78, tw);
  ctx.restore();
}

function drawStar(ctx, cx, cy, rO, rI, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rO : rI;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawTitleBlock(ctx, W, H, topY, titleH) {
  const title = titleText();
  // Character-count sizing (same rule as the DOM): this renderer's canvas
  // measureText is unreliable, and Liberation Sans Bold caps average ~0.60em.
  let size = Math.max(24, Math.min(titleH, (W * 0.96) / (Math.max(title.length, 1) * 0.66)));
  ctx.font = `900 ${size}px "Arial Black","Liberation Sans",Arial,sans-serif`;
  // offscreen: stroke + gradient fill + stripe cut
  const off = document.createElement("canvas");
  off.width = W; off.height = Math.ceil(size * 1.35);
  const o = off.getContext("2d");
  o.font = `900 ${size}px "Arial Black","Liberation Sans",Arial,sans-serif`;
  o.textAlign = "center"; o.textBaseline = "middle";
  o.lineJoin = "round";
  o.strokeStyle = "#fff"; o.lineWidth = size * 0.09;
  o.strokeText(title, W / 2, off.height / 2);
  const g = o.createLinearGradient(0, 0, 0, off.height);
  g.addColorStop(0, "#fff6a3"); g.addColorStop(0.22, "#ffd23c");
  g.addColorStop(0.48, "#ff8a2a"); g.addColorStop(0.74, "#ff2e88"); g.addColorStop(1, "#ff5e8a");
  o.fillStyle = g;
  o.fillText(title, W / 2, off.height / 2);
  o.globalCompositeOperation = "source-atop";
  o.fillStyle = "rgba(20,4,30,0.85)";
  for (let y = 0; y < off.height; y += Math.max(8, size * 0.085)) o.fillRect(0, y, W, Math.max(3, size * 0.022));
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = size * 0.12; ctx.shadowOffsetY = size * 0.05;
  ctx.drawImage(off, 0, topY);
  ctx.restore();

  // neon script subtitle
  const subSize = size * 0.38;
  ctx.save();
  ctx.font = `italic 700 ${subSize}px "Brush Script MT","Segoe Script",cursive`;
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(255,46,136,0.9)"; ctx.shadowBlur = subSize * 0.5;
  ctx.fillStyle = "#ff8fd0";
  ctx.fillText(state.subtitle, W / 2, topY + off.height + size * 0.02);
  ctx.restore();

  // tagline banner
  const tagSize = size * 0.15;
  ctx.font = `900 ${tagSize}px "Liberation Sans",Arial,sans-serif`;
  const tw = estWidth(state.tagline, tagSize);
  const bx = (W - tw) / 2 - tagSize * 0.9, by = topY + off.height + subSize + size * 0.14;
  const bh = tagSize * 2.1;
  const bg = ctx.createLinearGradient(bx, 0, bx + tw + tagSize * 1.8, 0);
  bg.addColorStop(0, "#1a0b2e"); bg.addColorStop(0.5, "#a3135f"); bg.addColorStop(1, "#1a0b2e");
  ctx.fillStyle = bg; ctx.fillRect(bx, by, tw + tagSize * 1.8, bh);
  ctx.strokeStyle = "rgba(255,201,60,0.65)"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, tw + tagSize * 1.8, bh);
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(state.tagline, W / 2, by + bh / 2);
}

async function buildExportCanvas() {
  const [W, H] = EXPORT_SIZE[state.size];
  const imgs = await Promise.all(state.panels.map((p) => loadImage(p.src)));
  const cv = $("#exportCanvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const land = mode() === "landscape";

    // sunset backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#ff9a3d"); bg.addColorStop(0.45, "#ff5e62");
    bg.addColorStop(0.75, "#c22a7a"); bg.addColorStop(1, "#2b0f45");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // panels
    const rects = LAYOUTS[state.layout][mode()];
    const heroIdx = 1;
    const order = [0, 2, 3, 4, 5, 6, 7, heroIdx]; // hero last so it pops over neighbours
    for (const i of order) {
      const r = rects[i];
      const x = r.x * W, y = r.y * H, w = r.w * W, h = r.h * H;
      drawCoverPhoto(ctx, imgs[i], x, y, w, h, state.panels[i]);
      ctx.strokeStyle = "#ffe9a8"; ctx.lineWidth = i === heroIdx ? 5 : 3;
      ctx.strokeRect(x, y, w, h);
      drawRoleTag(ctx, x, y + h * 0.78, h * 0.085, state.panels[i].role, w * 0.92);
    }

    // top strip
    const topH = H * 0.056;
    ctx.fillStyle = "#160a28"; ctx.fillRect(0, 0, W, topH);
    ctx.fillStyle = "rgba(255,201,60,0.5)"; ctx.fillRect(0, topH - 2, W, 2);
    ctx.textBaseline = "middle";
    const qSize = H * 0.02;
    ctx.font = `900 ${qSize}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillStyle = "#ffc93c";
    ctx.textAlign = "left";
    ctx.fillText("★★★★★", W * 0.02, topH / 2);
    ctx.fillStyle = "#ffdf8a";
    const qx = W * 0.02 + estWidth("★★★★★ ", qSize);
    ctx.fillText(`“${state.quote}”`, qx, topH / 2);
    const qw = estWidth(`“${state.quote}”`, qSize);
    ctx.fillStyle = "#ff7ab8";
    ctx.font = `700 ${qSize}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillText(`— ${state.pub}`, qx + qw + W * 0.012, topH / 2);
    // VOL badge
    ctx.font = `900 ${qSize}px "Liberation Sans",Arial,sans-serif`;
    const vb = "VOL. 1";
    const vbw = estWidth(vb, qSize) + qSize * 1.2;
    ctx.fillStyle = "#ffc93c";
    ctx.fillRect(W - vbw - W * 0.012, topH / 2 - qSize * 0.75, vbw, qSize * 1.5);
    ctx.fillStyle = "#1a0b2e"; ctx.textAlign = "center";
    ctx.fillText(vb, W - vbw / 2 - W * 0.012, topH / 2 + 1);

    // title block
    const titleTop = land ? H * 0.60 : H * 0.635;
    drawTitleBlock(ctx, W, H, titleTop, land ? H * 0.17 : H * 0.10);

    // gold starburst seal
    const sd = W * (land ? 0.115 : 0.14);
    const sx = W - sd * 0.62, sy = land ? H * 0.74 : H * 0.585;
    const sg = ctx.createRadialGradient(sx, sy - sd * 0.1, sd * 0.1, sx, sy, sd * 0.55);
    sg.addColorStop(0, "#ffe98a"); sg.addColorStop(0.55, "#ffc93c"); sg.addColorStop(1, "#e89b0c");
    ctx.fillStyle = sg;
    drawStar(ctx, sx, sy, sd / 2, sd * 0.38, 14); ctx.fill();
    ctx.fillStyle = "#2a1503"; ctx.textAlign = "center";
    ctx.font = `900 ${sd * 0.075}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillText("★ ORIGINAL ★", sx, sy - sd * 0.16);
    let sealSize = sd * 0.16;
    ctx.font = `900 ${sealSize}px "Liberation Sans",Arial,sans-serif`;
    while (estWidth(state.seal, sealSize) > sd * 0.78 && sealSize > 8) {
      sealSize *= 0.92;
      ctx.font = `900 ${sealSize}px "Liberation Sans",Arial,sans-serif`;
    }
    ctx.fillText(state.seal, sx, sy + sd * 0.05);
    ctx.font = `900 ${sd * 0.075}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillText("COVER ART", sx, sy + sd * 0.24);

    // bottom strip
    const botH = H * 0.064, by = H - botH;
    ctx.fillStyle = "#12081f"; ctx.fillRect(0, by, W, botH);
    ctx.fillStyle = "rgba(255,201,60,0.5)"; ctx.fillRect(0, by, W, 2);
    const bSize = H * 0.016;
    ctx.font = `900 ${bSize * 1.15}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillStyle = "#ffc93c"; ctx.textAlign = "left";
    ctx.fillText("COMING SOON", W * 0.016, by + botH / 2);
    const credits = `A VELVET HORIZON PICTURES PRODUCTION · STARRING YOU AND YOUR CREW · SHOT ON YOUR OWN PHONE · GRADED BY HAND · NO PHOTO EVER LEAVES YOUR DEVICE`;
    ctx.font = `700 ${bSize}px "Liberation Sans",Arial,sans-serif`;
    ctx.fillStyle = "#efe6ff";
    ctx.save();
    ctx.beginPath(); ctx.rect(W * 0.016 + estWidth("COMING SOON  ", bSize * 1.15) + W * 0.01, by, W * 0.62, botH); ctx.clip();
    ctx.fillText(credits, W * 0.016 + estWidth("COMING SOON  ", bSize * 1.15) + W * 0.01, by + botH / 2);
    ctx.restore();
    // barcode
    const bw2 = W * 0.075, bh2 = botH * 0.62;
    const bx2 = W - bw2 - W * 0.012, by2 = by + (botH - bh2) / 2 - bSize * 0.4;
    ctx.fillStyle = "#fff"; ctx.fillRect(bx2, by2, bw2, bh2);
    ctx.fillStyle = "#111";
    let bx = bx2;
    const unit = bw2 / BARCODE_BARS.reduce((a, b) => a + b + 1, 0);
    for (const b of BARCODE_BARS) { ctx.fillRect(bx, by2, b * unit, bh2); bx += (b + 1) * unit; }
    ctx.fillStyle = "#fff"; ctx.font = `${bSize * 0.8}px "Liberation Sans",Arial,sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("0 10472 85991 8", bx2 + bw2 / 2, by + botH - bSize * 0.35);

    // role tags last so they stay legible where the title overlaps the panels
    for (let i = 0; i < 8; i++) {
      const r = rects[i];
      const x = r.x * W, y = r.y * H, w = r.w * W, h = r.h * H;
      drawRoleTag(ctx, x, y + h * 0.78, h * 0.085, state.panels[i].role, w * 0.92);
    }
  return cv;
}

async function exportPNG() {
  const note = $("#exportNote");
  note.textContent = "Rendering PNG…";
  try {
    const cv = await buildExportCanvas();
    const [W, H] = EXPORT_SIZE[state.size];
    const a = document.createElement("a");
    a.download = `velvet-horizon-cover-${state.size.replace(":", "x")}.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
    note.textContent = `Exported ${W}×${H} PNG — saved to your downloads.`;
  } catch (err) {
    note.textContent = "Export failed: " + err.message;
  }
}
$("#exportBtn").addEventListener("click", exportPNG);
window.__velvet = { state, buildExportCanvas };

/* ---------------- boot ---------------- */
const params = new URLSearchParams(location.search);
if (params.get("shot") === "cover") document.body.classList.add("shot-cover");
if (params.get("layout") && LAYOUTS[params.get("layout")]) state.layout = params.get("layout");
if (params.get("grade") && GRADES[params.get("grade")]) state.grade = params.get("grade");
if (params.get("size") && EXPORT_SIZE[params.get("size")]) state.size = params.get("size");
if (params.get("title")) {
  const words = params.get("title").trim().split(/\s+/);
  if (words[0]) state.titleA = words[0].toUpperCase();
  if (words[1]) state.titleB = words[1].toUpperCase();
}
[...$("#layoutRow").children].forEach((x) => x.classList.toggle("on", x.dataset.layout === state.layout));
[...$("#sizeSeg").children].forEach((x) => x.classList.toggle("on", x.dataset.size === state.size));
[...gradeRow.children].forEach((x) => x.classList.toggle("on", x.dataset.grade === state.grade));
$("#inTitleA").value = state.titleA; $("#inTitleB").value = state.titleB;

renderCover();
window.addEventListener("resize", () => { fitTitle(); placeSeal(); });
