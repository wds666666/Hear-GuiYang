import { createMap } from '../map/create-map.js';

export function renderMapPage(root, spots, navigate) {
  root.innerHTML = `<section class="map-page">
    <div id="map" class="map-canvas" aria-label="贵阳景点地图"></div>
    <header class="map-brand glass-panel">
      <p class="eyebrow">HEAR · GUIYANG</p>
      <h1>听见贵阳</h1>
      <p>沿着经纬度，听见一座城。</p>
      <span class="map-brand__status"><i></i> ${spots.length} 个声音坐标</span>
      <button type="button" class="sound-toggle" data-sound aria-pressed="false">开启声音</button>
    </header>
    <aside class="spot-dock glass-panel" aria-label="景点列表">
      <p class="spot-dock__title">选择一个坐标</p>
      <div class="spot-dock__list">
        ${spots.map((spot) => `<button type="button" class="spot-row" data-spot="${spot.id}">
          <span class="spot-row__dot" style="--spot:${spot.color}">${spot.icon}</span>
          <span><strong>${spot.name}</strong><small>${spot.splat.status === 'ready' ? '声音 · Vlog · 3D' : '声音 · Vlog'}</small></span>
          <span class="spot-row__arrow" aria-hidden="true">↗</span>
        </button>`).join('')}
      </div>
    </aside>
    <div class="map-note glass-panel"><span class="map-note__pulse"></span><span>悬停标记试听<br><small>点击进入完整体验</small></span></div>
  </section>`;

  const audio = new Audio();
  audio.loop = true;
  audio.volume = .42;
  let activeSpot = null;
  const soundBtn = root.querySelector('[data-sound]');
  const markSoundOn = () => {
    soundBtn.textContent = '声音已开';
    soundBtn.setAttribute('aria-pressed', 'true');
  };

  const preview = (spot) => {
    if (activeSpot?.id === spot.id && !audio.paused) return;
    activeSpot = spot;
    audio.src = spot.audio.src;
    audio.play().then(markSoundOn).catch(() => {});
    root.querySelectorAll('.spot-row').forEach((row) => row.classList.toggle('is-active', row.dataset.spot === spot.id));
  };
  const endPreview = (spot) => {
    if (activeSpot?.id !== spot.id) return;
    audio.pause();
    audio.currentTime = 0;
    activeSpot = null;
    root.querySelector(`[data-spot="${spot.id}"]`)?.classList.remove('is-active');
  };

  const mapController = createMap({
    element: root.querySelector('#map'), spots,
    onSelect: (spot) => navigate(`/spot/${spot.id}`),
    onPreview: preview,
    onPreviewEnd: endPreview,
  });

  const listeners = [];
  root.querySelectorAll('.spot-row').forEach((row) => {
    const spot = spots.find((item) => item.id === row.dataset.spot);
    const enter = () => mapController.focus(spot);
    const leave = () => mapController.close(spot);
    const click = () => navigate(`/spot/${spot.id}`);
    row.addEventListener('mouseenter', enter);
    row.addEventListener('focus', enter);
    row.addEventListener('mouseleave', leave);
    row.addEventListener('blur', leave);
    row.addEventListener('click', click);
    listeners.push([row, enter, leave, click]);
  });

  const armSound = () => {
    const spot = activeSpot || spots[0];
    audio.src = spot.audio.src;
    audio.play().then(() => {
      markSoundOn();
      if (!activeSpot) {
        audio.pause();
        audio.currentTime = 0;
      }
    }).catch(() => {});
  };
  soundBtn.addEventListener('click', armSound);

  return () => {
    soundBtn.removeEventListener('click', armSound);
    listeners.forEach(([row, enter, leave, click]) => {
      row.removeEventListener('mouseenter', enter);
      row.removeEventListener('focus', enter);
      row.removeEventListener('mouseleave', leave);
      row.removeEventListener('blur', leave);
      row.removeEventListener('click', click);
    });
    audio.pause();
    audio.src = '';
    mapController.destroy();
  };
}
