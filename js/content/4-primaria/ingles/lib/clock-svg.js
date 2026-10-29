const NUMS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function point(angle, radius) {
  const rad = (angle - 90) * Math.PI / 180;
  return [50 + radius * Math.cos(rad), 50 + radius * Math.sin(rad)];
}

function hand(angle, length, width, color) {
  const [x, y] = point(angle, length);
  return `<line x1="50" y1="50" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

/** Reloj analógico en SVG (viewBox 0 0 100 100) marcando h:m. */
export function clockSvg(h, m) {
  const nums = NUMS.map((n, i) => {
    const [x, y] = point(i * 30, 38);
    return `<text x="${x.toFixed(1)}" y="${(y + 3.4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" font-family="system-ui,sans-serif" fill="var(--text, #1e1b4b)">${n}</text>`;
  }).join('');
  const hourAngle = (h % 12) * 30 + m * 0.5;
  return `<svg viewBox="0 0 100 100" class="clock" role="img" aria-label="clock">`
    + `<circle cx="50" cy="50" r="47" fill="var(--surface, #fff)" stroke="var(--primary, #4f46e5)" stroke-width="4"/>`
    + nums
    + hand(hourAngle, 24, 4.5, 'var(--text, #1e1b4b)')
    + hand(m * 6, 34, 3, 'var(--primary, #4f46e5)')
    + `<circle cx="50" cy="50" r="3" fill="var(--primary, #4f46e5)"/></svg>`;
}
