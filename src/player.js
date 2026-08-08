import { TRACKS } from "./tracks.js";

const WIDGET_API_SRC = "https://w.soundcloud.com/player/api.js";
const PLAYER_BASE = "https://w.soundcloud.com/player/?url=";

const els = {
  btn: document.getElementById("player-btn"),
  drawer: document.getElementById("player-drawer"),
  rail: document.getElementById("track-rail"),
  trackTitle: document.getElementById("track-title"),
  list: document.getElementById("playlist"),
  ctlPlay: document.getElementById("ctl-play"),
  ctlPrev: document.getElementById("ctl-prev"),
  ctlNext: document.getElementById("ctl-next"),
};

const state = {
  widget: null,
  current: null,
  playing: false,
};

let adapterPromise = null;

/* ── SoundCloud widget adapter ───────────────────────────────── */

function ensureAdapter(initialUrl) {
  if (adapterPromise) return adapterPromise;
  adapterPromise = new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.className = "sc-widget-frame";
    iframe.title = "music player";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    iframe.src = PLAYER_BASE + encodeURIComponent(initialUrl);
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      reject(new Error("SoundCloud player timed out"));
    }, 20000);

    iframe.addEventListener(
      "load",
      () => {
        const script = document.createElement("script");
        script.src = WIDGET_API_SRC;
        script.onload = () => {
          try {
            const widget = window.SC.Widget(iframe);
            if (!widget) throw new Error("SC.Widget returned null");
            bindWidgetEvents(widget);
            state.widget = widget;
            clearTimeout(timeout);
            resolve(widget);
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        };
        script.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("SoundCloud widget API failed to load"));
        };
        document.head.appendChild(script);
      },
      { once: true },
    );
  }).catch((err) => {
    adapterPromise = null;
    throw err;
  });
  return adapterPromise;
}

function bindWidgetEvents(widget) {
  const Events = window.SC.Widget.Events;
  widget.bind(Events.READY, () => {
    if (state.current) widget.play();
  });
  widget.bind(Events.PLAY, () => setPlaying(true));
  widget.bind(Events.PAUSE, () => setPlaying(false));
  widget.bind(Events.FINISH, () => {
    if (state.current) playTrack(nextIndex());
  });
  widget.bind(Events.ERROR, () => {
    if (state.current) playTrack(nextIndex());
  });
}

function loadTrack(widget, track) {
  widget.load(track.url, {
    auto_play: true,
    visual: false,
  });
}

/* ── state + UI ───────────────────────────────────────────────── */

function setPlaying(playing) {
  state.playing = playing;
  els.btn.classList.toggle("playing", playing);
  els.ctlPlay.classList.toggle("paused", playing);
  els.ctlPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  els.ctlPlay.setAttribute("title", playing ? "Pause" : "Play");
}

function setCurrent(track) {
  state.current = track;
  els.trackTitle.textContent = `${track.artist} \u2014 ${track.title}`;
  els.rail.classList.add("has-track");
  els.trackTitle.setAttribute(
    "aria-label",
    `Pause or resume ${track.title} by ${track.artist}`,
  );
  const idx = TRACKS.indexOf(track);
  els.list.querySelectorAll("button").forEach((b, j) => {
    b.classList.toggle("playing", j === idx);
  });
  updateMediaSession(track);
}

function currentIndex() {
  return TRACKS.indexOf(state.current);
}

function nextIndex() {
  if (TRACKS.length < 2) return 0;
  let n;
  do {
    n = Math.floor(Math.random() * TRACKS.length);
  } while (TRACKS[n] === state.current);
  return n;
}

function updateMediaSession(track) {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: "the record player",
  });
  navigator.mediaSession.setActionHandler("play", () => state.widget?.play());
  navigator.mediaSession.setActionHandler("pause", () => state.widget?.pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => playTrack(prevIndex()));
  navigator.mediaSession.setActionHandler("nexttrack", () => playTrack(nextIndex()));
}

function prevIndex() {
  const i = currentIndex();
  if (i < 0) return Math.floor(Math.random() * TRACKS.length);
  return (i - 1 + TRACKS.length) % TRACKS.length;
}

/* ── public-ish API used by UI handlers ───────────────────────── */

function start(track) {
  if (!adapterPromise) {
    ensureAdapter(track.url)
      .then((widget) => {
        setCurrent(track);
        widget.play();
      })
      .catch((err) => {
        console.error("record player: could not start playback", err);
      });
  } else {
    setCurrent(track);
    ensureAdapter()
      .then((widget) => loadTrack(widget, track))
      .catch((err) => {
        console.error("record player: could not start playback", err);
      });
  }
}

function playTrack(i) {
  start(TRACKS[i]);
}

/** Drop the needle on a track that isn't in the playlist (the secret B-side). */
export function playSecret(track) {
  start(track);
}

function togglePlayback() {
  if (!state.current) {
    openDrawer();
    return;
  }
  state.widget?.toggle();
}

function openDrawer() {
  els.drawer.classList.add("open");
  els.btn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  els.drawer.classList.remove("open");
  els.btn.setAttribute("aria-expanded", "false");
}

function toggleDrawer() {
  if (els.drawer.classList.contains("open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

/* ── wiring ───────────────────────────────────────────────────── */

export function initPlayer() {
  TRACKS.forEach((t, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const artistSpan = document.createElement("span");
    artistSpan.className = "li-artist";
    artistSpan.textContent = t.artist;
    const titleSpan = document.createElement("span");
    titleSpan.className = "li-title";
    titleSpan.textContent = t.title;
    b.append(artistSpan, titleSpan);
    b.setAttribute("aria-label", `Play ${t.title} by ${t.artist}`);
    b.addEventListener("click", () => {
      playTrack(i);
      closeDrawer();
    });
    li.appendChild(b);
    els.list.appendChild(li);
  });

  els.btn.addEventListener("click", toggleDrawer);
  els.ctlPlay.addEventListener("click", togglePlayback);
  els.ctlPrev.addEventListener("click", () => {
    if (state.current) playTrack(prevIndex());
  });
  els.ctlNext.addEventListener("click", () => {
    if (state.current) playTrack(nextIndex());
  });
  els.trackTitle.addEventListener("click", togglePlayback);
  els.trackTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePlayback();
    }
  });

  document.addEventListener("click", (e) => {
    if (els.drawer.classList.contains("open") && !els.drawer.contains(e.target) && !els.btn.contains(e.target)) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}
