import { asset } from '../assets.js';
import { aiSounds, realSounds } from '../data/lab.js';

// 地图页右侧的声音实验室抽屉：AI 想象 × 真实采集各选一条，
// 两轨同时循环播放并各自控制音量，叠加成一段「融合」的贵阳。
export function createSoundLab(host, { onPauseAmbient, onClose } = {}) {
  const groups = [
    { key: 'ai', label: 'AI 想象', sounds: aiSounds },
    { key: 'real', label: '真实采集', sounds: realSounds },
  ];

  const panel = document.createElement('aside');
  panel.className = 'sound-lab';
  panel.setAttribute('aria-label', '声音实验室');
  panel.hidden = true;
  panel.innerHTML = `<header class="sound-lab__head">
    <div><p class="eyebrow">SOUND LAB</p><h2>声音实验室</h2></div>
    <button type="button" class="round-action" data-close aria-label="关闭声音实验室">×</button>
  </header>
  <p class="sound-lab__intro">左边挑一条 AI 想象，右边配一段真实采集——两条声音会同时响起，叠成一座想象的贵阳。</p>
  ${groups.map(({ key, label, sounds }) => `<div class="lab-group" data-group="${key}">
    <p class="lab-group__title">${label} · ${sounds.length}</p>
    <div class="lab-list" role="group" aria-label="${label}">
      ${sounds.map((sound) => `<button type="button" class="lab-chip" data-key="${key}" data-id="${sound.id}" aria-pressed="false">
        <strong>${sound.name}</strong><small>${sound.tag}</small>
      </button>`).join('')}
    </div>
  </div>`).join('')}
  <div class="lab-mix">
    <p class="lab-mix__now" data-now>尚未选择</p>
    <label><span>AI 想象</span><input type="range" min="0" max="1" step="0.01" value="0.75" data-vol="ai"><i>75%</i></label>
    <label><span>真实采集</span><input type="range" min="0" max="1" step="0.01" value="0.75" data-vol="real"><i>75%</i></label>
    <button type="button" class="primary-action" data-play disabled>播放融合</button>
  </div>`;
  host.appendChild(panel);

  const aiAudio = new Audio();
  const realAudio = new Audio();
  for (const el of [aiAudio, realAudio]) {
    el.loop = true;
    el.playsInline = true;
    el.preload = 'none';
  }
  aiAudio.volume = .75;
  realAudio.volume = .75;

  const tracks = { ai: aiAudio, real: realAudio };
  const sounds = { ai: aiSounds, real: realSounds };
  const selection = { ai: null, real: null };
  let playing = false;

  const playBtn = panel.querySelector('[data-play]');
  const nowLine = panel.querySelector('[data-now]');
  const volInputs = [...panel.querySelectorAll('[data-vol]')];
  const chips = [...panel.querySelectorAll('.lab-chip')];

  const refresh = () => {
    const ready = Boolean(selection.ai && selection.real);
    playBtn.disabled = !ready && !playing;
    playBtn.textContent = playing ? '停止播放' : '播放融合';
    playBtn.setAttribute('aria-pressed', String(playing));
    nowLine.textContent = playing
      ? `正在融合：${selection.ai?.name} × ${selection.real?.name}`
      : (ready ? `${selection.ai.name} × ${selection.real.name}` : '尚未选择');
  };

  const stop = () => {
    playing = false;
    for (const el of [aiAudio, realAudio]) {
      el.pause();
      el.currentTime = 0;
    }
    refresh();
  };

  const pinHost = () => {
    host.scrollLeft = 0;
    host.scrollTop = 0;
  };

  const play = () => {
    if (!selection.ai || !selection.real) return;
    onPauseAmbient?.();
    for (const key of ['ai', 'real']) {
      tracks[key].src = asset(selection[key].src);
    }
    aiAudio.play().catch(() => {});
    realAudio.play().catch(() => {});
    playing = true;
    refresh();
  };

  const onPlayClick = () => (playing ? stop() : play());
  playBtn.addEventListener('click', onPlayClick);

  const onChipClick = (event) => {
    const chip = event.currentTarget;
    const { key, id } = chip.dataset;
    if (selection[key]?.id === id) return;
    selection[key] = sounds[key].find((item) => item.id === id);
    panel.querySelectorAll(`.lab-chip[data-key="${key}"]`).forEach((item) => {
      item.setAttribute('aria-pressed', String(item.dataset.id === id));
    });
    if (playing) {
      // 播放中换轨：只换这一路，另一路保持不动。
      const track = tracks[key];
      track.src = asset(selection[key].src);
      track.currentTime = 0;
      track.play().catch(() => {});
    }
    refresh();
  };
  chips.forEach((chip) => chip.addEventListener('click', onChipClick));

  const onVolume = (event) => {
    const input = event.currentTarget;
    const value = Number.parseFloat(input.value);
    tracks[input.dataset.vol].volume = value;
    input.closest('label').querySelector('i').textContent = `${Math.round(value * 100)}%`;
  };
  volInputs.forEach((input) => input.addEventListener('input', onVolume));

  const close = () => {
    if (panel.hidden) return;
    stop();
    panel.classList.remove('is-open');
    panel.hidden = true;
    pinHost();
    onClose?.();
    return true;
  };
  const open = () => {
    if (!panel.hidden) return;
    panel.hidden = false;
    refresh();
    pinHost();
    // 先脱离 hidden 再加过渡类，否则抽屉不会滑出。
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      pinHost();
      panel.querySelector('[data-close]').focus({ preventScroll: true });
    });
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
    isPlaying: () => playing,
    destroy() {
      stop();
      window.removeEventListener('keydown', onKey);
      closeBtn.removeEventListener('click', close);
      playBtn.removeEventListener('click', onPlayClick);
      chips.forEach((chip) => chip.removeEventListener('click', onChipClick));
      volInputs.forEach((input) => input.removeEventListener('input', onVolume));
      panel.remove();
    },
  };
}
