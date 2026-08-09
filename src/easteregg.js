/**
 * Easter egg: the Konami code (↑↑↓↓←→←→B A on desktop, swipe+double-tap
 * on touch) flips the record to its hidden B-side:
 *   - drops the needle on SECRET_TRACK (Lido — Murder, not in the playlist)
 *   - swaps in a session-only "midnight pressing" palette via [data-secret]
 *   - spins the disc at 45 RPM (0.5s per revolution)
 * Triggering again toggles the palette/spin back off (music keeps playing).
 *
 * Input handling is konami-js (battle-tested since 2009, keyboard + touch).
 * We override its default `code` (which would redirect) with a function.
 */

import Konami from "konami";
import { SECRET_TRACK } from "./tracks.js";
import { playSecret } from "./player.js";

let secretOn = false;

function flipSecret() {
  secretOn = !secretOn;
  document.documentElement.toggleAttribute("data-secret", secretOn);
  if (secretOn) playSecret(SECRET_TRACK);
}

export function initEasterEgg() {
  new Konami(flipSecret);
}
