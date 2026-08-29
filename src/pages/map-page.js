import { createMap } from '../map/create-map.js';
import { createImageMap } from '../map/create-image-map.js';
import { createFoodPanel } from '../components/food-panel.js';
import { createSoundLab } from '../components/sound-lab.js';
import { createExperienceOverlay } from '../components/experience-overlay.js';
import { foodMarker } from '../data/food.js';
import { asset } from '../assets.js';

const audio = new Audio();
audio.loop = true;
audio.volume = .42;
audio.playsInline = true;
let dockOpen = false;
let mapScheme = 'illustrated';
let pickPixels = false;

export function getMapScheme() {
  return mapScheme;
}

const UNRECORDED = '#8a918e';

function isUnrecorded(spot) {
  return !spot.subSpots?.length && spot.vlog.status !== 'ready' && spot.splat.status !== 'ready';
}

function spotHint(spot) {
  if (isUnrecorded(spot)) return '尚未录制';
  if (spot.subSpots?.length) return `小地图 · ${spot.subSpots.length} 个声音角落`;
  const parts = ['声音'];
  if (spot.vlog.status === 'ready') parts.push('Vlog');
  if (spot.splat.status === 'ready') parts.push('3D');
  return parts.join(' · ');
}

function mapSpot(spot) {
  if (!isUnrecorded(spot)) return spot;
  return { ...spot, color: UNRECORDED, previewEyebrow: '尚未录制', markerClass: 'sound-marker--pending' };
}

