// Pure-JS pixel barcode (Code 128B) + New-Gen stylized QR code (ECC Level H,
// rounded connected modules, gradient fill, styled finder eyes & center badge).

// ---- Code 128B patterns (bar/space widths, each pattern = 11 modules; Stop = 13) ----
const C128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

export function encodeCode128B(text) {
  const codes = [104]; // Start Code B
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code < 0 || code > 95) continue;
    codes.push(code);
  }
  let sum = 104;
  for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
  codes.push(sum % 103);
  codes.push(106); // Stop

  const bars = [];
  for (const c of codes) {
    const pat = C128_PATTERNS[c];
    for (let i = 0; i < pat.length; i++) bars.push(Number(pat[i]));
  }
  return bars;
}

export function drawCode128(canvas, text) {
  if (!canvas) return;
  const widths = encodeCode128B(text);
  const totalModules = widths.reduce((a, b) => a + b, 0);
  const quiet = 6;
  const w = totalModules + quiet * 2;
  const h = 22;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0d1226';
  let x = quiet;
  widths.forEach((mw, i) => {
    if (i % 2 === 0) ctx.fillRect(x, 1, mw, h - 2);
    x += mw;
  });
}

// ---- QR Code generator (Byte mode, ECC Level H = 30% recovery, Versions 1..6) ----
// Using ECC Level H allows a crisp center emblem without hurting phone scan reliability.
const QR_H_SPECS = [
  null,
  { size: 21, dataBytes: 9,  ecPerBlock: 17, blockSizes: [9], align: [] },
  { size: 25, dataBytes: 16, ecPerBlock: 28, blockSizes: [16], align: [18] },
  { size: 29, dataBytes: 26, ecPerBlock: 22, blockSizes: [13, 13], align: [22] },
  { size: 33, dataBytes: 36, ecPerBlock: 16, blockSizes: [9, 9, 9, 9], align: [26] },
  { size: 37, dataBytes: 46, ecPerBlock: 22, blockSizes: [11, 11, 12, 12], align: [30] },
  { size: 41, dataBytes: 60, ecPerBlock: 28, blockSizes: [15, 15, 15, 15], align: [34] },
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);

function rsGenerator(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

export function rsRemainder(data, ecCount) {
  const gen = rsGenerator(ecCount);
  const res = new Uint8Array(data.length + ecCount);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const factor = res[i];
    if (!factor) continue;
    for (let j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], factor);
  }
  return res.slice(data.length);
}

function formatBitsH(mask) {
  // ECC Level H = 10, format = (10 << 3) | mask = 0b10_xxx
  const data = (0b10 << 3) | mask;
  let rem = data << 10;
  const poly = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= poly << (i - 10);
  }
  return ((data << 10) | rem) ^ 0b101010000010010;
}

function penaltyScore(grid, size) {
  let score = 0;
  for (let r = 0; r < size; r++) {
    let runR = 1, runC = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) { runR++; if (runR === 5) score += 3; else if (runR > 5) score++; } else runR = 1;
      if (grid[c][r] === grid[c - 1][r]) { runC++; if (runC === 5) score += 3; else if (runC > 5) score++; } else runC = 1;
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
    }
  }
  return score;
}

export function encodeQrMatrix(text) {
  const bytes = new TextEncoder().encode(text);
  let ver = 1;
  while (ver < QR_H_SPECS.length - 1 && bytes.length + 2 > QR_H_SPECS[ver].dataBytes) ver++;
  const spec = QR_H_SPECS[ver];
  const { size, dataBytes, ecPerBlock, blockSizes, align } = spec;

  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);
  const capBits = dataBytes * 8;
  pushBits(0, Math.min(4, capBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const padBytes = [0xec, 0x11];
  for (let i = 0; bits.length < capBits; i++) pushBits(padBytes[i & 1], 8);

  const codewords = new Uint8Array(dataBytes);
  for (let i = 0; i < dataBytes; i++) {
    let v = 0;
    for (let b = 0; b < 8; b++) v = (v << 1) | bits[i * 8 + b];
    codewords[i] = v;
  }

  // Split into blocks & interleave (supports equal and unequal block sizes in V1..V6 H)
  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (const len of blockSizes) {
    const slice = codewords.slice(offset, offset + len);
    offset += len;
    dataBlocks.push(slice);
    ecBlocks.push(rsRemainder(slice, ecPerBlock));
  }

  const maxBlockLen = Math.max(...blockSizes);
  const stream = [];
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < blockSizes.length; b++) {
      if (i < dataBlocks[b].length) stream.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < blockSizes.length; b++) stream.push(ecBlocks[b][i]);
  }

  const base = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const isFunc = Array.from({ length: size }, () => new Uint8Array(size));
  const setFunc = (r, c, v) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    base[r][c] = v ? 1 : 0;
    isFunc[r][c] = 1;
  };
  const drawFinder = (tr, tc) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (tr + r < 0 || tc + c < 0 || tr + r >= size || tc + c >= size) continue;
        const inBox = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const dark = inBox && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        setFunc(tr + r, tc + c, dark);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }
  setFunc(size - 8, 8, 1);

  for (const ar of align) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        setFunc(ar + r, ar + c, Math.max(Math.abs(r), Math.abs(c)) !== 1);
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    if (i !== 6) { setFunc(8, i, 0); setFunc(i, 8, 0); }
  }
  for (let i = 0; i < 8; i++) {
    setFunc(8, size - 1 - i, 0);
    if (i < 7) setFunc(size - 1 - i, 8, 0);
  }

  const rawBits = [];
  for (const byte of stream) for (let b = 7; b >= 0; b--) rawBits.push((byte >> b) & 1);
  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let step = 0; step < size; step++) {
      const r = up ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!isFunc[r][c]) {
          base[r][c] = bitIdx < rawBits.length ? rawBits[bitIdx++] : 0;
        }
      }
    }
    up = !up;
  }

  const masks = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (_, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  let bestGrid = null;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    const g = base.map((row, r) => row.map((v, c) => (isFunc[r][c] ? v : v ^ (masks[m](r, c) ? 1 : 0))));
    const fmt = formatBitsH(m);
    for (let i = 0; i <= 5; i++) g[8][i] = (fmt >> (14 - i)) & 1;
    g[8][7] = (fmt >> 8) & 1;
    g[8][8] = (fmt >> 7) & 1;
    g[7][8] = (fmt >> 6) & 1;
    for (let i = 9; i < 15; i++) g[14 - i][8] = (fmt >> (14 - i)) & 1;
    for (let i = 0; i < 8; i++) g[8][size - 1 - i] = (fmt >> i) & 1;
    for (let i = 0; i < 7; i++) g[size - 1 - i][8] = (fmt >> (14 - i)) & 1;

    const sc = penaltyScore(g, size);
    if (sc < bestScore) { bestScore = sc; bestGrid = g; }
  }
  return bestGrid;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws a "new-gen" stylized QR code:
 * - High-DPI canvas with connected/rounded data dots
 * - McLovin navy -> royal blue -> deep teal high-contrast gradient
 * - Stylized rounded finder eyes
 * - Small center badge (protected by ECC Level H 30% error correction)
 */
