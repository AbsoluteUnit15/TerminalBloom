(function (root) {
  'use strict';
  function bands(data, sampleRate, fftSize, gain = 1) {
    const average = (lo, hi) => {
      const start = Math.max(1, Math.ceil(lo * fftSize / sampleRate));
      const end = Math.min(data.length, Math.ceil(hi * fftSize / sampleRate));
      let energy = 0;
      for (let i = start; i < end; i++) energy += (data[i] / 255) ** 2;
      return end > start ? Math.min(1, Math.sqrt(energy / (end - start)) * gain) : 0;
    };
    return { bass: average(30, 250), mid: average(250, 2500), treble: average(2500, 16000) };
  }
  const edges = [];
  for (let a = 0; a < 16; a++) for (let bit = 0; bit < 4; bit++) {
    const b = a ^ (1 << bit);
    if (a < b) edges.push([a, b]);
  }
  function cube(t) {
    return Array.from({length:16}, (_, i) => {
      const p = [0,1,2,3].map(bit => (i >> bit & 1) * 2 - 1);
      for (const [a,b,speed] of [[0,3,.37],[1,2,.23],[0,2,.19],[2,3,.13]]) {
        const c = Math.cos(t * speed), s = Math.sin(t * speed);
        const x = p[a]; p[a] = x*c-p[b]*s; p[b] = x*s+p[b]*c;
      }
      const w = 2.8 / (3.6-p[3]);
      const z = 3.5 / (5-p[2]*w);
      return [p[0]*w*z,p[1]*w*z];
    });
  }
  const api = {bands,cube,edges};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TerminalMath = api;
})(globalThis);
