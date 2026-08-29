import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { FirstPersonControls } from './controls.js';
import { measureScene } from './bounds.js';
import { cachedPlyUrl } from './ply-cache.js';

const PIXEL_RATIO = window.devicePixelRatio || 1;
const MAX_STEP = 1 / 30;
const DEFAULT_UP = [0, -1, 0];
const STATUS = { 0: '下载中', 1: '解析中', 2: '完成' };

export async function createSplatViewer({ stage, spot, onProgress, onStats, onView }) {
  const plyUrl = await cachedPlyUrl(spot.splat.src, onProgress);
  const renderer = new THREE.WebGLRenderer({
    antialias: false, precision: 'highp', powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(PIXEL_RATIO);
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.setClearColor(0x07100f, 1);
  stage.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(62, stage.clientWidth / stage.clientHeight, .02, 1000);
  const sceneUp = new THREE.Vector3().fromArray(spot.splat.up ?? DEFAULT_UP).normalize();
  camera.up.copy(sceneUp);
  camera.position.set(0, 0, 4);

  const viewer = new GaussianSplats3D.Viewer({
    renderer, camera, rootElement: stage, cameraUp: sceneUp.toArray(), selfDrivenMode: false,
    useBuiltInControls: false, gpuAcceleratedSort: false,
    sharedMemoryForWorkers: crossOriginIsolated === true,
    integerBasedSort: false, halfPrecisionCovariancesOnGPU: false,
    dynamicScene: false, antialiased: true, sphericalHarmonicsDegree: 0,
    renderMode: GaussianSplats3D.RenderMode.Always,
    sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
    logLevel: GaussianSplats3D.LogLevel.Error, inMemoryCompressionLevel: 0,
    optimizeSplatData: false, freeIntermediateSplatData: true,
  });
  const controls = new FirstPersonControls(camera, stage, sceneUp);
  controls.onSpeedChange = (speed) => onStats({ speed });
  if (spot.splat.camera) controls.setView(spot.splat.camera);

  try {
    await viewer.addSplatScene(plyUrl, {
      format: GaussianSplats3D.SceneFormat.Ply,
      splatAlphaRemovalThreshold: 1,
      showLoadingUI: false,
      progressiveLoad: false,
      onProgress: (percent, label, status) => {
        onProgress(percent, `${STATUS[status] ?? ''} ${label ?? ''}`.trim());
      },
    });
  } finally {
    URL.revokeObjectURL(plyUrl);
  }

  const info = measureScene(viewer);
  camera.far = Math.max(500, info.radius * 40);
  camera.updateProjectionMatrix();
  controls.setSpeedScale(info.radius);
  if (spot.splat.camera) controls.setView(spot.splat.camera);
  else controls.setView({ position: info.center.toArray(), yaw: 0, pitch: 0 });
  controls.saveHome();

  onProgress(100, '渲染优化中…');
  for (let i = 0; i < 5; i++) {
    await viewer.runSplatSort(true, true);
    if (viewer.sortPromise) await viewer.sortPromise;
    viewer.update();
    viewer.render();
    const drawn = viewer.splatMesh?.geometry?.instanceCount ?? 0;
    if (drawn > 0 && !viewer.sortRunning) break;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  onStats({ count: info.count });

  const getView = () => ({
    position: camera.position.toArray(),
    yaw: controls.yaw,
    pitch: controls.pitch,
    up: controls.up.toArray(),
  });
  onView?.(getView());

  let raf = 0;
  let disposed = false;
  let sharpenFrames = 6;
  let last = performance.now();
  let frames = 0;
  let elapsed = 0;
  let camInfo = 0;
  const frame = (now) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_STEP);
    last = now;
    controls.update(dt);
    if (sharpenFrames > 0) {
      sharpenFrames -= 1;
      viewer.runSplatSort(true, true);
    }
    viewer.update();
    viewer.render();
    frames += 1;
    elapsed += dt;
    camInfo += dt;
    if (elapsed >= .6) {
      onStats({ fps: Math.round(frames / elapsed) });
      frames = 0;
      elapsed = 0;
    }
    if (camInfo >= .15) {
      onView?.(getView());
      camInfo = 0;
    }
  };
  raf = requestAnimationFrame(frame);

  const resize = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', resize);

  return {
    getView,
    goHome: () => {
      controls.goHome();
      onView?.(getView());
    },
    dispose: async () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      controls.dispose();
      await viewer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
