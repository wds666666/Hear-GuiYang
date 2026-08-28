export function parseRoute(hash = window.location.hash) {
  const value = hash.replace(/^#/, '') || '/';
  const parts = value.split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'map' };
  if (parts[0] === 'spot' && parts[1] && parts.length === 2) return { page: 'spot', id: parts[1] };
  if (parts[0] === 'spot' && parts[1] && parts[2] === 'splat' && parts.length === 3) {
    return { page: 'splat', id: parts[1] };
  }
  return { page: 'not-found' };
}

export function navigate(path) {
  window.location.hash = path;
}

export function createRouter(render) {
  let cleanup = null;
  const route = async () => {
    if (cleanup) await cleanup();
    cleanup = await render(parseRoute()) || null;
  };
  window.addEventListener('hashchange', route);
  route();
  return () => {
    window.removeEventListener('hashchange', route);
    if (cleanup) cleanup();
  };
}
