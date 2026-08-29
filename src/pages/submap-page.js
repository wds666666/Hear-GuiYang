import { createMap } from '../map/create-map.js';
import { createExperienceOverlay } from '../components/experience-overlay.js';
import { asset } from '../assets.js';

const audio = new Audio();
audio.loop = true;
audio.volume = .42;
audio.playsInline = true;

export function renderSubMapPage(root, spot, navigate) {
  const splatReady = spot.splat.status === 'ready';
  root.innerHTML = `<section class="submap-page" style="--spot:${spot.color}">
    <div id="submap" class="map-canvas" aria-label="${spot.name}小地图"></div>
    <header class="submap-bar glass-panel">
      <button type="button" class="round-action round-action--light" data-back aria-label="返回贵阳地图">←</button>
      <div>
        <p class="eyebrow">${spot.subSpots.length} 个声音角落</p>
        <h1>${spot.name}</h1>
      </div>
    </header>
    <aside class="submap-dock glass-panel" aria-label="${spot.name}地标列表">
      <p class="spot-dock__title">地标一览</p>
      <div class="spot-dock__list">
        ${spot.subSpots.map((sub) => `<button type="button" class="spot-row" data-sub="${sub.id}">
          <span class="spot-row__dot" style="--spot:${spot.color}">${sub.icon}</span>
          <span><strong>${sub.name}</strong><small>${sub.vlog.status === 'ready' ? '声音 · Vlog' : '素材准备中'}</small></span>
          <span class="spot-row__arrow" aria-hidden="true">↗</span>
        </button>`).join('')}
      </div>
    </aside>
    <div class="submap-gs">
      ${splatReady
        ? '<button type="button" class="gs-action" data-splat><span class="gs-action__icon" aria-hidden="true">◎</span><span><strong>进入高斯场景</strong><small>3D Gaussian Splat</small></span></button>'
        : '<div class="gs-action gs-action--off"><span class="gs-action__icon" aria-hidden="true">···</span><span><strong>高斯场景采集中</strong><small>入口为你保留</small></span></div>'}
    </div>
  </section>`;

  let activeSub = null;
  let live = true;

  const preview = (sub) => {
    if (activeSub?.id === sub.id && !audio.paused) return;
    activeSub = sub;
    audio.src = asset(sub.audio.src);
    audio.play().then(() => {
      if (!live) audio.pause();
    }).catch(() => {});
    root.querySelectorAll('.spot-row').forEach((row) => row.classList.toggle('is-active', row.dataset.sub === sub.id));
  };
  const endPreview = (sub) => {
    if (activeSub?.id !== sub.id) return;
    audio.pause();
    audio.currentTime = 0;
    activeSub = null;
    root.querySelector(`[data-sub="${sub.id}"]`)?.classList.remove('is-active');
  };

  const overlay = createExperienceOverlay(root.querySelector('.submap-page'), {
    onOpen: () => {
      audio.pause();
      audio.currentTime = 0;
    },
    onSplat: () => navigate(`/spot/${spot.id}/splat`),
  });

  const openSub = (sub) => overlay.open({
    id: spot.id,
    name: sub.name,
    description: sub.description,
    image: sub.image,
    audio: sub.audio,
    vlog: sub.vlog,
    splat: spot.splat,
    splatNote: `小景点共用${spot.name}的高斯重建场景，可自由漫游整片区域。`,
    color: spot.color,
  });

  const mapController = createMap({
    element: root.querySelector('#submap'),
    spots: spot.subSpots,
    color: spot.color,
    center: [spot.lat, spot.lng],
    zoom: 17,
    fit: true,
    onSelect: openSub,
    onPreview: preview,
    onPreviewEnd: endPreview,
  });

  const back = root.querySelector('[data-back]');
  const goBack = () => navigate('/');
  back.addEventListener('click', goBack);

  const splatBtn = root.querySelector('[data-splat]');
  const goSplat = () => navigate(`/spot/${spot.id}/splat`);
  splatBtn?.addEventListener('click', goSplat);

  const listeners = [];
  root.querySelectorAll('.spot-row').forEach((row) => {
    const sub = spot.subSpots.find((item) => item.id === row.dataset.sub);
    const enter = () => mapController.focus(sub, { minZoom: 17 });
    const leave = () => mapController.close(sub);
    const click = () => openSub(sub);
    row.addEventListener('mouseenter', enter);
    row.addEventListener('focus', enter);
    row.addEventListener('mouseleave', leave);
    row.addEventListener('blur', leave);
    row.addEventListener('click', click);
    listeners.push([row, enter, leave, click]);
  });

  return () => {
    live = false;
    back.removeEventListener('click', goBack);
    splatBtn?.removeEventListener('click', goSplat);
    listeners.forEach(([row, enter, leave, click]) => {
      row.removeEventListener('mouseenter', enter);
      row.removeEventListener('focus', enter);
      row.removeEventListener('mouseleave', leave);
      row.removeEventListener('blur', leave);
      row.removeEventListener('click', click);
    });
    audio.pause();
    audio.currentTime = 0;
    overlay.destroy();
    mapController.destroy();
  };
}
