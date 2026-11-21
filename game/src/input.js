// Keyboard and pointer input. Held keys move the cursor; one-shot presses (confirm, pause)
// are queued as bit flags and taken once by the loop, so a press between two frames is never
// lost and never counted twice. Pointer taps report their field coordinates.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);

export function createInput(canvas) {
  let actions = 0;
  let tap = null;
  const held = { left: false, right: false, up: false, down: false };

  function fieldPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  window.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') held.left = true;
    else if (event.code === 'ArrowRight') held.right = true;
    else if (event.code === 'ArrowUp') held.up = true;
    else if (event.code === 'ArrowDown') held.down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft') held.left = false;
    else if (event.code === 'ArrowRight') held.right = false;
    else if (event.code === 'ArrowUp') held.up = false;
    else if (event.code === 'ArrowDown') held.down = false;
  });
  // A key released while the tab is hidden never sends keyup: let go of everything on blur.
  window.addEventListener('blur', () => {
    held.left = false;
    held.right = false;
    held.up = false;
    held.down = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    tap = fieldPoint(event);
  });

  return {
    /** The held arrow keys as a direction, -1, 0 or 1 on each axis. */
    direction() {
      return {
        x: (held.right ? 1 : 0) - (held.left ? 1 : 0),
        y: (held.down ? 1 : 0) - (held.up ? 1 : 0),
      };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The last pointer tap's field coordinates, or null. */
    takeTap() {
      const taken = tap;
      tap = null;
      return taken;
    },
  };
}
