"use strict";
(() => {
  const cache = new Map();
  async function loadJson(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path, { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      return response.json();
    });
    cache.set(path, promise);
    try { return await promise; } catch (error) { cache.delete(path); throw error; }
  }
  function list(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
  window.MidnightData = { loadJson, list, clear: () => cache.clear() };
})();
