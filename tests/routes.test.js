import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/router.js';

test('parses supported routes', () => {
  assert.deepEqual(parseRoute('#/'), { page: 'map' });
  assert.deepEqual(parseRoute('#/spot/jiaxiu-tower'), { page: 'spot', id: 'jiaxiu-tower' });
  assert.deepEqual(parseRoute('#/spot/jiaxiu-tower/splat'), { page: 'splat', id: 'jiaxiu-tower' });
});

test('rejects unknown routes', () => {
  assert.deepEqual(parseRoute('#/unknown'), { page: 'not-found' });
  assert.deepEqual(parseRoute('#/spot/a/extra'), { page: 'not-found' });
});
