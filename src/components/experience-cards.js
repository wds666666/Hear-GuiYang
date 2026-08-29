import { asset } from '../assets.js';
import { unavailableState } from './unavailable-state.js';

function audioCard({ audio }) {
  if (audio.status === 'unavailable') {
    return unavailableState('声音正在采集', '这里的环境声还没录到，入口为你保留。');
  }
  const note = audio.status === 'ready'
    ? '戴上耳机，让一段现场录音把你带到那里。'
    : '这里还没有实地录音，先用一段贵阳通用环境声占位。';
  return `<p>${note}</p><audio controls preload="metadata" src="${asset(audio.src)}"></audio>`;
}

function vlogCard({ vlog }) {
  if (vlog.status !== 'ready') {
    return `<p>跟随镜头，穿过街巷与山水。</p>${unavailableState('影像正在路上', 'Vlog 素材准备中，稍后再来。')}`;
  }
  return `<p>跟随镜头，穿过街巷与山水。</p>
    <video class="experience-video" controls playsinline preload="none"
      poster="${asset(vlog.poster)}" src="${asset(vlog.src)}"></video>`;
}

function splatCard({ splat, splatNote }) {
  if (splat.status !== 'ready') {
    return `<p>在高斯重建的空间里自由漫游。</p>${unavailableState('场景正在采集', '3D 素材准备中，入口为你保留。')}`;
  }
  return `<p>${splatNote}</p>
    <button type="button" class="primary-action" data-splat>进入场景 <span>→</span></button>`;
}

// 声音 / Vlog / 3D 三张卡，景点详情页与小景点详情页共用。
export function experienceCards({ audio, vlog, splat, splatNote = '在高斯重建的空间里自由漫游。' }) {
  return `<div class="experience-grid">
    <section class="experience-card experience-card--audio">
      <span class="experience-card__icon" aria-hidden="true">◖</span>
      <p class="eyebrow">SOUND</p><h3>听见此地</h3>
      ${audioCard({ audio })}
    </section>
    <section class="experience-card">
      <span class="experience-card__icon" aria-hidden="true">▶</span>
      <p class="eyebrow">VLOG</p><h3>观看 Vlog</h3>
      ${vlogCard({ vlog })}
    </section>
    <section class="experience-card ${splat.status === 'ready' ? 'experience-card--splat' : ''}">
      <span class="experience-card__icon" aria-hidden="true">◎</span>
      <p class="eyebrow">3D SCENE</p><h3>走进 3D 场景</h3>
      ${splatCard({ splat, splatNote })}
    </section>
  </div>`;
}

export function stopMedia(root) {
  root.querySelectorAll('audio, video').forEach((media) => {
    media.pause();
    media.currentTime = 0;
  });
}
