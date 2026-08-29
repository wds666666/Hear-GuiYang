import test from 'node:test';
import assert from 'node:assert/strict';
import { wgs84ToGcj02, gcj02ToWgs84 } from '../src/map/china-coordinates.js';

test('Guiyang WGS84 round-trips through GCJ-02', () => {
  const [lat, lng] = [26.578, 106.713];
  const gcj = wgs84ToGcj02(lat, lng);
  const back = gcj02ToWgs84(gcj[0], gcj[1]);
  assert.ok(Math.hypot(gcj[0] - lat, gcj[1] - lng) > 0.0003);
  assert.ok(Math.hypot(back[0] - lat, back[1] - lng) < 1e-6);
});
