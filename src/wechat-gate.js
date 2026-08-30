export function isWeChat(ua) {
  return /MicroMessenger/i.test(ua);
}

export function isAndroid(ua) {
  return /Android/i.test(ua);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.cssText = 'position:fixed;opacity:0';
  document.body.append(el);
  el.select();
  document.execCommand('copy');
  el.remove();
}

export function mountWeChatGate(ua = navigator.userAgent, href = location.href) {
  if (!isWeChat(ua) || document.querySelector('.wx-gate')) return;

  const browserName = isAndroid(ua) ? '在浏览器中打开' : '在 Safari 中打开';
  const gate = document.createElement('div');
  gate.className = 'wx-gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'wx-gate-title');
  gate.innerHTML = `
    <div class="wx-gate__hint" aria-hidden="true">
      <svg class="wx-gate__arrow" viewBox="0 0 88 72" fill="none">
        <path d="M14 58c18-4 42-8 58-36" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M58 14h22v22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>点右上角 ···</span>
    </div>
    <section class="wx-gate__card">
      <p class="eyebrow">OPEN IN BROWSER</p>
      <h2 id="wx-gate-title">请用手机浏览器打开</h2>
      <p>微信里 3D 场景和声音往往放不全。点右上角 ···，选「${browserName}」。</p>
      <div class="wx-gate__actions">
        <button type="button" class="wx-gate__copy" data-wx-copy>复制链接</button>
        <button type="button" class="wx-gate__stay" data-wx-stay>仍要继续</button>
      </div>
    </section>`;
  document.body.append(gate);

  gate.querySelector('[data-wx-copy]').addEventListener('click', async (event) => {
    try {
      await copyText(href);
      event.currentTarget.textContent = '已复制，去浏览器粘贴';
    } catch {
      event.currentTarget.textContent = '复制失败，请手动复制地址栏';
    }
  });
  gate.querySelector('[data-wx-stay]').addEventListener('click', () => gate.remove());
}
