# A single Zustand store for shared volatile state

The handover (§8) advises against a global store "on principle". We nevertheless use a single Zustand store (`src/state/global-state.ts`, split into slices), because the needs are concrete:

- the audio session is read by the mini-player, the full player, the tablet panel and the notification;
- the favourite heart must update on every screen;
- search, the selected tag and the download state must survive the switch between the compact layout and the three-column layout, which remounts the component tree.

SQLite remains the only persistent source. The store holds in-memory state only and does not introduce a repository layer. No other global stores should be created.
