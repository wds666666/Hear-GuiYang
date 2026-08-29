import { asset } from '../assets.js';
import { experienceCards, stopMedia } from './experience-cards.js';

export function createExperienceOverlay(host, { onSplat, onOpen } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'experience-overlay';
  dialog.setAttribute('aria-label', '景点体验');
  host.appendChild(dialog);

  let current = null;

  const close = () => {
    stopMedia(dialog);
    if (dialog.open) dialog.close();
  };

  const onClick = (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) {
      close();
      return;
    }
    if (current && event.target.closest('[data-splat]')) onSplat?.(current);
  };

  const onClosed = () => stopMedia(dialog);

  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', onClosed);

  return {
    open(item) {
      current = item;
      onOpen?.();
      dialog.style.setProperty('--spot', item.color);
      dialog.innerHTML = `<article class="experience-overlay__panel">
        <header class="experience-overlay__head">
          <img src="${asset(item.image)}" alt="" />
          <div>
            <p class="eyebrow">CHOOSE YOUR WAY</p>
            <h2>${item.name}</h2>
            <p>${item.description}</p>
          </div>
          <button type="button" class="round-action experience-overlay__close" data-close aria-label="关闭">×</button>
        </header>
        ${experienceCards({
          audio: item.audio,
          vlog: item.vlog,
          splat: item.splat,
          splatNote: item.splatNote,
        })}
      </article>`;
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[data-close]').focus({ preventScroll: true });
    },
    close,
    destroy() {
      close();
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClosed);
      dialog.remove();
    },
  };
}
