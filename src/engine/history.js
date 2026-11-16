// src/engine/history.js
// A ring of the last few frames of a picture or video, for the treatments that look back in time.
// Pure JS, no DOM.

// `count` frames of `size` bytes. `push` copies a frame in as the newest; `at(0)` is the newest, `at(1)` the one before.
export function makeRing(count, size) {
  const bufs = Array.from({ length: count }, () => new Uint8ClampedArray(size));
  let head = count - 1, filled = 0;
  return {
    count,
    push(data) { head = (head + 1) % count; bufs[head].set(data); if (filled < count) filled++; },
    // Frame `age` steps back; an age beyond what exists gives the oldest frame there is.
    at(age) { const a = Math.max(0, Math.min(age, filled - 1)); return bufs[(head - a + count * 2) % count]; },
    // Fill the whole ring with one frame, so there is something to look back at from the very first moment.
    fill(data) { for (const b of bufs) b.set(data); filled = count; },
    get filled() { return filled; },
  };
}

// The frame a canvas is showing now, as RGBA bytes.
export const readFrame = (canvas, W, H) => canvas.getContext('2d').getImageData(0, 0, W, H).data;

// Median of three bytes.
export const med3 = (a, b, c) => (a > b ? (b > c ? b : a > c ? c : a) : a > c ? a : b > c ? c : b);
