---
'@connor-adams/designsystem': minor
---

Close the media/audio gap in the `Icon` glyph registry — 19 additions.

The package ships a full `media/` component group (`MediaPlayer`,
`PlaybackControls`, `QueueList`, …) but the registry's media section held only
six glyphs (`play` `pause` `skip-forward` `skip-back` `volume` `volume-x`), so
consumers driving an audio UI hand-rolled their own inline SVGs rather than
reaching for `Icon`. Adds the transport, routing, and source glyphs that set was
missing: `stop` `fast-forward` `rewind` `play-circle` `pause-circle` `shuffle`
`repeat-1` `volume-1` `headphones` `speaker` `mic-off` `cast` `airplay` `disc`
`album` `radio` `podcast` `list-music` `audio-lines`.

Pure additions — no renames, no re-grouping, no API change; `IconName` and
`iconNames` widen automatically off `GLYPHS`. Note `repeat` is untouched: it
stays a subscriptions/recurring glyph in the categories section, and `repeat-1`
is the separate media loop-one variant. `volume-2` was deliberately not added —
the existing `volume` glyph already carries lucide's two-wave `volume-2`
geometry, so the ramp is `volume-x` → `volume-1` → `volume`.