export function renderMapPage(root, spots, navigate) {
  root.innerHTML = `<section class="map-page is-illustrated">
    <div id="map-illustrated" class="map-canvas map-canvas--illustrated" aria-label="走进贵阳手绘地图"></div>
    <div id="map" class="map-canvas" hidden aria-label="贵阳景点地图"></div>
    <header class="map-brand glass-panel">
      <div class="map-brand__head">
        <img class="brand-mark" src="${asset('/assets/images/logo-mark.png')}" alt="Guizhou Soundscapes" width="480" height="480" />
        <h1><span>听见</span><span>贵阳</span></h1>
      </div>
      <p>沿着经纬度，听见一座城。</p>
      <span class="map-brand__status"><i></i> ${spots.length} 个声音坐标</span>
      <div class="map-scheme" role="group" aria-label="地图方案">
        <button type="button" data-scheme="illustrated" aria-pressed="true">手绘地图</button>
        <button type="button" data-scheme="geo" aria-pressed="false">写实地图</button>
      </div>
      <button type="button" class="sound-toggle" data-pick aria-pressed="${pickPixels}">${pickPixels ? '标定中 · 再点关闭' : '标定像素'}</button>
    </header>
    <div class="spot-dock-wrap ${dockOpen ? 'is-open' : ''}" data-dock-wrap>
      <button type="button" class="dock-tab glass-panel" data-dock-toggle aria-expanded="${dockOpen}" aria-controls="spot-dock">
        <span class="dock-tab__icon" aria-hidden="true">▸</span>
        <span class="dock-tab__label">声音坐标 ${spots.length}</span>
      </button>
      <aside id="spot-dock" class="spot-dock glass-panel" aria-label="景点列表">
        <p class="spot-dock__title">选择一个坐标</p>
        <div class="spot-dock__list">
          ${spots.map((spot) => `<button type="button" class="spot-row${isUnrecorded(spot) ? ' is-pending' : ''}" data-spot="${spot.id}">
            <span class="spot-row__dot" style="--spot:${isUnrecorded(spot) ? UNRECORDED : spot.color}">${spot.icon}</span>
            <span><strong>${spot.name}</strong><small>${spotHint(spot)}</small></span>
            <span class="spot-row__arrow" aria-hidden="true">↗</span>
          </button>`).join('')}
        </div>
      </aside>
    </div>
    <div class="map-note glass-panel"><span class="map-note__pulse"></span><span data-map-note>悬停标记试听<br><small>⌃点击复制像素 · 或打开标定</small></span></div>
    <button type="button" class="lab-tab glass-panel" data-lab-toggle aria-expanded="false" aria-controls="sound-lab">
      <span class="lab-tab__icon" aria-hidden="true">◉</span>
      <span>声音实验室</span>
    </button>
  </section>`;

  const page = root.querySelector('.map-page');
  let activeSpot = null;
  let live = true;

  const preview = (spot) => {
    if (soundLab.isPlaying()) return; // 实验室正在融合播放时不叠加悬停试听
    if (activeSpot?.id === spot.id && !audio.paused) return;
    activeSpot = spot;
    audio.src = asset(spot.audio.src);
    audio.play().then(() => {
      if (!live) audio.pause();
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

  const labTab = root.querySelector('[data-lab-toggle]');
  const setLabOpen = (open) => {
    labTab.setAttribute('aria-expanded', String(open));
    labTab.classList.toggle('is-hidden', open);
    page.scrollLeft = 0;
    page.scrollTop = 0;
  };

  const foodPanel = createFoodPanel(page);
  // 声音实验室与地图环境声、美食抽屉互斥：融合播放时停掉悬停试听。
  const soundLab = createSoundLab(page, {
    onPauseAmbient: () => audio.pause(),
    onClose: () => setLabOpen(false),
  });
  const overlay = createExperienceOverlay(page, {
    onOpen: () => {
      audio.pause();
      foodPanel.close();
      soundLab.close();
      setLabOpen(false);
    },
    onSplat: (item) => navigate(`/spot/${item.id}/splat`),
  });

  const openSpot = (spot) => {
    if (spot.subSpots?.length) {
      navigate(`/spot/${spot.id}/map`);
      return;
    }
    overlay.open(spot);
  };
  const onLabToggle = () => {
    const opening = labTab.getAttribute('aria-expanded') !== 'true';
    if (opening) {
      audio.pause();
      foodPanel.close();
      soundLab.open();
    } else {
      soundLab.close();
    }
    setLabOpen(opening);
  };
  labTab.addEventListener('click', onLabToggle);

  const illustratedEl = root.querySelector('#map-illustrated');
  const geoEl = root.querySelector('#map');
  const mapNote = root.querySelector('[data-map-note]');
  const pickBtn = root.querySelector('[data-pick]');
  const GEO_NOTE = '悬停标记试听<br><small>点击打开体验</small>';
  const illNote = () => (pickPixels
    ? '点击地图复制像素坐标<br><small>原点在图片左上角 · 再点标定关闭</small>'
    : '悬停标记试听<br><small>⌃点击复制像素 · 或打开标定</small>');
  const openFood = () => {
    soundLab.close();
    setLabOpen(false);
    audio.pause();
    foodPanel.open();
  };
  const foodPin = { ...foodMarker, eyebrow: '专题', onClick: openFood };
  const illustratedMap = createImageMap(illustratedEl, {
    spots: spots.map(mapSpot),
    extraMarkers: [foodPin],
    onSelect: openSpot,
    onPreview: preview,
    onPreviewEnd: endPreview,
    pick: pickPixels,
    onPick: ({ text }) => {
      mapNote.innerHTML = `已复制 ${text}<br><small>像素 · 左上原点</small>`;
    },
  });
  let geoMap = null;

  const ensureGeoMap = () => {
    geoMap ??= createMap({
      element: geoEl, spots: spots.map(mapSpot),
      onSelect: openSpot,
      onPreview: preview,
      onPreviewEnd: endPreview,
      extraMarkers: [foodPin],
    });
    return geoMap;
  };

  const applyScheme = (scheme) => {
    mapScheme = scheme;
    page.classList.toggle('is-illustrated', scheme === 'illustrated');
    page.classList.toggle('is-geo', scheme === 'geo');
    root.querySelectorAll('[data-scheme]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.scheme === scheme));
    });
    mapNote.innerHTML = scheme === 'geo' ? GEO_NOTE : illNote();
    pickBtn.hidden = scheme !== 'illustrated';
    page.classList.toggle('is-picking', scheme === 'illustrated' && pickPixels);
    if (scheme === 'geo') {
      illustratedEl.style.visibility = 'hidden';
      illustratedEl.style.pointerEvents = 'none';
      geoEl.hidden = false;
      geoEl.style.visibility = '';
      geoEl.style.pointerEvents = '';
      ensureGeoMap();
    } else {
      illustratedEl.style.visibility = '';
      illustratedEl.style.pointerEvents = '';
      if (geoMap) {
        geoEl.style.visibility = 'hidden';
        geoEl.style.pointerEvents = 'none';
      }
    }
  };
  applyScheme(mapScheme);

  const onScheme = (event) => applyScheme(event.currentTarget.dataset.scheme);
  root.querySelectorAll('[data-scheme]').forEach((btn) => btn.addEventListener('click', onScheme));

  const onPickToggle = () => {
    pickPixels = !pickPixels;
    pickBtn.setAttribute('aria-pressed', String(pickPixels));
    pickBtn.textContent = pickPixels ? '标定中 · 再点关闭' : '标定像素';
    page.classList.toggle('is-picking', pickPixels);
    illustratedMap.setPick(pickPixels);
    mapNote.innerHTML = illNote();
  };
  pickBtn.addEventListener('click', onPickToggle);

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
    // 悬停：飞到该坐标、放大 marker，并弹出带图片和简介的浮窗试听。
    const enter = () => {
      if (mapScheme === 'geo') geoMap?.focus(spot);
      else illustratedMap.focus(spot);
    };
    const leave = () => {
      geoMap?.close(spot);
      illustratedMap.close(spot);
    };
    const click = () => openSpot(spot);
    row.addEventListener('mouseenter', enter);
    row.addEventListener('focus', enter);
    row.addEventListener('mouseleave', leave);
    row.addEventListener('blur', leave);
    row.addEventListener('click', click);
    listeners.push([row, enter, leave, click]);
  });

  const unlock = () => {
    if (soundLab.isPlaying() || !audio.paused) return;
    if (!audio.src) audio.src = asset((activeSpot || spots[0]).audio.src);
    audio.play().then(() => {
      if (!live || !activeSpot) {
        audio.pause();
        audio.currentTime = 0;
      }
    }).catch(() => {});
  };
  root.addEventListener('pointerdown', unlock, true);

  return () => {
    live = false;
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
    labTab.removeEventListener('click', onLabToggle);
    root.querySelectorAll('[data-scheme]').forEach((btn) => btn.removeEventListener('click', onScheme));
    pickBtn.removeEventListener('click', onPickToggle);
    soundLab.destroy();
    foodPanel.destroy();
    overlay.destroy();
    illustratedMap.destroy();
    geoMap?.destroy();
  };
}
