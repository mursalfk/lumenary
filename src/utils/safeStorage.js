// src/utils/safeStorage.js
// localStorage and sessionStorage can be blocked (private windows, strict settings). Every read and write goes through here.
const area = (kind) => { try { return window[kind]; } catch { return null; } };

export const safeGet = (kind, key) => {
  try { return area(kind)?.getItem(key) ?? null; } catch { return null; }
};

export const safeSet = (kind, key, value) => {
  try { area(kind)?.setItem(key, value); } catch { /* storage is blocked: the pop-up may show again, which is fine */ }
};
