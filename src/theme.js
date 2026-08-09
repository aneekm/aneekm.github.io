const root = document.documentElement;
const btn = document.getElementById("theme-toggle");
const metas = document.querySelectorAll('meta[name="theme-color"]');

const LIGHT = "#f4efe5";
const DARK = "#16120d";

function apply(theme) {
  root.setAttribute("data-theme", theme);
  btn.setAttribute("aria-pressed", theme === "dark");
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  metas.forEach((m) => m.setAttribute("content", theme === "dark" ? DARK : LIGHT));
}

function current() {
  return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function initTheme() {
  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* storage unavailable — theme still applies for the session */
    }
    apply(next);
  });

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const change = () => {
    if (storedTheme() === null) apply(mq.matches ? "dark" : "light");
  };
  if (mq.addEventListener) {
    mq.addEventListener("change", change);
  } else if (mq.addListener) {
    mq.addListener(change);
  }

  apply(storedTheme() ?? (mq.matches ? "dark" : "light"));
}

function storedTheme() {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : null;
  } catch (e) {
    return null;
  }
}
