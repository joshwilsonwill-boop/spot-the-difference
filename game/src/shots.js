// The screenshot scenes behind ?shot=cover|play|scene|end. Each one sets the real game
// state to a fixed mid-game moment (a scene, some differences already found, a score and
// a time), so the frame is what a real game looks like and the same shot always gives
// the same frame. No randomness is involved: the scenes are fixed pictures.
import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY } from './world.js';

export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'play') {
    world.startGame();
    world.startScene(1);
    state.found = new Set([1, 5]);
    state.score = 950;
    state.elapsed = 83;
    state.sceneElapsed = 41;
    state.cursor = { x: 660 + 420, y: 76 + 382 };
    state.cursorOn = true;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'scene') {
    world.startGame();
    world.startScene(2);
    state.found = new Set([0, 1, 3, 4, 6]);
    state.score = 1750;
    state.elapsed = 141;
    state.sceneElapsed = 52;
    state.cursor = { x: 20 + 500, y: 76 + 470 };
    state.cursorOn = true;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    world.startGame();
    state.sceneIndex = 2;
    state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    state.results = [
      { scene: 'Market Stall', found: 7, time: 47, bonus: 200 },
      { scene: 'Danfo Bus Stop', found: 7, time: 58, bonus: 200 },
      { scene: 'Lagoon Sunset', found: 7, time: 63, bonus: 100 },
    ];
    state.score = 2600;
    state.elapsed = 168;
    state.totalTime = 168;
    state.screen = SCREEN_OVER;
    return { screen: SCREEN_OVER, best: 2600 };
  }
  // The cover: scene 1 mid-game, three differences found, four still to find.
  world.startGame();
  world.startScene(0);
  state.found = new Set([0, 2, 4]);
  state.score = 300;
  state.elapsed = 47;
  state.sceneElapsed = 47;
  state.cursor = { x: 20 + 300, y: 76 + 208 };
  state.cursorOn = true;
  return { screen: SCREEN_PLAY, best: 0 };
}
