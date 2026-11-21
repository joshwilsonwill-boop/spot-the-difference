// The game's rules and state, with no drawing and no browser in it: which scene is up,
// which differences are found, the score, the timer, and the screens. step() advances one
// fixed step and returns what happened as bit flags, so the caller can react without the
// world knowing about screens or sound.
import {
  BONUS_FAST,
  BONUS_FAST_SECONDS,
  BONUS_SLOW,
  DIFFS_PER_SCENE,
  POINTS_FOUND,
  POINTS_WRONG,
  SCENES,
  STEP,
} from './config.js';
import { DIFFS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_CLEAR = 4;
export const EVENT_WIN = 8;

export function createWorld() {
  const state = {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    score: 0,
    elapsed: 0,
    sceneElapsed: 0,
    wrong: 0,
    cursor: { x: 320, y: 340 },
    cursorOn: false,
    mark: null,
    results: [],
    clearBonus: 0,
    totalTime: 0,
  };

  function sceneId() {
    return SCENES[state.sceneIndex].id;
  }

  function reset() {
    state.screen = SCREEN_TITLE;
    state.sceneIndex = 0;
    state.found = new Set();
    state.score = 0;
    state.elapsed = 0;
    state.sceneElapsed = 0;
    state.wrong = 0;
    state.mark = null;
    state.results = [];
    state.clearBonus = 0;
    state.totalTime = 0;
    state.cursor = { x: 320, y: 340 };
    state.cursorOn = false;
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.sceneElapsed = 0;
    state.mark = null;
    state.screen = SCREEN_PLAY;
  }

  function startGame() {
    state.score = 0;
    state.elapsed = 0;
    state.wrong = 0;
    state.results = [];
    state.totalTime = 0;
    startScene(0);
  }

  function nextScene() {
    if (state.sceneIndex + 1 < SCENES.length) startScene(state.sceneIndex + 1);
    else {
      state.totalTime = state.elapsed;
      state.screen = SCREEN_OVER;
    }
  }

  /** Distance from a point to a difference, in panel-local coordinates. */
  function hitDiff(panelX, panelY) {
    const list = DIFFS[sceneId()];
    for (let i = 0; i < list.length; i += 1) {
      if (state.found.has(i)) continue;
      const d = list[i];
      const dx = panelX - d.x;
      const dy = panelY - d.y;
      if (dx * dx + dy * dy <= (d.r + 14) * (d.r + 14)) return i;
    }
    return -1;
  }

  /**
   * A click or tap at field coordinates (fx, fy). Returns event flags. Clicking inside
   * either picture checks the matching difference; clicking elsewhere does nothing.
   */
  function markAt(fx, fy, panel) {
    if (state.screen !== SCREEN_PLAY) return 0;
    const panelX = fx - panel.x;
    const panelY = fy - panel.y;
    if (panelX < 0 || panelX > panel.width || panelY < 0 || panelY > panel.height) return 0;
    const hit = hitDiff(panelX, panelY);
    if (hit >= 0) {
      state.found.add(hit);
      state.score += POINTS_FOUND;
      state.mark = { x: fx, y: fy, ok: true, t: 0 };
      if (state.found.size >= DIFFS_PER_SCENE) {
        state.clearBonus = state.sceneElapsed <= BONUS_FAST_SECONDS ? BONUS_FAST : BONUS_SLOW;
        state.score += state.clearBonus;
        state.results.push({
          scene: SCENES[state.sceneIndex].name,
          found: state.found.size,
          time: state.sceneElapsed,
          bonus: state.clearBonus,
        });
        state.screen = SCREEN_CLEAR;
        return EVENT_FOUND | EVENT_CLEAR;
      }
      return EVENT_FOUND;
    }
    state.score = Math.max(0, state.score - POINTS_WRONG);
    state.wrong += 1;
    state.mark = { x: fx, y: fy, ok: false, t: 0 };
    return EVENT_WRONG;
  }

  /** One fixed step: the timer runs while playing, and the mark flash fades. */
  function step() {
    if (state.screen === SCREEN_PLAY) {
      state.elapsed += STEP;
      state.sceneElapsed += STEP;
    }
    if (state.mark !== null) {
      state.mark.t += STEP;
      if (state.mark.t > 0.6) state.mark = null;
    }
    return 0;
  }

  reset();
  return { state, reset, startGame, startScene, nextScene, markAt, step, sceneId };
}
