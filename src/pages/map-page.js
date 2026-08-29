import { createMap } from '../map/create-map.js';
import { createFoodPanel } from '../components/food-panel.js';
import { foodMarker } from '../data/food.js';
import { asset } from '../assets.js';

const audio = new Audio();
audio.loop = true;
audio.volume = .42;
audio.playsInline = true;
let soundReady = false;
let dockOpen = false;

function spotHint(spot) {
  if (spot.subSpots?.length) return `小地图 · ${spot.subSpots.length} 个声音角落`;
  const parts = ['声音'];
  if (spot.vlog.status === 'ready') parts.push('Vlog');
  if (spot.splat.status === 'ready') parts.push('3D');
  return parts.join(' · ');
}

export function renderMapPage(root, spots, navigate) {
  root.innerHTML = `<section class="map-page">
    <div id="map" class="map-canvas" aria-label="贵阳景点地图"></div>
    <header class="map-brand glass-panel">
      <p class="eyebrow">HEAR · GUIYANG</p>
      <h1>听见贵阳</h1>
      <p>沿着经纬度，听见一座城。</p>
      <span class="map-brand__status"><i></i> ${spots.length} 个声音坐标</span>
      <button type="button" class="sound-toggle" data-sound aria-pressed="${soundReady}">${soundReady ? '声音已开' : '开启声音'}</button>
    </header>
    <div class="spot-dock-wrap ${dockOpen ? 'is-open' : ''}" data-dock-wrap>
      <button type="button" class="dock-tab glass-panel" data-dock-toggle aria-expanded="${dockOpen}" aria-controls="spot-dock">
        <span class="dock-tab__icon" aria-hidden="true">▸</span>
        <span class="dock-tab__label">声音坐标 ${spots.length}</span>
      </button>
      <aside id="spot-dock" class="spot-dock glass-panel" aria-label="景点列表">
        <p class="spot-dock__title">选择一个坐标</p>
        <div class="spot-dock__list">
          ${spots.map((spot) => `<button type="button" class="spot-row" data-spot="${spot.id}">
            <span class="spot-row__dot" style="--spot:${spot.color}">${spot.icon}</span>
            <span><strong>${spot.name}</strong><small>${spotHint(spot)}</small></span>
            <span class="spot-row__arrow" aria-hidden="true">↗</span>
          </button>`).join('')}
        </div>
      </aside>
    </div>
    <div class="map-note glass-panel"><span class="map-note__pulse"></span><span>悬停标记试听<br><small>点击进入完整体验</small></span></div>
  </section>`;

  const page = root.querySelector('.map-page');
  let activeSpot = null;
  let live = true;
  const soundBtn = root.querySelector('[data-sound]');
  const markSoundOn = () => {
    soundReady = true;
    soundBtn.textContent = '声音已开';
    soundBtn.setAttribute('aria-pressed', 'true');
  };

  const preview = (spot) => {
    if (activeSpot?.id === spot.id && !audio.paused) return;
    activeSpot = spot;
    audio.src = asset(spot.audio.src);
    audio.play().then(() => {
      soundReady = true;
      if (!live) {
        audio.pause();
        return;
      }
      markSoundOn();
    }).catch(() => {});
    root.querySelectorAll('.spot-row').forEach((row) => row.classList.toggle('is-active', row.dataset.spot === spot.id));
  };
  const endPreview = (spot) => {
    if (activeSpot?.id !== spot.id) return;
    audio.pause();
    audio.currentTime = 0;
    activeSpot = null;
    root.querySelector(`[data-spot="${spot.id}"]`)?.classList.remove('is-active');
  };

  const foodPanel = createFoodPanel(page);

  const mapController = createMap({
    element: root.querySelector('#map'), spots,
    onSelect: (spot) => navigate(spot.subSpots?.length ? `/spot/${spot.id}/map` : `/spot/${spot.id}`),
    onPreview: preview,
    onPreviewEnd: endPreview,
    extraMarkers: [{
      ...foodMarker,
      eyebrow: '专题',
      onClick: () => {
        audio.pause();
        foodPanel.open();
      },
    }],
  });

  const dockWrap = root.querySelector('[data-dock-wrap]');
  const dockToggle = root.querySelector('[data-dock-toggle]');

  const setDock = (open) => {
    dockOpen = open;
    dockWrap.classList.toggle('is-open', open);
    dockToggle.setAttribute('aria-expanded', String(open));
  };
  const onDockToggle = () => setDock(!dockOpen);
  dockToggle.addEventListener('click', onDockToggle);

  const listeners = [];
  root.querySelectorAll('.spot-row').forEach((row) => {
    const spot = spots.find((item) => item.id === row.dataset.spot);
    // 悬停：地图飞到该坐标、放大 marker，并弹出带图片和简介的浮窗试听。
    const enter = () => mapController.focus(spot);
    const leave = () => mapController.close(spot);
    const click = () => navigate(spot.subSpots?.length ? `/spot/${spot.id}/map` : `/spot/${spot.id}`);
    row.addEventListener('mouseenter', enter);
    row.addEventListener('focus', enter);
    row.addEventListener('mouseleave', leave);
    row.addEventListener('blur', leave);
    row.addEventListener('click', click);
    listeners.push([row, enter, leave, click]);
  });

  const unlock = () => {
    if (soundReady) return;
    if (!audio.src) audio.src = asset((activeSpot || spots[0]).audio.src);
    audio.play().then(() => {
      soundReady = true;
      if (!live) {
        audio.pause();
        audio.currentTime = 0;
        return;
      }
      markSoundOn();
      if (!activeSpot) {
        audio.pause();
        audio.currentTime = 0;
      }
    }).catch(() => {});
  };
  soundBtn.addEventListener('click', unlock);
  root.addEventListener('pointerdown', unlock, true);

  return () => {
    live = false;
    soundBtn.removeEventListener('click', unlock);
    root.removeEventListener('pointerdown', unlock, true);
    dockToggle.removeEventListener('click', onDockToggle);
    listeners.forEach(([row, enter, leave, click]) => {
      row.removeEventListener('mouseenter', enter);
      row.removeEventListener('focus', enter);
      row.removeEventListener('mouseleave', leave);
      row.removeEventListener('blur', leave);
      row.removeEventListener('click', click);
    });
    audio.pause();
    audio.currentTime = 0;
    foodPanel.destroy();
    mapController.destroy();
  };
}
