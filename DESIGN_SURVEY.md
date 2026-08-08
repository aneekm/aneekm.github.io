# Design Survey: Personal "Landing Page" Websites

Scope note: this survey is deliberately restricted to the **landing-page category** of
personal sites — the single-purpose, often single-screen pages whose job is to answer
"who are you, what do you do, and where do I find you?" in a few seconds. Blogs, project
portfolios, and long-form content hubs are excluded on purpose. The goal is to inform
**v3 of aneekm.com**, which has historically been a v2 landing page (name + one-liner +
links) and a v1 one-pager (headshot, bio, sidebar links) — so the content depth should
stay in that zone while the design gets a serious upgrade.

---

## 1. What makes a great personal landing page

Recurring principles across the strongest examples:

### 1.1 One screen, one message
Above the fold, a visitor should be able to answer three questions in ~5 seconds:
*Who are you? What do you do? Why should I care?* Everything else is secondary. The best
pages are ruthless about not competing with that core message.

### 1.2 Content minimalism
The canonical inventory is tiny:
- **Wordmark / name** — often the largest element on the page.
- **Tagline or status line** — one sentence ("Currently working on Robotics at Standard
  Bots"). A *currently* line is a modern staple; it implies a live, human presence.
- **Link set** — resume, email, GitHub, LinkedIn, etc. Either icon row or a short text list.
- **Short bio (optional)** — 1–3 sentences for context; keep it tight.
- **Metadata** — location / time zone, availability, "open to work" signal.

Anything longer belongs on a subpage or a different site category.

### 1.3 Typography does the heavy lifting
Because the content is thin, **type carries the design**. Strong examples use a small
number of well-chosen typefaces (frequently a distinctive display face + a clean body
face, or a single variable family), a confident scale hierarchy, and generous tracking
on large sizes. Hierarchy is established by size and weight before color.

### 1.4 Personality & voice
The strongest landing pages feel like the person, not a template. Voice matters:
first-person copy, a witty tagline, an easter egg, a distinctive color, a photo, or a
custom illustration. "Don't sanitize all personality out of your site."

### 1.5 A disciplined palette
Minimalism doesn't mean colorless — it means **few** colors used with intent. The
standard pattern is 1–3 accent hues against a neutral base (white / off-white / dark
charcoal). The accent should be used sparingly: the CTA, a link hover, a selection color,
a background glow.

### 1.6 Mobile-first
Over 60% of traffic is mobile, and personal landing pages are almost always opened from
a link in a bio or a signature. If it doesn't look great on a phone, it fails. In
practice: one column, large type, tap targets ≥ 44px, and no hover-dependent content.

### 1.7 Speed & performance
A landing page should load in well under a second. No heavy framework, no giant hero
videos, no gallery of images, minimal JS. Hand-rolled HTML/CSS often wins here — which
matches this repo's zero-tooling tradition.

### 1.8 Accessibility & reduced motion
Contrast, keyboard focus states, `:focus-visible`, semantic HTML, and honoring
`prefers-reduced-motion`. Decorations must never gate access to content.

### 1.9 Progressive enhancement of interactions
Interactions are the *reward layer*, not the content. The page must work (and look
great) with JS off; animations then enhance the experience for those who can take them.

---

## 2. Interesting interactions (the catalogue)

The most effective interactions on landing pages, roughly ordered from cheap to ambitious:

| Interaction | What it looks like | Cost |
|---|---|---|
| Typewriter / reveal-on-load headline | Name or tagline types itself or letters reveal in sequence | Low (CSS + tiny JS) |
| Hover microinteractions | Icon wiggle, link underline sweep, color fill, tooltips | Low (CSS only) |
| Custom cursor / cursor-follow element | A dot, halo, or object tracks the cursor | Low–Med (JS) |
| Magnetic buttons | Link/button eases toward the cursor within a radius | Low–Med (JS) |
| Scroll-driven reveals | Sections fade/slide in as you scroll (IntersectionObserver) | Low–Med (JS) |
| Marquee / ticker | A repeating line of text (skills, interests, links) scrolls horizontally | Low (CSS) |
| Ambient background | Gradient, grain, noise, subtle particles, or canvas field behind content | Med (canvas) |
| Dark / light toggle | Theme switch (often honoring system preference) | Low–Med |
| Console message / easter egg | A playful note in devtools, a Konami-code trigger, a hidden page | Low |
| Gamified / 3D world | The whole page is a navigable scene (Bruno Simon's jeep) | Very high — usually overkill |

**Guiding rule:** pick 1–2 interactions max for a landing page, and make them reinforce
the persona. An engineer's site benefits from a terminal/technical motif; a designer's
site from typographic motion; a gamer's site from a playful easter egg. A page with 6
competing animations feels like a template, not a person.

---

## 3. Content types seen on the best landing pages

- **Name wordmark** (almost always huge)
- **One-line status** — "Currently…", "Building…", "Open to…"
- **Link set** — resume/PDF, email, GitHub, LinkedIn, X, Instagram, Devpost, etc.
- **Short bio** — 1–3 sentences (where, what, the interesting bit)
- **Location / time zone / availability signal**
- **Photo or illustration** (optional; when present, it's usually the *only* image)
- **Easter eggs** — console messages, keyboard shortcuts, hidden links, a "hint" to poke around

---

## 4. Concrete examples to study

Verified examples spanning the landing-page spectrum, each with one "steal" (not a copy —
a principle to adapt).

### 4.1 Bruno Simon — bruno-simon.com
An Awwwards Site-of-the-Day / CSSDA Website-of-the-Month. The landing page *is* a
navigable 3D WebGL world (Three.js): you drive a low-poly jeep to reach projects, skills,
and contacts.
- **Steal:** *Show, don't tell.* Instead of listing "proficient in Three.js," the site
  *is* Three.js. The medium proves the message. — Note: full 3D is overkill for v3; the
  principle (let the craft show) is not.

### 4.2 Kantwon — kantwon.com
A Georgia Tech robotics/CS student and instructor. Playful, modular, honest: floating
cutout portrait, bright blocks (orange/teal/magenta), informal first-person About, and
even unfinished sections proudly labeled "Coming Soon."
- **Steal:** *Persona-led color + energy.* Robotics and CS do not have to look like a
  dark terminal; a warm, confident, slightly silly tone makes an engineer memorable.
  Great reference for a robotics/CS student persona — very close to Aneek's profile.

### 4.3 Tobias van Schneider — tobi.sh
Dark, minimal, statement-driven landing page. A single strong headline, very little else,
a bold accent, meticulous spacing.
- **Steal:** *Confidence through restraint.* One idea per screen, executed flawlessly.
  Dark-mode-first is a strong, developer-friendly baseline.

### 4.4 Salva Lopez — salvalopez.com/personal/
Large, expressive typography on a personal page; type sizes and weights are pushed
aggressively while the layout stays simple.
- **Steal:** *Make type the hero.* If you refuse to add images, make the typeface do
  all the emotional work.

### 4.5 Lu Yu — luyu.co
Interaction designer; the site is a masterclass in tasteful microinteractions,
transition quality, and typography — the kind of polish you feel without being able to
name it.
- **Steal:** *Micro-motion quality over quantity.* Every hover and transition is
  deliberate and consistent; nothing bounces randomly.

### 4.6 Marina Rachello / George Wood / Michael Pumo / Belen Jones (One Page Love personal genre)
Recent single-page personal sites: minimal structure, generous whitespace, one accent
color, clean type, icon or text links. Representative of the current "refined minimal
personal page" baseline.
- **Steal:** *The baseline.* This is the bar for tasteful, contemporary minimalism — and
  the default fallback if v3 should read as "professional + clean."

### 4.7 Aarron Walter — aarronwalter.com
"Hi. I'm Aarron Walter. I love leading creative teams…" — a first-person hero with
resume/social/email links right there.
- **Steal:** *Lead with the human sentence.* A warm, direct greeting outperforms a
  "Software Engineer | Robotics" label strip.

### 4.8 Linear / Stripe / Notion (design references, not landing pages)
Not personal sites, but the reference points for *minimal + micro-motion*: Linear's
dark-mode-first developer aesthetic and state transitions; Stripe's gradient glow and
subtle cursor-reactive motion; Notion's whitespace and block hierarchy.
- **Steal:** *The dark-mode developer aesthetic and the glowing-accent-on-charcoal
  treatment* are the modern signature of a technically-minded personal brand.

---

## 5. Trend notes (2025–26)

From landing-page trend roundups (involve.me, Outbrain, LandingPicks, Shopify):
- **Minimalist & distraction-free layouts** — fewer elements, more whitespace, one CTA.
- **Bold typography & short copy** — headlines and microcopy do the selling.
- **Micro-animations & scroll effects** — small, purposeful motion; not page-wide drama.
- **Personality & authenticity** — human voice, honest details, anti-corporate.
- **Dark mode as default** for developer/technical audiences.
- **Accessibility & performance as features**, not afterthoughts (AI-era speed
  expectations make this a real differentiator).

---

## 6. Where to browse more

- **Awwwards** (awwwards.com) — award-winning, jury-scored sites; filterable by tech.
- **Godly** (godly.website) — bold, expressive, brand-led design.
- **One Page Love** (onepagelove.com) — 400+ curated *personal* single-pagers; filterable
  by style (minimal, dark, typographic…).
- **Lapa Ninja** (lapa.ninja) — 3000+ landing pages; category + style filters.
- **SiteInspire** (siteinspire.com) — clean, typography-driven, restrained.
- **Land-book** (land-book.com) — tech/startup landing pages, filter by color.
- **Httpster** (httpster.net) — editorial, content-first aesthetics.
- **Dark Mode Design** (darkmodedesign.com) — dark-first gallery.

---

## 7. Steal list for v3 (aneekm.com)

Synthesized specifically for Aneek's persona — robotics/software engineer (CMU ECE,
Standard Bots, Amazon Robotics past), musician, gamer, hackathon-er — while holding
content depth at v1/v2 levels:

1. **Lead with the human sentence** (Aarron Walter): e.g. *"Hi, I'm Aneek."* — keep it
   first-person and warm, not a label strip.
2. **Keep the "currently" status line** (v2 already does this): *"Working on robotics at
   Standard Bots."* It anchors the page in the present.
3. **Let one accent color carry the brand.** v2's maroon (`#88001a`) is a distinctive,
   personal choice (and matches v1's palette). Keep an accent — either that maroon or a
   fresh one — used sparingly: selection, links, a glow, a button.
4. **Type as the hero** (Salva Lopez, One Page Love minimal set): a confident display
   face for the name, clean sans (or monospace detail) for body, strong size hierarchy.
5. **Pick ONE signature interaction** and do it well:
   - Terminal vibe → typewriter hero + blinking caret + hover-fill links (matches a
     software/firmware engineer).
   - Playful → canvas cursor-follow or a small easter egg (Konami code → confetti,
     console message, hidden "robot" toggle) (matches gamer/hackathon side).
   - Elegant → subtle scroll reveal + icon wiggle on hover only.
6. **Short bio, 1–3 sentences** (v1 had 4 dense paragraphs; v3 should be *much* tighter,
   pointing at resume/GitHub for depth).
7. **Keep the link set complete**: resume (PDF), GitHub, Devpost, email, LinkedIn,
   Instagram — v1/v2 both ship these; don't drop any.
8. **Dark mode default or light-with-dark-toggle**: developer audiences expect it; if
   going light, keep the option.
9. **Performance & no framework** — this repo is hand-rolled HTML/CSS; v3 should stay
   dependency-free (or nearly) so it loads instantly.
10. **Keep the good plumbing**: GA tag, SEO meta, favicons, CNAME, `theme-color`.

---

## 8. Accessibility & performance checklist for v3

- [ ] HTML semantics (`<main>`, `<nav>`, `<h1>` once), skip-link optional
- [ ] `prefers-reduced-motion` honored (disable typewriter/canvas/animations)
- [ ] `:focus-visible` styles on all interactive elements
- [ ] Color contrast ≥ 4.5:1 for body text; don't rely on color alone
- [ ] No content gated behind JS or hover
- [ ] Minified/self-contained CSS; zero or near-zero JS
- [ ] Correct `<title>`, meta description, canonical, Open Graph
- [ ] Tap targets ≥ 44px on mobile; responsive test at 360/390/768/1280px
