import { experienceCards, stopMedia } from '../components/experience-cards.js';
import { asset } from '../assets.js';

export function renderSpotPage(root, spot, navigate) {
  root.innerHTML = `<article class="spot-page" style="--spot:${spot.color}">
    <header class="spot-hero">
      <img src="${asset(spot.image)}" alt="${spot.name}" />
      <div class="spot-hero__shade"></div>
      <nav class="spot-nav">
        <button type="button" class="round-action" data-back aria-label="返回地图">←</button>
        <img class="brand-mark" src="${asset('/assets/images/logo-mark.png')}" alt="" width="240" height="240" />
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
      ${experienceCards({ audio: spot.audio, vlog: spot.vlog, splat: spot.splat })}
    </section>
  </article>`;

  const back = root.querySelector('[data-back]');
  const splat = root.querySelector('[data-splat]');
  const goBack = () => navigate('/');
  const goSplat = () => navigate(`/spot/${spot.id}/splat`);
  back.addEventListener('click', goBack);
  splat?.addEventListener('click', goSplat);

  return () => {
    stopMedia(root);
    back.removeEventListener('click', goBack);
    splat?.removeEventListener('click', goSplat);
  };
}
