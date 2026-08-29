import { asset } from '../assets.js';

// 地图 marker tooltip 与左下抽屉的悬停浮窗共用同一套图文模板。
export function spotPreview(spot, eyebrow = '正在聆听') {
  return `<article class="spot-preview">
    <img src="${asset(spot.image)}" alt="${spot.name}" loading="lazy" />
    <div>
      <span class="spot-preview__eyebrow">${eyebrow}</span>
      <h2>${spot.name}</h2>
      <p>${spot.description}</p>
    </div>
  </article>`;
}
