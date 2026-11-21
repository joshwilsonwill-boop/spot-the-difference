// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The two pictures are drawn side by side from the same scene code: the left
// picture is the plain scene, the right picture has all seven differences applied. Found
// differences get a green ring on both pictures; the HUD counts how many remain.
import { BOTTOM, FIELD, FONT, HUD, PALETTE, PANEL, SCENES } from './config.js';
import { DIFFS, SCENE_DRAW } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

/** The panel's width; its height grows with its lines: room for the title, the lines and the prompt. */
const OVERLAY = { width: 640, top: 150, line: 34, bottom: 76 };

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'middle';
    context.fillText(value, x, y);
  }

  function drawPicture(sceneId, panelX, diffs) {
    context.save();
    context.beginPath();
    context.rect(panelX, PANEL.y, PANEL.width, PANEL.height);
    context.clip();
    context.translate(panelX, PANEL.y);
    SCENE_DRAW[sceneId](context, diffs);
    context.restore();
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 3;
    context.strokeRect(panelX, PANEL.y, PANEL.width, PANEL.height);
  }

  function drawRing(x, y, r, color) {
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x - r * 0.45, y);
    context.lineTo(x - r * 0.1, y + r * 0.35);
    context.lineTo(x + r * 0.5, y - r * 0.35);
    context.stroke();
  }

  function drawMarkers(state) {
    const list = DIFFS[SCENES[state.sceneIndex].id];
    for (const index of state.found) {
      const d = list[index];
      drawRing(PANEL.leftX + d.x, PANEL.y + d.y, d.r, PALETTE.found);
      drawRing(PANEL.rightX + d.x, PANEL.y + d.y, d.r, PALETTE.found);
    }
  }

  function drawMarkFlash(state) {
    const mark = state.mark;
    if (mark === null) return;
    const alpha = Math.max(0, 1 - mark.t / 0.6);
    context.save();
    context.globalAlpha = alpha;
    if (mark.ok) {
      context.strokeStyle = PALETTE.found;
      context.lineWidth = 6;
      context.beginPath();
      context.arc(mark.x, mark.y, 30, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.strokeStyle = PALETTE.wrong;
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(mark.x - 18, mark.y - 18);
      context.lineTo(mark.x + 18, mark.y + 18);
      context.moveTo(mark.x + 18, mark.y - 18);
      context.lineTo(mark.x - 18, mark.y + 18);
      context.stroke();
    }
    context.restore();
  }

  function drawCursor(state) {
    if (!state.cursorOn) return;
    const c = state.cursor;
    context.strokeStyle = PALETTE.cursor;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(c.x, c.y, 16, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(c.x - 24, c.y);
    context.lineTo(c.x - 8, c.y);
    context.moveTo(c.x + 8, c.y);
    context.lineTo(c.x + 24, c.y);
    context.moveTo(c.x, c.y - 24);
    context.lineTo(c.x, c.y - 8);
    context.moveTo(c.x, c.y + 8);
    context.lineTo(c.x, c.y + 24);
    context.stroke();
  }

  function drawHud(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 0, FIELD.width, HUD.height);
    text('Lagos Market: Spot the Difference', 20, 32, 26, PALETTE.hudText, 'left');
    const scene = SCENES[state.sceneIndex];
    text(`${scene.name}  -  Scene ${state.sceneIndex + 1} of 3`, 640, 20, 18, PALETTE.muted, 'center');
    text(`Found ${state.found.size} of 7`, 640, 46, 24, PALETTE.accent, 'center');
    text(`Score ${state.score}`, 1010, 32, 24, PALETTE.hudText, 'left');
    text(formatTime(state.elapsed), 1240, 32, 24, PALETTE.hudText, 'right');
  }

  function drawBottom(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, BOTTOM.y, FIELD.width, BOTTOM.height);
    if (state.screen === SCREEN_PLAY) {
      text('Click a difference in either picture. Arrow keys move the cursor, Enter marks it. P pauses.', 640, BOTTOM.y + 32, 20, PALETTE.muted, 'center');
    } else {
      text('Find all 7 differences in each of the 3 scenes. A wrong click costs 25 points.', 640, BOTTOM.y + 32, 20, PALETTE.muted, 'center');
    }
  }

  function drawOverlay(title, lines, prompt) {
    context.fillStyle = 'rgba(10, 8, 6, 0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const height = OVERLAY.top + lines.length * OVERLAY.line + OVERLAY.bottom;
    const x = (FIELD.width - OVERLAY.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, OVERLAY.width, height);
    context.strokeStyle = PALETTE.accent;
    context.lineWidth = 3;
    context.strokeRect(x, y, OVERLAY.width, height);
    text(title, FIELD.width / 2, y + 72, 44, PALETTE.text, 'center');
    for (let index = 0; index < lines.length; index += 1) {
      text(lines[index], FIELD.width / 2, y + OVERLAY.top + index * OVERLAY.line, 21, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 38, 23, PALETTE.accent, 'center');
  }

  /** Paint one frame: the two pictures, the HUD, the markers and the screen's overlay. */
  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    const sceneId = SCENES[state.sceneIndex].id;
    const none = new Set();
    const all = new Set([0, 1, 2, 3, 4, 5, 6]);
    drawPicture(sceneId, PANEL.leftX, none);
    drawPicture(sceneId, PANEL.rightX, all);
    text('A', PANEL.leftX + 16, PANEL.y + 22, 22, PALETTE.hudText, 'left');
    text('B', PANEL.rightX + 16, PANEL.y + 22, 22, PALETTE.hudText, 'left');
    drawHud(state);
    drawBottom(state);
    drawMarkers(state);
    drawMarkFlash(state);
    drawCursor(state);

    if (screen === SCREEN_TITLE) {
      drawOverlay('Lagos Market', [
        'Spot the Difference',
        'Two pictures, side by side. Seven differences hide between them.',
        'Three scenes: a market stall, a danfo bus stop, a lagoon sunset.',
        `Best score ${best}`,
      ], 'Press Space or click to start');
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay('Paused', ['The timer is stopped.'], 'Press P to carry on');
    } else if (screen === SCREEN_CLEAR) {
      const last = state.results[state.results.length - 1];
      drawOverlay('Scene complete!', [
        `${last.scene}: all 7 differences found.`,
        `Time bonus +${last.bonus} points.`,
        `Score ${state.score}`,
      ], state.sceneIndex + 1 < SCENES.length ? 'Press Space for the next scene' : 'Press Space for your result');
    } else if (screen === SCREEN_OVER) {
      const lines = state.results.map(
        (r) => `${r.scene}: ${r.found} of 7 found in ${formatTime(r.time)}  (+${r.bonus} bonus)`,
      );
      lines.push(`Total time ${formatTime(state.totalTime)}   Best ${best}`);
      drawOverlay('You found them all!', lines, `Score ${state.score}   Press Space or click to play again`);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
