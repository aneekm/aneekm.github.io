/**
 * Playlist configuration for the record player.
 *
 * Tracks are streamed through SoundCloud's official Widget API (hidden
 * iframe); `url` must be a public SoundCloud track page with streaming
 * enabled. Swap in other tracks freely — keep the shape.
 *
 * All URLs below were validated with scripts/verify-tracks.mjs (oembed
 * confirms the track is public). Tracks that fail to stream at runtime are
 * skipped automatically by the player.
 */
export const TRACKS = [
  {
    title: "Overnight",
    artist: "Parcels",
    url: "https://soundcloud.com/parcels-music/overnight-1",
  },
  {
    title: "Bags",
    artist: "Clairo",
    url: "https://soundcloud.com/ccottrill/bags",
  },
  {
    title: "Kerala",
    artist: "Bonobo",
    url: "https://soundcloud.com/bonobo/kerala",
  },
  {
    title: "Murder",
    artist: "Lido",
    url: "https://soundcloud.com/lidogotsongs/lido-murder",
  },
  {
    title: "glow",
    artist: "Fred again..",
    url: "https://soundcloud.com/fredagain/glow?in=fredagain/sets/ten-days-6",
  },
  {
    title: "Paper Trails",
    artist: "Joey Bada$$",
    url: "https://soundcloud.com/anewks/paper-trails-3",
  },
  {
    title: "Goose",
    artist: "Polyphia",
    url: "https://soundcloud.com/polyphia/goose",
  },
  {
    title: "Already",
    artist: "Kemba",
    url: "https://soundcloud.com/kembaland/already",
  },
];
