import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/router.js';

test('parses supported routes', () => {
  assert.deepEqual(parseRoute('#/'), { page: 'map' });
  assert.deepEqual(parseRoute('#/spot/jiaxiu-tower'), { page: 'spot', id: 'jiaxiu-tower' });
  assert.deepEqual(parseRoute('#/spot/jiaxiu-tower/splat'), { page: 'splat', id: 'jiaxiu-tower' });
  assert.deepEqual(parseRoute('#/spot/ayunduocang/map'), { page: 'submap', id: 'ayunduocang' });
  assert.deepEqual(parseRoute('#/spot/ayunduocang/sub/dining-bar'), {
    page: 'subspot', id: 'ayunduocang', subId: 'dining-bar',
  });
});

test('rejects unknown routes', () => {
  assert.deepEqual(parseRoute('#/unknown'), { page: 'not-found' });
  assert.deepEqual(parseRoute('#/spot/a/extra'), { page: 'not-found' });
  assert.deepEqual(parseRoute('#/spot/a/sub'), { page: 'not-found' });
  assert.deepEqual(parseRoute('#/spot/a/sub/b/c'), { page: 'not-found' });
  assert.deepEqual(parseRoute('#/spot/a/map/b'), { page: 'not-found' });
});
