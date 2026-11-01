// Development helper: loads the 15 sample mp3s in public/test-audio into the Meditation and
// Affirmation playlists so filters, search, sort and pagination can be tried without the backend.
// Tracks are stored in this browser only (IndexedDB + localStorage, the same place the playlist's
// own offline upload fallback uses) and appear under the "Personal" tab. Nothing is sent to the server.
//
// Use:  open any page with ?seedTracks=1  (e.g. /app/affirmations?seedTracks=1)
//       or run seedTestTracks() / clearTestTracks() in the browser console.
// Imported from index.js in development builds only.

const DB_NAME = "MentalSwasthyaAudioPlaylistDB";
const STORE_NAME = "custom_playlist_audio";
const ENDPOINTS = ["/meditation", "/affirmation"];
const SEED_TAG = "seed";

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = reject;
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });

const idbRequest = (db, mode, fn) =>
  new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    req.onsuccess = () => resolve();
    req.onerror = reject;
  });

const storageKey = (endpoint) => `mentalswasthya_custom_tracks_${endpoint.replace(/\//g, "_")}`;

const readCustom = (endpoint) => {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey(endpoint)) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
};

const isSeeded = (t) => typeof t._id === "string" && t._id.includes(`-${SEED_TAG}-`);

export const clearTestTracks = async () => {
  const db = await openDb();
  for (const endpoint of ENDPOINTS) {
    const all = readCustom(endpoint);
    for (const t of all.filter(isSeeded)) await idbRequest(db, "readwrite", (s) => s.delete(t._id));
    localStorage.setItem(storageKey(endpoint), JSON.stringify(all.filter((t) => !isSeeded(t))));
  }
};

export const seedTestTracks = async () => {
  const base = `${process.env.PUBLIC_URL || ""}/test-audio`;
  const meta = await (await fetch(`${base}/tracks.json`)).json();
  const db = await openDb();
  await clearTestTracks();

  for (const endpoint of ENDPOINTS) {
    const name = endpoint.replace(/\//g, "");
    const added = [];
    for (let i = 0; i < meta.length; i++) {
      const m = meta[i];
      const blob = await (await fetch(`${base}/${m.file}`)).blob();
      const id = `custom-${name}-${SEED_TAG}-${i + 1}`;
      await idbRequest(db, "readwrite", (s) => s.put({ id, file: new File([blob], m.file, { type: "audio/mpeg" }) }));
      added.push({
        _id: id,
        title: m.title,
        artist: m.artist,
        category: m.category,
        language: m.category,
        duration: m.duration,
        audioUrl: id,
        isCustom: true,
      });
    }
    localStorage.setItem(storageKey(endpoint), JSON.stringify([...readCustom(endpoint), ...added]));
  }
  return `Seeded ${meta.length} tracks into ${ENDPOINTS.join(" and ")}`;
};

if (typeof window !== "undefined") {
  window.seedTestTracks = seedTestTracks;
  window.clearTestTracks = clearTestTracks;
  const params = new URLSearchParams(window.location.search);
  if (params.get("seedTracks")) {
    seedTestTracks()
      .then((msg) => {
        console.info(msg);
        params.delete("seedTracks");
        const qs = params.toString();
        window.location.replace(window.location.pathname + (qs ? `?${qs}` : ""));
      })
      .catch((err) => console.error("seedTestTracks failed:", err));
  }
}
