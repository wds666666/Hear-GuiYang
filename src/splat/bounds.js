import * as THREE from 'three';

const MAX_SAMPLES = 60000;
const RADIUS_PERCENTILE = 0.96;
// Standoff from splat surfaces, as a fraction of scene radius.
const KEEP_OUT = 0.18;
const HIT_MIN = 2;
const MAX_OUT = 3.2;

/**
 * Estimate the center, radius, AABB, and inlier samples of the splat cloud.
 * @returns {{count: number, center: THREE.Vector3, radius: number, min: THREE.Vector3, max: THREE.Vector3, samples: Float32Array}}
 */
export function measureScene(viewer) {
  const mesh = viewer.splatMesh;
  const count = mesh.getSplatCount();

  const fallback = {
    count,
    center: new THREE.Vector3(0, 0, 0),
    radius: 2,
    min: new THREE.Vector3(-2, -2, -2),
    max: new THREE.Vector3(2, 2, 2),
    samples: new Float32Array(0),
  };

  if (!count) return fallback;

  const stride = Math.max(1, Math.floor(count / MAX_SAMPLES));
  const point = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  const samples = [];

  for (let i = 0; i < count; i += stride) {
    mesh.getSplatCenter(i, point, true);
    if (!Number.isFinite(point.x + point.y + point.z)) continue;
    samples.push(point.x, point.y, point.z);
    centroid.add(point);
  }

  const n = samples.length / 3;
  if (n === 0) return fallback;

  centroid.divideScalar(n);

  const distances = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const dx = samples[i * 3] - centroid.x;
    const dy = samples[i * 3 + 1] - centroid.y;
    const dz = samples[i * 3 + 2] - centroid.z;
    distances[i] = Math.hypot(dx, dy, dz);
  }
  distances.sort();

  const idx = Math.min(n - 1, Math.floor(n * RADIUS_PERCENTILE));
  const radius = Math.max(distances[idx], 1e-3);

  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const inliers = [];
  for (let i = 0; i < n; i++) {
    const x = samples[i * 3];
    const y = samples[i * 3 + 1];
    const z = samples[i * 3 + 2];
    if (Math.hypot(x - centroid.x, y - centroid.y, z - centroid.z) > radius) continue;
    inliers.push(x, y, z);
    if (x < min.x) min.x = x;
    if (y < min.y) min.y = y;
    if (z < min.z) min.z = z;
    if (x > max.x) max.x = x;
    if (y > max.y) max.y = y;
    if (z > max.z) max.z = z;
  }

  return {
    count,
    center: centroid,
    radius,
    min,
    max,
    samples: new Float32Array(inliers),
  };
}

function hashKey(ix, iy, iz) {
  return ix + ',' + iy + ',' + iz;
}

function cellIndex(v, origin, cell) {
  return Math.floor((v - origin) / cell);
}

/**
 * Spatial hash of splat centers. Camera stays `keepOut` away from dense surfaces
 * and inside a padded AABB, so collision kicks in well before clipping through.
 */
export function buildWalkGrid(info) {
  const keepOut = Math.max(info.radius * KEEP_OUT, 1.6);
  const cell = keepOut;
  const pts = info.samples;
  const hash = new Map();
  let ox = info.min.x;
  let oy = info.min.y;
  let oz = info.min.z;
  for (let i = 0; i < pts.length; i += 3) {
    const ix = cellIndex(pts[i], ox, cell);
    const iy = cellIndex(pts[i + 1], oy, cell);
    const iz = cellIndex(pts[i + 2], oz, cell);
    const key = hashKey(ix, iy, iz);
    let bucket = hash.get(key);
    if (!bucket) {
      bucket = [];
      hash.set(key, bucket);
    }
    bucket.push(i);
  }
  const pad = keepOut * 0.35;
  return {
    pts,
    hash,
    keepOut,
    cell,
    ox,
    oy,
    oz,
    min: new THREE.Vector3(info.min.x + pad, info.min.y + pad, info.min.z + pad),
    max: new THREE.Vector3(info.max.x - pad, info.max.y - pad, info.max.z - pad),
  };
}

