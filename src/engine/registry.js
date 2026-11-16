// src/engine/registry.js
// A lookup of every style by id, filled in by styles/index.js. A style that builds on other styles (Split Treatment)
// reads it when a picture is drawn. It is a separate file so that style files never import index.js, which only the
// browser build understands (it uses import.meta.glob), while the build scripts load style files in plain Node.
const all = new Map();
export const registerStyles = (list) => list.forEach((s) => all.set(s.id, s));
export const findStyle = (id) => all.get(id) || null;
