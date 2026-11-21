// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between five screens: title, play, paused, scene clear and victory.
//
// ?shot=cover|play|scene|end stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot. The shot path paints synchronously,
// so no animation frame is needed before the capture.
import { BEST_KEY, FIELD, PANEL, STEP } from './config.js';
import { createWorld, EVENT_CLEAR, EVENT_FOUND, EVENT_WRONG, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer } from './render.js';
import { soundClear, soundFound, soundWin, soundWrong, unlockSound } from './sound.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;
/** How fast the keyboard cursor moves, in field pixels per second. */
const CURSOR_SPEED = 420;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  renderer.draw(world.state, scene.screen, scene.best);
  renderer.draw(world.state, scene.screen, scene.best);
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.startGame();
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences in each scene.');
  }

  function finishGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    soundWin();
    announce(`You found them all. Score ${world.state.score}. Best ${best}.`);
  }

  function confirm() {
    unlockSound();
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
    else if (screen === SCREEN_CLEAR) {
      if (world.state.sceneIndex + 1 < 3) {
        world.nextScene();
        screen = SCREEN_PLAY;
        announce('Next scene. Find 7 differences.');
      } else finishGame();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM) confirm();
    else if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
  }

  function handleTap() {
    const tap = input.takeTap();
    if (tap === null) return;
    unlockSound();
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_CLEAR) {
      confirm();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    world.state.cursor = { x: tap.x, y: tap.y };
    world.state.cursorOn = true;
    const events = world.markAt(tap.x, tap.y, PANEL.leftX <= tap.x && tap.x < PANEL.leftX + PANEL.width
      ? { x: PANEL.leftX, y: PANEL.y, width: PANEL.width, height: PANEL.height }
      : { x: PANEL.rightX, y: PANEL.y, width: PANEL.width, height: PANEL.height });
    if (events & EVENT_FOUND) soundFound();
    if (events & EVENT_WRONG) soundWrong();
    if (events & EVENT_CLEAR) {
      screen = SCREEN_CLEAR;
      soundClear();
      announce('Scene complete.');
    }
  }

  function moveCursor(dt) {
    const direction = input.direction();
    if (direction.x === 0 && direction.y === 0) return;
    const state = world.state;
    state.cursorOn = true;
    state.cursor.x = Math.min(FIELD.width - 8, Math.max(8, state.cursor.x + direction.x * CURSOR_SPEED * dt));
    state.cursor.y = Math.min(FIELD.height - 8, Math.max(8, state.cursor.y + direction.y * CURSOR_SPEED * dt));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleTap();
    if (screen === SCREEN_PLAY) moveCursor(dt);
    if (screen === SCREEN_PLAY || screen === SCREEN_TITLE) {
      accumulator += dt;
      while (accumulator >= STEP && (screen === SCREEN_PLAY || screen === SCREEN_TITLE)) {
        world.step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    // The keyboard cursor marks with Enter or Space: Enter is a confirm on menus, a mark
    // on the play screen. The loop reads it here because the input module only queues it.
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  // Enter or Space while playing marks the difference under the cursor.
  window.addEventListener('keydown', (event) => {
    if ((event.code === 'Enter' || event.code === 'Space') && screen === SCREEN_PLAY && !event.repeat) {
      const state = world.state;
      state.cursorOn = true;
      const panel = state.cursor.x < PANEL.leftX + PANEL.width
        ? { x: PANEL.leftX, y: PANEL.y, width: PANEL.width, height: PANEL.height }
        : { x: PANEL.rightX, y: PANEL.y, width: PANEL.width, height: PANEL.height };
      const events = world.markAt(state.cursor.x, state.cursor.y, panel);
      if (events & EVENT_FOUND) soundFound();
      if (events & EVENT_WRONG) soundWrong();
      if (events & EVENT_CLEAR) {
        screen = SCREEN_CLEAR;
        soundClear();
        announce('Scene complete.');
      }
    }
  });

  announce('Lagos Market: Spot the Difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
