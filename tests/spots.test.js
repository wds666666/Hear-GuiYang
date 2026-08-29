import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spots, getSubSpot, hasSubMap } from '../src/data/spots.js';
import { foods, foodMarker } from '../src/data/food.js';

const root = resolve(import.meta.dirname, '..');
const publicPath = (url) => resolve(root, 'public', url.replace(/^\//, ''));
const exists = (url) => existsSync(publicPath(url));

test('contains ten uniquely identified spots', () => {
  assert.equal(spots.length, 10);
  assert.equal(new Set(spots.map((spot) => spot.id)).size, spots.length);
  assert.deepEqual(spots.map((spot) => spot.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('only the three planned spots have a sub map', () => {
  const withSubMap = spots.filter(hasSubMap).map((spot) => spot.id).sort();
  assert.deepEqual(withSubMap, ['ayunduocang', 'qianling-mountain', 'qingyun-market']);
  assert.deepEqual(spots.filter(hasSubMap).map((spot) => spot.subSpots.length), [4, 4, 7]);
});

test('sub spot ids are unique within a spot and resolvable', () => {
  for (const spot of spots.filter(hasSubMap)) {
    const ids = spot.subSpots.map((sub) => sub.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate sub id in ${spot.id}`);
    for (const id of ids) assert.ok(getSubSpot(spot, id), `cannot resolve ${spot.id}/${id}`);
  }
  assert.equal(getSubSpot(spots[0], 'nope'), undefined);
});

test('all declared local media exists', () => {
  const places = [...spots, ...spots.flatMap((spot) => spot.subSpots ?? []), foodMarker, ...foods];
  for (const place of places) {
    if (place.image) assert.ok(exists(place.image), `missing ${place.image}`);
    if (place.audio?.src) assert.ok(exists(place.audio.src), `missing ${place.audio.src}`);
    if (place.vlog?.src) {
      assert.ok(exists(place.vlog.src), `missing ${place.vlog.src}`);
      assert.ok(exists(place.vlog.poster), `missing ${place.vlog.poster}`);
    }
  }
  for (const spot of spots) {
    if (spot.splat.status === 'ready') assert.ok(exists(spot.splat.src), `missing ${spot.splat.src}`);
    if (spot.illustratedMap?.src) assert.ok(exists(spot.illustratedMap.src), `missing ${spot.illustratedMap.src}`);
  }
});

test('six splat scenes are ready and never reference ref', () => {
  const ready = spots.filter((spot) => spot.splat.status === 'ready');
  assert.equal(ready.length, 6);
  for (const file of ['src/data/spots.js', 'src/data/food.js']) {
    assert.equal(readFileSync(resolve(root, file), 'utf8').includes('/ref/'), false, `${file} references ref`);
  }
  assert.ok(ready.every((spot) => spot.splat.src.startsWith('/assets/splats/')));
  assert.ok(ready.every((spot) => spot.splat.up?.length === 3 && spot.splat.camera?.position?.length === 3));
});

// up 是从点云几何实测出来的竖直轴，猜错会让鼠标横向拖拽变成 roll、水平轴感觉被反转。
// 数值必须与 ref/splat-viewer/src/main.js 的 SCENES 一致（ref/ 不进版本库，故在此固化）。
test('splat up axes match the measured values from the reference viewer', () => {
  const expected = {
    'jiaxiu-tower': [0, 0, 1],
    'qianling-mountain': [0, 0, 1],
    'guizhou-museum': [0, 0, 1],
    'huangguoshu-waterfall': [0, -1, 0],
    ayunduocang: [-1, 0, 0],
    'qingyun-market': [0, 1, 0],
  };
  for (const [id, up] of Object.entries(expected)) {
    assert.deepEqual(spots.find((spot) => spot.id === id).splat.up, up, `wrong up axis for ${id}`);
  }
});

test('food module exposes three dishes with real clips', () => {
  assert.equal(foods.length, 3);
  assert.equal(new Set(foods.map((food) => food.id)).size, 3);
  assert.ok(foods.every((food) => food.audio.status === 'ready' && food.vlog.status === 'ready'));
});
