// The three scenes, drawn procedurally on canvas 2D. Every picture is original art made
// here from rectangles, circles and polygons; nothing is loaded from a file or a network.
// Each scene draws twice, once for the left picture and once for the right: the `diffs` set
// holds the ids of the differences applied to that picture, so the two sides differ only
// where a difference says so. All coordinates are panel-local: the panel is 600 wide and
// 540 tall, with (0, 0) at its top left corner.

/** Where each difference sits, in panel-local coordinates, with its click radius. */
export const DIFFS = {
  market: [
    { x: 92, y: 82, r: 36, label: 'the sun' },
    { x: 468, y: 428, r: 34, label: 'the cat' },
    { x: 148, y: 402, r: 36, label: 'the fruit' },
    { x: 300, y: 208, r: 30, label: 'the price sign' },
    { x: 522, y: 152, r: 34, label: 'the bananas' },
    { x: 382, y: 62, r: 30, label: 'the awning stripe' },
    { x: 92, y: 482, r: 34, label: 'the basket' },
  ],
  danfo: [
    { x: 92, y: 118, r: 36, label: 'the lamp glow' },
    { x: 375, y: 288, r: 30, label: 'the passenger' },
    { x: 520, y: 182, r: 30, label: 'the sign' },
    { x: 300, y: 482, r: 38, label: 'the puddle' },
    { x: 202, y: 92, r: 26, label: 'the bird' },
    { x: 420, y: 382, r: 30, label: 'the number plate' },
    { x: 502, y: 302, r: 34, label: 'the kiosk roof' },
  ],
  lagoon: [
    { x: 152, y: 102, r: 28, label: 'the bird' },
    { x: 402, y: 202, r: 38, label: 'the sail' },
    { x: 522, y: 302, r: 36, label: 'the palm tree' },
    { x: 302, y: 432, r: 36, label: 'the reflection' },
    { x: 182, y: 322, r: 28, label: 'the hat' },
    { x: 452, y: 82, r: 34, label: 'the cloud' },
    { x: 252, y: 422, r: 30, label: 'the fish' },
  ],
};

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function text(ctx, value, x, y, size, color, align) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function skyBands(ctx, w, h, colors) {
  const band = h / colors.length;
  for (let i = 0; i < colors.length; i += 1) rect(ctx, 0, i * band, w, band + 1, colors[i]);
}

function sunWithRays(ctx, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8));
    ctx.lineTo(x + Math.cos(a) * (r + 22), y + Math.sin(a) * (r + 22));
    ctx.stroke();
  }
  circle(ctx, x, y, r, color);
}

function bird(ctx, x, y, color, scale) {
  const s = scale || 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x - 8 * s, y, 8 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 8 * s, y, 8 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function basketOfFruit(ctx, x, y, fruitColor, fruitCount) {
  // A woven basket with round fruit piled above its rim.
  for (let i = 0; i < fruitCount; i += 1) {
    const fx = x - 28 + (i % 4) * 19;
    const fy = y - 14 - Math.floor(i / 4) * 16;
    circle(ctx, fx, fy, 10, fruitColor);
  }
  poly(ctx, [[x - 44, y - 4], [x + 44, y - 4], [x + 34, y + 26], [x - 34, y + 26]], '#8a5a2b');
  rect(ctx, x - 44, y - 4, 88, 7, '#6e451f');
}

function person(ctx, x, y, skin, shirt, wrap) {
  // A standing figure: head, headwrap, body and legs, about 110 tall.
  circle(ctx, x, y - 78, 16, skin);
  poly(ctx, [[x - 17, y - 84], [x + 17, y - 84], [x + 12, y - 98], [x - 12, y - 98]], wrap);
  circle(ctx, x, y - 96, 7, wrap);
  poly(ctx, [[x - 20, y - 60], [x + 20, y - 60], [x + 26, y + 6], [x - 26, y + 6]], shirt);
  rect(ctx, x - 18, y + 6, 14, 44, '#2b2b3a');
  rect(ctx, x + 4, y + 6, 14, 44, '#2b2b3a');
}

function palmTree(ctx, x, y, scale) {
  const s = scale || 1;
  ctx.strokeStyle = '#6e451f';
  ctx.lineWidth = 9 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 10 * s, y - 60 * s, x + 26 * s, y - 105 * s);
  ctx.stroke();
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 6 * s;
  const topX = x + 26 * s;
  const topY = y - 105 * s;
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI * i) / 3 - 0.4;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * 34 * s, topY + Math.sin(a) * 20 * s - 12 * s, topX + Math.cos(a) * 52 * s, topY + Math.sin(a) * 34 * s + 10 * s);
    ctx.stroke();
  }
  circle(ctx, topX - 6, topY + 6, 6 * s, '#5d4037');
  circle(ctx, topX + 7, topY + 8, 6 * s, '#5d4037');
}