export function drawQrCode(canvas, text, badge = 'in') {
  if (!canvas) return;
  const grid = encodeQrMatrix(text);
  const n = grid.length;
  const quiet = 3;
  const cell = 12; // high-res crisp canvas (39 * 12 = 468px)
  const totalPx = (n + quiet * 2) * cell;
  canvas.width = totalPx;
  canvas.height = totalPx;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalPx, totalPx);

  const isFinderCell = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  // Center badge cutout (7x7 modules in the middle, safe under ECC H)
  const mid = Math.floor(n / 2);
  const badgeHalf = 3;
  const inBadge = (r, c) =>
    Math.abs(r - mid) <= badgeHalf && Math.abs(c - mid) <= badgeHalf;

  // High-contrast diagonal gradient across the QR code
  const grad = ctx.createLinearGradient(0, 0, totalPx, totalPx);
  grad.addColorStop(0, '#0d1226');
  grad.addColorStop(0.55, '#1d4ed8');
  grad.addColorStop(1, '#0f5257');
  ctx.fillStyle = grad;

  // 1) Draw rounded / connected data & timing modules
  const pad = cell * 0.1;
  const dotSize = cell - pad * 2;
  const rad = cell * 0.28;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c] || isFinderCell(r, c) || inBadge(r, c)) continue;
      const x = (c + quiet) * cell;
      const y = (r + quiet) * cell;
      roundRectPath(ctx, x + pad, y + pad, dotSize, dotSize, rad);
      ctx.fill();

      // Connect orthogonally adjacent dark modules for a fluid "new-gen" look
      if (c + 1 < n && grid[r][c + 1] && !isFinderCell(r, c + 1) && !inBadge(r, c + 1)) {
        ctx.fillRect(x + cell * 0.5, y + pad, cell * 0.6, dotSize);
      }
      if (r + 1 < n && grid[r + 1][c] && !isFinderCell(r + 1, c) && !inBadge(r + 1, c)) {
        ctx.fillRect(x + pad, y + cell * 0.5, dotSize, cell * 0.6);
      }
    }
  }

  // 2) Draw stylized rounded finder eyes
  const drawEye = (fr, fc) => {
    const ox = (fc + quiet) * cell;
    const oy = (fr + quiet) * cell;
    const outer = 7 * cell;

    // Outer rounded dark frame
    ctx.fillStyle = '#0d1226';
    roundRectPath(ctx, ox, oy, outer, outer, cell * 1.4);
    ctx.fill();

    // Inner white cutout
    ctx.fillStyle = '#ffffff';
    roundRectPath(ctx, ox + cell, oy + cell, 5 * cell, 5 * cell, cell * 0.85);
    ctx.fill();

    // Inner vibrant Royal Blue pupil
    ctx.fillStyle = '#1d4ed8';
    roundRectPath(ctx, ox + 2 * cell, oy + 2 * cell, 3 * cell, 3 * cell, cell * 0.55);
    ctx.fill();
  };
  drawEye(0, 0);
  drawEye(0, n - 7);
  drawEye(n - 7, 0);

  // 3) Center pixel badge ("GH" / code crest)
  const bx = (mid - badgeHalf + quiet) * cell;
  const by = (mid - badgeHalf + quiet) * cell;
  const bw = (badgeHalf * 2 + 1) * cell;
  ctx.fillStyle = '#ffffff';
  roundRectPath(ctx, bx + 2, by + 2, bw - 4, bw - 4, cell * 0.9);
  ctx.fill();

  ctx.fillStyle = '#0d1226';
  roundRectPath(ctx, bx + cell * 0.55, by + cell * 0.55, bw - cell * 1.1, bw - cell * 1.1, cell * 0.65);
  ctx.fill();

  // Crisp center mark inside badge
  ctx.fillStyle = '#5cf2c8';
  ctx.font = `900 ${Math.round(cell * 2.5)}px ui-monospace, Menlo, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, bx + bw / 2, by + bw / 2 + 2);
}
