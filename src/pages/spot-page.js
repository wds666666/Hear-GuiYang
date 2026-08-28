import { unavailableState } from '../components/unavailable-state.js';

export function renderSpotPage(root, spot, navigate) {
  const splatReady = spot.splat.status === 'ready';
  root.innerHTML = `<article class="spot-page" style="--spot:${spot.color}">
    <header class="spot-hero">
      <img src="${spot.image}" alt="${spot.name}" />
      <div class="spot-hero__shade"></div>
      <nav class="spot-nav">
        <button type="button" class="round-action" data-back aria-label="返回地图">←</button>
        <span>听见贵阳 · ${spot.name}</span>
      </nav>
      <div class="spot-hero__content">
        <p class="eyebrow">${spot.lat.toFixed(4)}° N · ${spot.lng.toFixed(4)}° E</p>
        <h1>${spot.name}</h1>
        <p>${spot.description}</p>
      </div>
      <span class="spot-hero__index">${String(spot.order).padStart(2, '0')}</span>
    </header>
    <section class="experience-section">
      <header><p class="eyebrow">CHOOSE YOUR WAY</p><h2>用一种方式，靠近这里</h2></header>
      <div class="experience-grid">
        <section class="experience-card experience-card--audio">
          <span class="experience-card__icon" aria-hidden="true">◖</span>
          <p class="eyebrow">SOUND</p><h3>听见此地</h3>
          <p>戴上耳机，让一段环境声把你带到现场。</p>
          <audio controls preload="metadata" src="${spot.audio.src}"></audio>
        </section>
        <section class="experience-card">
          <span class="experience-card__icon" aria-hidden="true">▶</span>
          <p class="eyebrow">VLOG</p><h3>观看 Vlog</h3>
          <p>跟随镜头，穿过街巷与山水。</p>
          ${unavailableState('影像正在路上', 'Vlog 素材准备中，稍后再来。')}
        </section>
        <section class="experience-card ${splatReady ? 'experience-card--splat' : ''}">
          <span class="experience-card__icon" aria-hidden="true">◎</span>
          <p class="eyebrow">3D SCENE</p><h3>走进 3D 场景</h3>
          <p>在高斯重建的空间里自由漫游。</p>
          ${splatReady
            ? '<button type="button" class="primary-action" data-splat>进入场景 <span>→</span></button>'
            : unavailableState('场景正在采集', '3D 素材准备中，入口为你保留。')}
        </section>
      </div>
    </section>
  </article>`;

  const back = root.querySelector('[data-back]');
  const splat = root.querySelector('[data-splat]');
  const audio = root.querySelector('audio');
  const goBack = () => navigate('/');
  const goSplat = () => navigate(`/spot/${spot.id}/splat`);
  back.addEventListener('click', goBack);
  splat?.addEventListener('click', goSplat);

  return () => {
    audio.pause();
    audio.currentTime = 0;
    back.removeEventListener('click', goBack);
    splat?.removeEventListener('click', goSplat);
  };
}
