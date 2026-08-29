import { experienceCards, stopMedia } from '../components/experience-cards.js';
import { asset } from '../assets.js';

export function renderSubSpotPage(root, spot, subSpot, navigate) {
  const index = spot.subSpots.indexOf(subSpot) + 1;
  root.innerHTML = `<article class="spot-page" style="--spot:${spot.color}">
    <header class="spot-hero">
      <img src="${asset(subSpot.image)}" alt="${subSpot.name}" />
      <div class="spot-hero__shade"></div>
      <nav class="spot-nav">
        <button type="button" class="round-action" data-back aria-label="返回${spot.name}小地图">←</button>
        <span>听见贵阳 · ${spot.name} · ${subSpot.name}</span>
      </nav>
      <div class="spot-hero__content">
        <p class="eyebrow">${spot.name} · ${subSpot.lat.toFixed(4)}° N · ${subSpot.lng.toFixed(4)}° E</p>
        <h1>${subSpot.name}</h1>
        <p>${subSpot.description}</p>
      </div>
      <span class="spot-hero__index">${String(index).padStart(2, '0')}</span>
    </header>
    <section class="experience-section">
      <header><p class="eyebrow">CHOOSE YOUR WAY</p><h2>用一种方式，靠近这里</h2></header>
      ${experienceCards({
        audio: subSpot.audio,
        vlog: subSpot.vlog,
        splat: spot.splat,
        splatNote: `小景点共用${spot.name}的高斯重建场景，可自由漫游整片区域。`,
      })}
    </section>
  </article>`;

  const back = root.querySelector('[data-back]');
  const splat = root.querySelector('[data-splat]');
  const goBack = () => navigate(`/spot/${spot.id}/map`);
  const goSplat = () => navigate(`/spot/${spot.id}/splat`);
  back.addEventListener('click', goBack);
  splat?.addEventListener('click', goSplat);

  return () => {
    stopMedia(root);
    back.removeEventListener('click', goBack);
    splat?.removeEventListener('click', goSplat);
  };
}
