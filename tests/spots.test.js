import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spots } from '../src/data/spots.js';

const root = resolve(import.meta.dirname, '..');
const publicPath = (url) => resolve(root, 'public', url.replace(/^\//, ''));

test('contains nine uniquely identified spots', () => {
  assert.equal(spots.length, 9);
  assert.equal(new Set(spots.map((spot) => spot.id)).size, spots.length);
  assert.deepEqual(spots.map((spot) => spot.order), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('all declared local media exists', () => {
  for (const spot of spots) {
    assert.ok(existsSync(publicPath(spot.image)), `missing ${spot.image}`);
    assert.ok(existsSync(publicPath(spot.audio.src)), `missing ${spot.audio.src}`);
    if (spot.splat.status === 'ready') {
      assert.ok(existsSync(publicPath(spot.splat.src)), `missing ${spot.splat.src}`);
    }
  }
});

test('four splat scenes are ready and never reference ref', () => {
  const ready = spots.filter((spot) => spot.splat.status === 'ready');
  assert.equal(ready.length, 4);
  const source = readFileSync(resolve(root, 'src/data/spots.js'), 'utf8');
  assert.equal(source.includes('/ref/'), false);
  assert.ok(ready.every((spot) => spot.splat.src.startsWith('/assets/splats/')));
  assert.ok(ready.every((spot) => spot.splat.up?.length === 3 && spot.splat.camera?.position?.length === 3));
});
