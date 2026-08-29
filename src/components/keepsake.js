import { asset } from '../assets.js';
import { keepsakePosters } from '../data/keepsake.js';

// 声音纪念海报：用户填一个 ID，随机抽一张贵阳海报，
// 在海报下方补一条「票根」印上 ID、日期和这次的融合组合，可直接下载。
const PAPER = '#f3efe4';
const INK = '#102624';
const INK_SOFT = '#405653';
const JADE = '#1f7770';
const SERIF = '"Songti SC", "STSong", "Noto Serif CJK SC", serif';
const SANS = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
// 排版基准宽度：海报实际宽度除以它得到缩放系数，换新海报不必重排。
const BASE_WIDTH = 688;

function normalizeId(raw) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function today() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
}

function pickPoster(excludeId) {
  const pool = keepsakePosters.filter((poster) => poster.id !== excludeId);
  const list = pool.length ? pool : keepsakePosters;
  return list[Math.floor(Math.random() * list.length)];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${src}`));
    img.src = src;
  });
}

function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut}…`;
}

async function renderPoster(poster, id, mix) {
  const img = await loadImage(asset(poster.src));
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const scale = width / BASE_WIDTH;
  const px = (value) => value * scale;
  const stub = px(152);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height + stub;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, height, width, stub);
  ctx.strokeStyle = 'rgba(16, 38, 36, .3)';
  ctx.lineWidth = Math.max(1, px(1.2));
  ctx.setLineDash([px(7), px(7)]);
  ctx.beginPath();
  ctx.moveTo(0, height + ctx.lineWidth / 2);
  ctx.lineTo(width, height + ctx.lineWidth / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const left = px(40);
  const right = width - px(40);
  const rows = [height + px(46), height + px(94), height + px(128)];

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = JADE;
  ctx.font = `700 ${px(15)}px ${SANS}`;
  ctx.letterSpacing = `${px(2)}px`;
  ctx.fillText('听见贵阳 · 声音纪念票', left, rows[0]);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = INK;
  ctx.font = `600 ${px(34)}px ${SERIF}`;
  ctx.fillText(fit(ctx, id, right - left - px(120)), left, rows[1]);

  ctx.fillStyle = INK_SOFT;
  ctx.font = `${px(13)}px ${SANS}`;
  ctx.fillText(fit(ctx, mix, right - left), left, rows[2]);

  ctx.textAlign = 'right';
  ctx.fillStyle = INK_SOFT;
  ctx.font = `${px(13)}px ${SANS}`;
  ctx.fillText(today(), right, rows[0]);
  ctx.fillStyle = INK;
  ctx.font = `600 ${px(20)}px ${SERIF}`;
  ctx.fillText(`贵阳 · ${poster.name}`, right, rows[1]);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', .92));
  if (!blob) throw new Error('cannot encode poster');
  return blob;
}

export function createKeepsake(host) {
  const dialog = document.createElement('dialog');
  dialog.className = 'keepsake';
  dialog.setAttribute('aria-label', '声音纪念海报');
  dialog.innerHTML = `<article class="keepsake__panel">
    <header class="keepsake__head">
      <div>
        <p class="eyebrow">SOUND KEEPSAKE</p>
        <h2>这段声音属于你了</h2>
        <p data-intro>留一个 ID，随机抽一张贵阳海报，编号会印在票根上。</p>
      </div>
      <button type="button" class="round-action keepsake__close" data-close aria-label="关闭">×</button>
    </header>
    <form class="keepsake__form" data-form>
      <label for="keepsake-id">你的 ID</label>
      <input id="keepsake-id" name="id" type="text" maxlength="24" autocomplete="off"
        placeholder="昵称 / 手机尾号 / 任意编号" required />
      <button type="submit" class="primary-action" data-submit>抽一张纪念海报 <span aria-hidden="true">→</span></button>
      <p class="keepsake__hint" data-hint role="status"></p>
    </form>
    <div class="keepsake__result" data-result hidden>
      <img class="keepsake__preview" data-preview alt="纪念海报预览" />
      <div class="keepsake__side">
        <p class="keepsake__caption" data-caption></p>
        <a class="primary-action" data-download download>下载海报 <span aria-hidden="true">↓</span></a>
        <button type="button" class="keepsake__again" data-again>换一张</button>
      </div>
    </div>
  </article>`;
  host.appendChild(dialog);

  const form = dialog.querySelector('[data-form]');
  const input = dialog.querySelector('#keepsake-id');
  const submit = dialog.querySelector('[data-submit]');
  const hint = dialog.querySelector('[data-hint]');
  const result = dialog.querySelector('[data-result]');
  const preview = dialog.querySelector('[data-preview]');
  const caption = dialog.querySelector('[data-caption]');
  const download = dialog.querySelector('[data-download]');
  const again = dialog.querySelector('[data-again]');

  let mix = '声音实验室 · 一段融合';
  let lastPosterId = null;
  let url = null;

  const dropUrl = () => {
    if (!url) return;
    URL.revokeObjectURL(url);
    url = null;
  };

  const generate = async () => {
    const id = normalizeId(input.value);
    if (!id) {
      hint.textContent = '先填一个 ID 吧。';
      input.focus();
      return;
    }
    submit.disabled = true;
    again.disabled = true;
    hint.textContent = '正在冲印……';
    const poster = pickPoster(lastPosterId);
    try {
      const blob = await renderPoster(poster, id, mix);
      dropUrl();
      url = URL.createObjectURL(blob);
      lastPosterId = poster.id;
      preview.src = url;
      preview.alt = `${poster.name} 纪念海报 · 编号 ${id}`;
      download.href = url;
      download.download = `听见贵阳-${poster.name}-${id.replace(/[\\/:*?"<>|]/g, '_')}.jpg`;
      caption.innerHTML = `<strong>贵阳 · ${poster.name}</strong><span>编号 ${id}</span><span>${mix}</span>`;
      result.hidden = false;
      hint.textContent = '';
      download.focus({ preventScroll: true });
    } catch {
      hint.textContent = '海报冲印失败，请稍后再试。';
    } finally {
      submit.disabled = false;
      again.disabled = false;
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    generate();
  };
  const onAgain = () => generate();

  const close = () => {
    if (dialog.open) dialog.close();
  };
  const onClick = (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) close();
  };

  form.addEventListener('submit', onSubmit);
  again.addEventListener('click', onAgain);
  dialog.addEventListener('click', onClick);

  return {
    open(label) {
      if (label) mix = label;
      dialog.querySelector('[data-intro]').textContent = `刚刚这段「${mix}」已经录在你名下。留一个 ID，随机抽一张贵阳海报，编号会印在票根上。`;
      if (!dialog.open) dialog.showModal();
      if (result.hidden) input.focus({ preventScroll: true });
    },
    close,
    destroy() {
      close();
      dropUrl();
      form.removeEventListener('submit', onSubmit);
      again.removeEventListener('click', onAgain);
      dialog.removeEventListener('click', onClick);
      dialog.remove();
    },
  };
}
