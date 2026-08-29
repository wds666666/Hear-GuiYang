function formatView(spot, view) {
  const nums = (arr) => arr.map((value) => Number(value.toFixed(4)));
  return [
    `// ${spot.name}`,
    `up: [${nums(view.up).join(', ')}],`,
    `camera: {`,
    `  position: [${nums(view.position).join(', ')}],`,
    `  yaw: ${view.yaw.toFixed(4)},`,
    `  pitch: ${view.pitch.toFixed(4)},`,
    `},`,
  ].join('\n');
}

function renderView(root, view) {
  if (!view) return;
  root.querySelector('[data-cam-pos]').textContent = view.position.map((value) => value.toFixed(3)).join(', ');
  root.querySelector('[data-cam-rot]').textContent = `yaw ${view.yaw.toFixed(3)} · pitch ${view.pitch.toFixed(3)}`;
  root.querySelector('[data-cam-up]').textContent = view.up.map((value) => value.toFixed(0)).join(', ');
}

export function renderSplatPage(root, spot, navigate) {
  root.innerHTML = `<section class="splat-page">
    <div class="splat-stage" data-stage></div>
    <header class="splat-topbar">
      <button type="button" class="round-action round-action--dark" data-back aria-label="返回${spot.name}">←</button>
      <div><p class="eyebrow">3D GAUSSIAN SCENE</p><h1>${spot.name}</h1></div>
      <div class="splat-stats"><span data-count>读取场景</span><span data-fps>-- FPS</span></div>
    </header>
    <section class="splat-loading" data-loading role="status" aria-live="polite">
      <div class="splat-loading__orb"><span></span><i></i></div>
      <p class="eyebrow">ENTERING THE SCENE</p>
      <h2>正在走进${spot.name}</h2>
      <div class="splat-progress"><i data-progress></i></div>
      <p data-progress-label>准备加载 3D 场景…</p>
    </section>
    <section class="splat-error" data-error hidden role="alert">
      <p class="eyebrow">SCENE UNAVAILABLE</p><h2>场景加载失败</h2>
      <p data-error-message></p>
      <button type="button" class="primary-action" data-retry>重新加载</button>
    </section>
    <aside class="splat-camera" data-camera hidden>
      <p class="splat-camera__title">当前视角</p>
      <div class="splat-camera__row"><span>位置 XYZ</span><code data-cam-pos>—</code></div>
      <div class="splat-camera__row"><span>朝向</span><code data-cam-rot>—</code></div>
      <div class="splat-camera__row"><span>上方向</span><code data-cam-up>—</code></div>
      <button type="button" class="splat-camera__btn" data-copy>复制参数</button>
      <button type="button" class="splat-camera__btn" data-home>回到起点</button>
    </aside>
    <aside class="splat-help">
      <span><kbd>拖动</kbd> 转动视角</span><span><kbd>W A S D</kbd> 移动</span>
      <span><kbd>空格 / C</kbd> 升降</span><span><kbd>R</kbd> 回到起点</span>
      <span><kbd>P</kbd> 复制视角</span>
    </aside>
  </section>`;

  const stage = root.querySelector('[data-stage]');
  const loading = root.querySelector('[data-loading]');
  const error = root.querySelector('[data-error]');
  const progress = root.querySelector('[data-progress]');
  const progressLabel = root.querySelector('[data-progress-label]');
  const count = root.querySelector('[data-count]');
  const fps = root.querySelector('[data-fps]');
  const back = root.querySelector('[data-back]');
  const retry = root.querySelector('[data-retry]');
  const cameraPanel = root.querySelector('[data-camera]');
  const copyBtn = root.querySelector('[data-copy]');
  const homeBtn = root.querySelector('[data-home]');
  let session = null;
  let cancelled = false;
  let copyTimer = 0;

  const goBack = () => navigate(spot.subSpots?.length ? `/spot/${spot.id}/map` : '/');
  back.addEventListener('click', goBack);

  const copyView = async () => {
    if (!session) return;
    const text = formatView(spot, session.getView());
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '已复制';
    } catch {
      console.log(text);
      copyBtn.textContent = '见控制台';
    }
    clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyBtn.textContent = '复制参数';
    }, 1200);
  };
  const goHome = () => session?.goHome();
  copyBtn.addEventListener('click', copyView);
  homeBtn.addEventListener('click', goHome);
  const onKey = (event) => {
    if (event.code === 'KeyP') {
      event.preventDefault();
      copyView();
    }
  };
  window.addEventListener('keydown', onKey);

  const load = async () => {
    error.hidden = true;
    cameraPanel.hidden = true;
    loading.hidden = false;
    progress.style.width = '2%';
    try {
      if (session) await session.dispose();
      const { createSplatViewer } = await import('../splat/create-viewer.js');
      if (cancelled) return;
      session = await createSplatViewer({
        stage,
        spot,
        onProgress(percent, label) {
          progress.style.width = `${Math.max(2, percent)}%`;
          progressLabel.textContent = label || `已加载 ${Math.round(percent)}%`;
        },
        onStats(stats) {
          if (stats.count) count.textContent = `${stats.count.toLocaleString('zh-CN')} 个高斯点`;
          if (stats.fps) fps.textContent = `${stats.fps} FPS`;
        },
        onView(view) {
          renderView(root, view);
        },
      });
      if (cancelled) {
        await session?.dispose();
        session = null;
        return;
      }
      loading.hidden = true;
      cameraPanel.hidden = false;
    } catch (cause) {
      if (cancelled) return;
      loading.hidden = true;
      error.hidden = false;
      root.querySelector('[data-error-message]').textContent = cause instanceof Error ? cause.message : String(cause);
    }
  };

  retry.addEventListener('click', load);
  load();

  return async () => {
    cancelled = true;
    clearTimeout(copyTimer);
    back.removeEventListener('click', goBack);
    retry.removeEventListener('click', load);
    copyBtn.removeEventListener('click', copyView);
    homeBtn.removeEventListener('click', goHome);
    window.removeEventListener('keydown', onKey);
    if (session) await session.dispose();
  };
}