/** Scene 1: a market stall in bright daylight. */
export function drawMarket(ctx, diffs) {
  skyBands(ctx, 600, 540, ['#7ec8f2', '#a5dcf7', '#cfeefb']);
  // Distant rooftops.
  poly(ctx, [[0, 300], [90, 250], [180, 300]], '#c98f5a');
  rect(ctx, 200, 260, 130, 40, '#b57a45');
  poly(ctx, [[200, 260], [265, 225], [330, 260]], '#8a5a2b');
  rect(ctx, 380, 270, 150, 30, '#a3d9a5');
  // The ground.
  rect(ctx, 0, 300, 600, 240, '#c9a06b');
  rect(ctx, 0, 300, 600, 10, '#a87f4e');
  // Diff 0: the sun is missing on the right.
  if (!diffs.has(0)) sunWithRays(ctx, 92, 82, 30, '#ffd93b');
  // Diff 5: one awning stripe is red on the left, blue on the right.
  const stripeColors = ['#d94f3d', '#f2b705', '#d94f3d', '#f2b705', diffs.has(5) ? '#3d6fd9' : '#d94f3d', '#f2b705', '#d94f3d'];
  for (let i = 0; i < 7; i += 1) {
    poly(ctx, [[60 + i * 70, 60], [120 + i * 70, 60], [112 + i * 70, 118], [68 + i * 70, 118]], stripeColors[i]);
  }
  rect(ctx, 48, 52, 504, 10, '#7a4a21');
  rect(ctx, 60, 118, 8, 150, '#7a4a21');
  rect(ctx, 532, 118, 8, 150, '#7a4a21');
  // The stall counter.
  rect(ctx, 60, 330, 480, 26, '#7a4a21');
  rect(ctx, 60, 356, 480, 90, '#96602e');
  // Baskets on the counter. Diff 2: oranges on the left, green apples on the right.
  basketOfFruit(ctx, 148, 330, diffs.has(2) ? '#4caf50' : '#f2811d', 9);
  basketOfFruit(ctx, 262, 330, '#d94f3d', 9);
  basketOfFruit(ctx, 420, 330, '#f2b705', 9);
  // Diff 3: the price sign reads 20 on the left, 50 on the right.
  rect(ctx, 268, 176, 64, 46, '#fff8e1');
  rect(ctx, 268, 176, 64, 46, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 3;
  ctx.strokeRect(268, 176, 64, 46);
  text(ctx, diffs.has(3) ? '50' : '20', 300, 200, 26, '#5d4037', 'center');
  text(ctx, 'NAIRA', 300, 214, 10, '#8a5a2b', 'center');
  // Diff 4: the hanging bananas are missing on the right.
  if (!diffs.has(4)) {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(522, 118);
    ctx.lineTo(522, 136);
    ctx.stroke();
    for (let i = 0; i < 3; i += 1) {
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(512 + i * 10, 138);
      ctx.quadraticCurveTo(508 + i * 10, 168, 516 + i * 10, 182);
      ctx.stroke();
    }
  }
  // The vendor behind the counter.
  person(ctx, 300, 330, '#8a5a2b', '#2e7d32', '#d94f3d');
  // Crates stacked at the side.
  rect(ctx, 440, 446, 70, 44, '#a5672f');
  rect(ctx, 440, 446, 70, 8, '#7a4a21');
  rect(ctx, 510, 446, 60, 44, '#a5672f');
  // Diff 1: a cat sits on the crate on the right only.
  if (diffs.has(1)) {
    ellipse(ctx, 468, 436, 22, 15, '#3a3a3a');
    circle(ctx, 486, 418, 11, '#3a3a3a');
    poly(ctx, [[480, 410], [484, 398], [488, 410]], '#3a3a3a');
    poly(ctx, [[490, 410], [494, 398], [496, 410]], '#3a3a3a');
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(448, 436);
    ctx.quadraticCurveTo(432, 430, 434, 414);
    ctx.stroke();
  }
  // Diff 6: an extra basket on the ground on the right only.
  if (diffs.has(6)) basketOfFruit(ctx, 92, 500, '#f2811d', 7);
}

/** Scene 2: a danfo bus stop at dusk. */
export function drawDanfo(ctx, diffs) {
  skyBands(ctx, 600, 540, ['#3b2a5e', '#7a3b6e', '#e0784a', '#f2a65a']);
  // Low sun and a power line with birds.
  circle(ctx, 470, 150, 34, '#ffd93b');
  ctx.strokeStyle = '#241a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.lineTo(600, 96);
  ctx.stroke();
  bird(ctx, 120, 82, '#241a1a', 0.9);
  // Diff 4: an extra bird on the wire on the right only.
  if (diffs.has(4)) bird(ctx, 202, 90, '#241a1a', 0.9);
  // The road and pavement.
  rect(ctx, 0, 380, 600, 160, '#3a3a44');
  rect(ctx, 0, 380, 600, 8, '#f2b705');
  rect(ctx, 0, 330, 600, 50, '#8a8078');
  // The danfo bus: yellow body, windows, wheels, number plate.
  poly(ctx, [[90, 240], [510, 240], [540, 330], [540, 380], [90, 380], [90, 300]], '#f2c200');
  rect(ctx, 90, 240, 420, 16, '#d9a400');
  rect(ctx, 110, 262, 90, 52, '#bfe3f2');
  rect(ctx, 220, 262, 90, 52, '#bfe3f2');
  rect(ctx, 330, 262, 90, 52, '#bfe3f2');
  rect(ctx, 440, 262, 70, 52, '#bfe3f2');
  // Diff 1: a passenger shows in the middle window on the left only.
  if (!diffs.has(1)) {
    circle(ctx, 375, 290, 14, '#8a5a2b');
    poly(ctx, [[359, 306], [391, 306], [397, 314], [353, 314]], '#2e7d32');
  }
  rect(ctx, 96, 330, 60, 46, '#2b2b3a');
  circle(ctx, 180, 384, 26, '#1a1a1a');
  circle(ctx, 180, 384, 11, '#8a8a8a');
  circle(ctx, 460, 384, 26, '#1a1a1a');
  circle(ctx, 460, 384, 11, '#8a8a8a');
  // Diff 5: the number plate reads 42 on the left, 24 on the right.
  rect(ctx, 396, 362, 48, 22, '#fff8e1');
  text(ctx, diffs.has(5) ? '24' : '42', 420, 374, 16, '#1a1a1a', 'center');
  text(ctx, 'LAG', 380, 352, 12, '#f2c200', 'center');
  // The street lamp. Diff 0: its glow is on only on the right.
  rect(ctx, 86, 130, 10, 250, '#2b2b3a');
  rect(ctx, 76, 118, 32, 14, '#2b2b3a');
  if (diffs.has(0)) {
    circle(ctx, 92, 140, 44, 'rgba(255, 217, 59, 0.28)');
    circle(ctx, 92, 140, 26, 'rgba(255, 217, 59, 0.45)');
  }
  circle(ctx, 92, 140, 12, diffs.has(0) ? '#ffd93b' : '#6e6e6e');
  // The bus stop sign. Diff 2: BUS STOP on the left, BUS TOP on the right.
  rect(ctx, 514, 200, 10, 180, '#2b2b3a');
  rect(ctx, 478, 158, 82, 52, '#1a6fd9');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(478, 158, 82, 52);
  text(ctx, diffs.has(2) ? 'BUS TOP' : 'BUS STOP', 519, 176, 15, '#ffffff', 'center');
  text(ctx, 'DANFO', 519, 196, 12, '#ffffff', 'center');
  // Two people waiting.
  person(ctx, 160, 330, '#6e451f', '#d94f3d', '#f2b705');
  person(ctx, 230, 330, '#8a5a2b', '#1a6fd9', '#2e7d32');
  // The kiosk. Diff 6: its roof is red on the left, green on the right.
  poly(ctx, [[452, 300], [552, 300], [532, 268], [472, 268]], diffs.has(6) ? '#2e7d32' : '#d94f3d');
  rect(ctx, 462, 300, 80, 80, '#c9a06b');
  rect(ctx, 486, 318, 32, 62, '#5d4037');
  // Diff 3: a puddle on the road on the left only.
  if (!diffs.has(3)) {
    ellipse(ctx, 300, 482, 62, 12, '#7a6fd9');
    ellipse(ctx, 300, 482, 44, 7, '#9a8fe0');
  }
}

/** Scene 3: the lagoon at sunset, with boats and palm trees. */
export function drawLagoon(ctx, diffs) {
  skyBands(ctx, 600, 540, ['#ff9d5c', '#ff7e5f', '#c94b7c', '#7a3b6e']);
  // The sun sits low over the water.
  circle(ctx, 302, 300, 46, '#ffd93b');
  circle(ctx, 302, 300, 58, 'rgba(255, 217, 59, 0.25)');
  // Clouds. Diff 5: an extra cloud on the right only.
  ellipse(ctx, 120, 90, 52, 16, '#ffd9c2');
  ellipse(ctx, 150, 80, 36, 13, '#ffd9c2');
  if (diffs.has(5)) {
    ellipse(ctx, 452, 82, 48, 15, '#ffd9c2');
    ellipse(ctx, 478, 72, 32, 12, '#ffd9c2');
  }
  // Birds. Diff 0: one bird is missing on the right.
  if (!diffs.has(0)) bird(ctx, 152, 102, '#3a1f2e', 1);
  bird(ctx, 220, 76, '#3a1f2e', 0.9);
  bird(ctx, 520, 130, '#3a1f2e', 0.9);
  // The water.
  rect(ctx, 0, 330, 600, 210, '#2b4a7a');
  rect(ctx, 0, 330, 600, 8, '#3d6fa8');
  // Diff 3: the sun's reflection is missing on the right.
  if (!diffs.has(3)) {
    for (let i = 0; i < 5; i += 1) {
      rect(ctx, 262 + (i % 2) * 22, 352 + i * 22, 58 - i * 6, 8, 'rgba(255, 217, 59, 0.55)');
    }
  }
  // The shore and palm trees on the left.
  poly(ctx, [[0, 540], [0, 470], [220, 470], [260, 540]], '#3d6b35');
  palmTree(ctx, 60, 500, 1);
  palmTree(ctx, 140, 505, 0.8);
  // Diff 2: an extra palm tree on the right only.
  if (diffs.has(2)) palmTree(ctx, 522, 505, 0.9);
  // The canoe with the fisherman.
  poly(ctx, [[120, 400], [240, 400], [220, 424], [140, 424]], '#6e451f');
  rect(ctx, 168, 386, 8, 16, '#5d4037');
  // Diff 4: the fisherman's hat is red on the left, blue on the right.
  person(ctx, 182, 400, '#6e451f', '#f2ead6', diffs.has(4) ? '#1a6fd9' : '#d94f3d');
  // The sailing boat. Diff 1: its sail is white on the left, orange on the right.
  rect(ctx, 398, 210, 8, 130, '#5d4037');
  poly(ctx, [[406, 220], [406, 320], [486, 320]], diffs.has(1) ? '#f2811d' : '#f5ead6');
  poly(ctx, [[398, 240], [398, 320], [340, 320]], '#f5ead6');
  poly(ctx, [[350, 330], [500, 330], [480, 356], [370, 356]], '#8a5a2b');
  // Diff 6: a fish jumps out of the water on the right only.
  if (diffs.has(6)) {
    ctx.strokeStyle = '#bfe3f2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(252, 430, 22, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ellipse(ctx, 252, 406, 14, 7, '#bfe3f2');
    poly(ctx, [[262, 402], [272, 406], [262, 412]], '#bfe3f2');
  }
  // Gentle wave lines.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(330 + i * 40, 460 + i * 18);
    ctx.quadraticCurveTo(360 + i * 40, 452 + i * 18, 390 + i * 40, 460 + i * 18);
    ctx.stroke();
  }
}

export const SCENE_DRAW = {
  market: drawMarket,
  danfo: drawDanfo,
  lagoon: drawLagoon,
};
