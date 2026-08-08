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
// run the built app bundle (plain JS after bundling)
window.eval(await readFile(`dist/assets/${bundle}`, "utf8"));

const { document, localStorage } = window;
const results = [];
const assert = (name, cond) => results.push(`${cond ? "PASS" : "FAIL"}  ${name}`);

assert("theme guard set data-theme", /light|dark/.test(document.documentElement.getAttribute("data-theme")));
assert("theme toggle present", !!document.getElementById("theme-toggle"));
assert("player button present", !!document.getElementById("player-btn"));
assert("playlist populated with 8 tracks", document.querySelectorAll("#playlist button").length === 8);

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

const failed = results.filter((r) => r.startsWith("FAIL"));
console.log(results.join("\n"));
console.log(failed.length ? `\n${failed.length} failure(s)` : "\nall checks passed");
process.exit(failed.length ? 1 : 0);
