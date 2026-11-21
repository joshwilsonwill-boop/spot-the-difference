// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Seven differences in every scene. */
export const DIFFS_PER_SCENE = 7;

export const POINTS_FOUND = 100;
export const POINTS_WRONG = 25;
export const BONUS_FAST = 200;
export const BONUS_SLOW = 100;
export const BONUS_FAST_SECONDS = 60;

/** The two picture panels: each 600 wide, 540 tall, with a 40 gap between them. */
export const PANEL = { width: 600, height: 540, y: 76, leftX: 20, rightX: 660 };
export const HUD = { height: 64 };
export const BOTTOM = { y: 628, height: 64 };

export const PALETTE = {
  backdrop: '#141210',
  hud: '#1d1a16',
  hudText: '#f5ead6',
  accent: '#f2b705',
  accentDark: '#c98f04',
  found: '#3ddc5f',
  wrong: '#e5534b',
  panel: '#241f1a',
  text: '#f5ead6',
  muted: '#b8a98d',
  cursor: '#ffffff',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'lagos-market-spot-the-difference.best';

/** The three scenes, in play order. */
export const SCENES = [
  { id: 'market', name: 'Market Stall', blurb: 'A busy stall in Lagos market' },
  { id: 'danfo', name: 'Danfo Bus Stop', blurb: 'Waiting for the bus at dusk' },
  { id: 'lagoon', name: 'Lagoon Sunset', blurb: 'Boats on the lagoon at sunset' },
];
