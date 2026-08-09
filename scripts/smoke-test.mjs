import { readFile, readdir } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile("dist/index.html", "utf8");
const assets = await readdir("dist/assets");
const bundle = assets.find((f) => f.endsWith(".js"));
if (!bundle) throw new Error("no JS bundle in dist/assets");

const dom = new JSDOM(html, {
  url: "http://aneekm.com/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});

const { window } = dom;
window.matchMedia = (() => (q) => ({
  matches: false,
  addEventListener() {},
  addListener() {},
  removeListener() {},
}))();

// run the inline theme guard (classic script) the way the browser would
window.eval(html.match(/<script>([\s\S]*?)<\/script>/)[1]);

// Stub the SoundCloud widget API so the player's adapter resolves
// deterministically in jsdom (no network): fire the iframe load + api.js
// onload, and record load/play calls to verify swap-while-playing.
const loadCalls = [];
const playCalls = [];
const fakeWidget = {
  load(url, opts) { loadCalls.push({ url, opts }); },
  play() { playCalls.push("play"); },
  pause() {},
  toggle() {},
  bind() {},
};
window.SC = {
  Widget: Object.assign(() => fakeWidget, {
    Events: { READY: "ready", PLAY: "play", PAUSE: "pause", FINISH: "finish", ERROR: "error" },
  }),
};
const origIframeAdd = window.HTMLIFrameElement.prototype.addEventListener;
window.HTMLIFrameElement.prototype.addEventListener = function (type, fn, ...rest) {
  origIframeAdd.call(this, type, fn, ...rest);
  if (type === "load") setTimeout(() => fn({}), 0);
};
Object.defineProperty(window.HTMLScriptElement.prototype, "onload", {
  configurable: true,
  set(fn) { if (typeof fn === "function") setTimeout(fn, 0); },
});

// run the built app bundle (plain JS after bundling)
window.eval(await readFile(`dist/assets/${bundle}`, "utf8"));

const { document, localStorage } = window;
const results = [];
const assert = (name, cond) => results.push(`${cond ? "PASS" : "FAIL"}  ${name}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

assert("theme guard set data-theme", /light|dark/.test(document.documentElement.getAttribute("data-theme")));
assert("theme toggle present", !!document.getElementById("theme-toggle"));
assert("player button present", !!document.getElementById("player-btn"));
assert("playlist populated with 7 tracks", document.querySelectorAll("#playlist button").length === 7);

const drawer = document.getElementById("player-drawer");
const btn = document.getElementById("player-btn");
const rail = document.getElementById("track-rail");
const titleEl = document.getElementById("track-title");

btn.click();
assert("drawer opens on click", drawer.classList.contains("open"));
assert("aria-expanded true when open", btn.getAttribute("aria-expanded") === "true");

btn.click();
assert("drawer closes on second click", !drawer.classList.contains("open"));

btn.click();
btn.click();
const disc = btn.querySelector(".disc");
assert("player icon is a turntable svg with disc + arm", !!disc && !!btn.querySelector(".arm"));
disc.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
assert("clicking inner disc opens drawer and it stays open (outside-click contains fix)", drawer.classList.contains("open"));
disc.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
assert("clicking inner disc again closes drawer", !drawer.classList.contains("open"));

btn.click();
document.body.click();
assert("drawer closes on outside click", !drawer.classList.contains("open"));

titleEl.click();
assert("no track selected yet, rail hidden (no autoplay)", !rail.classList.contains("has-track"));

const themeBtn = document.getElementById("theme-toggle");
const before = document.documentElement.getAttribute("data-theme");
themeBtn.click();
const after = document.documentElement.getAttribute("data-theme");
assert("theme toggle flips attribute", before !== after);
assert("theme persists to localStorage", localStorage.getItem("theme") === after);

const playBtns = document.querySelectorAll("#playlist button");
btn.click();
playBtns[0].click();
await sleep(50);
assert("first track plays through the adapter", playCalls.length === 1);
assert("rail shows the first track", document.getElementById("track-title").textContent === "Parcels \u2014 Overnight");
playBtns[1].click();
await sleep(50);
assert("swap triggers a widget load", loadCalls.length === 1);
assert("swap load requests auto_play", loadCalls[0]?.opts?.auto_play === true);
assert(
  "swap load carries a ready callback",
  typeof loadCalls[0]?.opts?.callback === "function",
);
assert("swap does not play before the widget is ready", playCalls.length === 1);
loadCalls[0].opts.callback();
assert("swap track plays once the new widget is ready", playCalls.length === 2);
assert("rail shows the swapped track", document.getElementById("track-title").textContent === "Clairo \u2014 Bags");

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
KONAMI.forEach((keyCode) =>
  document.dispatchEvent(new window.KeyboardEvent("keydown", { keyCode })),
);
assert(
  "konami code unlocks data-secret",
  document.documentElement.hasAttribute("data-secret"),
);
KONAMI.forEach((keyCode) =>
  document.dispatchEvent(new window.KeyboardEvent("keydown", { keyCode })),
);
assert(
  "konami code again toggles data-secret off",
  !document.documentElement.hasAttribute("data-secret"),
);

const failed = results.filter((r) => r.startsWith("FAIL"));
console.log(results.join("\n"));
console.log(failed.length ? `\n${failed.length} failure(s)` : "\nall checks passed");
process.exit(failed.length ? 1 : 0);