function hitsAt(col, x, y, z, radius, out) {
  out.length = 0;
  const r2 = radius * radius;
  const ix0 = cellIndex(x - radius, col.ox, col.cell);
  const ix1 = cellIndex(x + radius, col.ox, col.cell);
  const iy0 = cellIndex(y - radius, col.oy, col.cell);
  const iy1 = cellIndex(y + radius, col.oy, col.cell);
  const iz0 = cellIndex(z - radius, col.oz, col.cell);
  const iz1 = cellIndex(z + radius, col.oz, col.cell);
  const pts = col.pts;
  for (let ix = ix0; ix <= ix1; ix++) {
    for (let iy = iy0; iy <= iy1; iy++) {
      for (let iz = iz0; iz <= iz1; iz++) {
        const bucket = col.hash.get(hashKey(ix, iy, iz));
        if (!bucket) continue;
        for (let b = 0; b < bucket.length; b++) {
          const i = bucket[b];
          const hx = pts[i] - x;
          const hy = pts[i + 1] - y;
          const hz = pts[i + 2] - z;
          const d2 = hx * hx + hy * hy + hz * hz;
          if (d2 < r2) out.push(i, d2);
        }
      }
    }
  }
  return out;
}

const _hits = [];

function blocked(col, x, y, z) {
  if (x < col.min.x || y < col.min.y || z < col.min.z) return true;
  if (x > col.max.x || y > col.max.y || z > col.max.z) return true;
  hitsAt(col, x, y, z, col.keepOut, _hits);
  if (_hits.length / 2 >= HIT_MIN) return true;
  hitsAt(col, x, y, z, col.keepOut * MAX_OUT, _hits);
  return _hits.length === 0;
}

/** Push `pos` off nearby splat surfaces along the contact gradient (same side). */
export function snapToWalkable(col, pos) {
  const R = col.keepOut;
  const pts = col.pts;
  for (let iter = 0; iter < 20; iter++) {
    hitsAt(col, pos.x, pos.y, pos.z, R, _hits);
    const n = _hits.length / 2;
    if (n < HIT_MIN) break;
    let px = 0;
    let py = 0;
    let pz = 0;
    let wsum = 0;
    for (let h = 0; h < _hits.length; h += 2) {
      const i = _hits[h];
      const dist = Math.sqrt(Math.max(_hits[h + 1], 1e-8));
      const w = (R - dist) / dist;
      px += (pos.x - pts[i]) * w;
      py += (pos.y - pts[i + 1]) * w;
      pz += (pos.z - pts[i + 2]) * w;
      wsum += w;
    }
    if (wsum < 1e-8) break;
    pos.x += px / wsum;
    pos.y += py / wsum;
    pos.z += pz / wsum;
  }
  pos.clamp(col.min, col.max);
  return pos;
}

/** Slide `pos` along `delta`, stopping before entering the keep-out around surfaces. */
export function resolveMove(col, pos, delta) {
  const len = delta.length();
  if (len < 1e-8) return pos;
  const stepLen = col.keepOut * 0.2;
  const steps = Math.max(1, Math.ceil(len / stepLen));
  const ix = delta.x / steps;
  const iy = delta.y / steps;
  const iz = delta.z / steps;
  const probe = resolveMove._p;
  for (let s = 0; s < steps; s++) {
    probe.set(pos.x + ix, pos.y + iy, pos.z + iz);
    if (!blocked(col, probe.x, probe.y, probe.z)) {
      pos.copy(probe);
      continue;
    }
    if (!blocked(col, pos.x + ix, pos.y, pos.z)) pos.x += ix;
    if (!blocked(col, pos.x, pos.y + iy, pos.z)) pos.y += iy;
    if (!blocked(col, pos.x, pos.y, pos.z + iz)) pos.z += iz;
  }
  pos.clamp(col.min, col.max);
  return pos;
}

resolveMove._p = new THREE.Vector3();
