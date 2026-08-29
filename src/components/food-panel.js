import { asset } from '../assets.js';
import { foods } from '../data/food.js';

// 地图页右侧的美食抽屉：上方是竖屏 Vlog 舞台，下方切换三道美食。
export function createFoodPanel(host) {
  const panel = document.createElement('aside');
  panel.className = 'food-panel';
  panel.setAttribute('aria-label', '贵阳美食');
  panel.hidden = true;
  panel.innerHTML = `<header class="food-panel__head">
    <div><p class="eyebrow">GUIYANG FLAVOURS</p><h2>听见锅气</h2></div>
    <button type="button" class="round-action" data-close aria-label="关闭美食侧栏">×</button>
  </header>
  <div class="food-stage">
    <video data-video playsinline preload="none" controls></video>
  </div>
  <div class="food-meta">
    <span class="food-meta__tag" data-tag></span>
    <h3 data-name></h3>
    <p data-desc></p>
    <label class="food-audio"><span>只听声音</span><audio data-audio controls preload="none"></audio></label>
  </div>
  <div class="food-switch" role="tablist" aria-label="选择美食">
    ${foods.map((food, index) => `<button type="button" role="tab" class="food-chip" data-food="${food.id}"
      aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">
      <img src="${asset(food.vlog.poster)}" alt="" loading="lazy" />
      <span>${food.name}</span>
    </button>`).join('')}
  </div>`;
  host.appendChild(panel);

  const video = panel.querySelector('[data-video]');
  const audio = panel.querySelector('[data-audio]');
  const chips = [...panel.querySelectorAll('[data-food]')];
  let current = null;

  // mp3 是 mp4 的音轨，两者同时播放会有回声。
  const onVideoPlay = () => audio.pause();
  const onAudioPlay = () => video.pause();
  video.addEventListener('play', onVideoPlay);
  audio.addEventListener('play', onAudioPlay);

  const stopAll = () => {
    video.pause();
    audio.pause();
  };

  const playVlog = () => {
    audio.pause();
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const select = (id) => {
    const food = foods.find((item) => item.id === id);
    if (!food || current === id) return false;
    stopAll();
    current = id;
    video.src = asset(food.vlog.src);
    video.poster = asset(food.vlog.poster);
    audio.src = asset(food.audio.src);
    panel.querySelector('[data-tag]').textContent = food.tag;
    panel.querySelector('[data-name]').textContent = food.name;
    panel.querySelector('[data-desc]').textContent = food.description;
    chips.forEach((chip) => {
      const active = chip.dataset.food === id;
      chip.setAttribute('aria-selected', String(active));
      chip.tabIndex = active ? 0 : -1;
    });
    return true;
  };

  const onChipClick = (event) => {
    if (select(event.currentTarget.dataset.food)) playVlog();
  };
  chips.forEach((chip) => chip.addEventListener('click', onChipClick));

  const close = () => {
    if (panel.hidden) return;
    stopAll();
    panel.classList.remove('is-open');
    panel.hidden = true;
  };
  const open = () => {
    if (!current) select(foods[0].id);
    panel.hidden = false;
    playVlog();
    // 先脱离 hidden 再加过渡类，否则抽屉不会滑出。
    requestAnimationFrame(() => panel.classList.add('is-open'));
    panel.querySelector('[data-close]').focus();
  };

  const closeBtn = panel.querySelector('[data-close]');
  closeBtn.addEventListener('click', close);
  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };
  window.addEventListener('keydown', onKey);

  return {
    open,
    close,
    toggle: () => (panel.hidden ? open() : close()),
    destroy() {
      stopAll();
      window.removeEventListener('keydown', onKey);
      closeBtn.removeEventListener('click', close);
      chips.forEach((chip) => chip.removeEventListener('click', onChipClick));
      video.removeEventListener('play', onVideoPlay);
      audio.removeEventListener('play', onAudioPlay);
      panel.remove();
    },
  };
}
