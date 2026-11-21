// Sound, synthesized with WebAudio: short oscillator beeps, no audio files and no network.
// The audio context is created on the first user gesture, so browsers that block autoplay
// stay quiet until the player actually plays.

let context = null;

function ensure() {
  if (context !== null) return context;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  } catch {
    context = null;
  }
  return context;
}

function beep(freq, start, length, type, gain) {
  const ctx = ensure();
  if (ctx === null) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime + start);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + length);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + length + 0.02);
  } catch {
    // Sound is garnish: a failure here never stops the game.
  }
}

/** Wake the audio stack up after a gesture, so the next beep is not late. */
export function unlockSound() {
  ensure();
}

/** Two rising notes: a difference found. */
export function soundFound() {
  beep(660, 0, 0.12, 'sine', 0.2);
  beep(880, 0.1, 0.18, 'sine', 0.2);
}

/** A low buzz: a wrong click. */
export function soundWrong() {
  beep(140, 0, 0.22, 'sawtooth', 0.12);
}

/** A short arpeggio: a scene cleared. */
export function soundClear() {
  beep(523, 0, 0.14, 'triangle', 0.2);
  beep(659, 0.12, 0.14, 'triangle', 0.2);
  beep(784, 0.24, 0.22, 'triangle', 0.2);
}

/** A little fanfare: all three scenes done. */
export function soundWin() {
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i += 1) beep(notes[i], i * 0.14, 0.22, 'triangle', 0.2);
}
