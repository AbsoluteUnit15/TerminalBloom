const { test } = require('node:test');
const assert = require('node:assert/strict');
test('FFT bands follow frequency in Hz at different sample rates', () => {
  const { bands } = require('../core.js');
  for (const sampleRate of [44100, 48000, 96000]) {
    for (const [hz, name] of [[100, 'bass'], [1000, 'mid'], [6000, 'treble']]) {
      const data = new Uint8Array(2048);
      data[Math.round(hz * 4096 / sampleRate)] = 255;
      const result = bands(data, sampleRate, 4096);
      assert.ok(result[name] > 0, `${hz} Hz missing at ${sampleRate}`);
      for (const other of ['bass', 'mid', 'treble'].filter(x => x !== name)) assert.equal(result[other], 0);
    }
  }
});
test('silence stays zero; gain is bounded; empty bands stay finite', () => {
  const { bands } = require('../core.js');
  assert.deepEqual(bands(new Uint8Array(2048), 48000, 4096), {bass:0, mid:0, treble:0});
  assert.deepEqual(bands(new Uint8Array(2048).fill(255), 48000, 4096, 4), {bass:1, mid:1, treble:1});
  assert.deepEqual(bands(new Uint8Array(0), 48000, 4096), {bass:0, mid:0, treble:0});
});
test('hypercube has 16 finite projected vertices and 32 unique edges', () => {
  const { cube, edges } = require('../core.js');
  assert.equal(edges.length, 32);
  assert.equal(new Set(edges.map(e => e.join(':'))).size, 32);
  for (let t = 0; t < 20; t += .3) {
    const points = cube(t);
    assert.equal(points.length, 16);
    assert.ok(points.flat().every(Number.isFinite));
  }
});
