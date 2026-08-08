/**
 * Easter egg registry.
 *
 * Intended as the single extension point for a future secret: call
 * `registerSecret(keys, handler)` (or import `secretTrigger` for more control)
 * and wire the handler in main.js. Nothing ships wired right now — the
 * mechanism is here so the feature slots in without touching the player or
 * theme modules.
 */

const SEQUENCE = [
  "ArrowLeft",
  "ArrowLeft",
  "ArrowRight",
  "ArrowRight",
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
];

let listeners = [];
let idx = 0;

export function registerSecret(handler) {
  listeners.push(handler);
}

function onKeyDown(e) {
  if (e.key === SEQUENCE[idx]) {
    idx += 1;
  } else {
    idx = e.key === SEQUENCE[0] ? 1 : 0;
  }
  if (idx === SEQUENCE.length) {
    idx = 0;
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error("secret handler failed", err);
      }
    });
  }
}

export function initEasterEgg() {
  document.addEventListener("keydown", onKeyDown);
}
