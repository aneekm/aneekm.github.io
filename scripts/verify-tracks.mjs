/**
 * Finds real SoundCloud track URLs and verifies they are public.
 *
 * - `search <query>` mode: prints the top official-looking track URLs
 *   for a query (e.g. `node scripts/verify-tracks.mjs search "ben howard oats in the water"`).
 * - `check <url>` mode: validates via SoundCloud's public oembed endpoint
 *   (authoritative for "track exists and is public").
 *
 * Streamability itself is enforced at runtime by the player's ERROR -> skip
 * fallback (SoundCloud hides stream payloads behind bot protection, so they
 * cannot be probed reliably from here).
 */

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36";

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return { status: res.status, text: await res.text() };
}

export async function search(query) {
  const { status, text } = await get(`https://soundcloud.com/search?q=${encodeURIComponent(query)}`);
  if (status !== 200) return { error: `search HTTP ${status}` };
  const links = [...new Set(text.match(/href="(\/[^"/]+\/[^"/]+)"/g)?.map((m) => m.slice(6, -1)) ?? [])];
  return links
    .filter((l) => !l.startsWith("/search"))
    .map((l) => `https://soundcloud.com${l}`);
}

export async function check(url) {
  const { status, text } = await get(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
  if (status !== 200) return { ok: false, url };
  const data = JSON.parse(text);
  return { ok: true, title: data.title, artist: data.author_name, url };
}

if (process.argv[1]?.endsWith("verify-tracks.mjs")) {
  const [mode, arg] = process.argv.slice(2);
  if (mode === "search" && arg) {
    const links = await search(arg);
    console.log(links.slice(0, 8).join("\n"));
  } else if (mode === "check" && arg) {
    console.log(await check(arg));
  } else {
    console.log("usage: node scripts/verify-tracks.mjs search <query> | check <track-url>");
  }
}
