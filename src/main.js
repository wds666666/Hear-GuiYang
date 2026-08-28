import './styles/tokens.css';
import './styles/base.css';
import './styles/map.css';
import './styles/spot.css';
import './styles/splat.css';
import { spots, getSpot } from './data/spots.js';
import { createRouter, navigate } from './router.js';
import { renderMapPage } from './pages/map-page.js';
import { renderSpotPage } from './pages/spot-page.js';
import { renderSplatPage } from './pages/splat-page.js';

const root = document.querySelector('#app');

createRouter(async (route) => {
  const spot = route.id ? getSpot(route.id) : null;
  window.scrollTo(0, 0);

  if (route.page === 'map') {
    document.title = '听见贵阳 · 城市声音地图';
    return renderMapPage(root, spots, navigate);
  }

  if (route.page === 'spot' && spot) {
    document.title = `${spot.name} · 听见贵阳`;
    return renderSpotPage(root, spot, navigate);
  }

  if (route.page === 'splat' && spot?.splat.status === 'ready') {
    document.title = `${spot.name} 3D 场景 · 听见贵阳`;
    return renderSplatPage(root, spot, navigate);
  }

  navigate('/');
  return null;
});
