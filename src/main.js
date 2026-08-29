import './styles/tokens.css';
import './styles/base.css';
import './styles/map.css';
import './styles/spot.css';
import './styles/splat.css';
import './styles/submap.css';
import './styles/food.css';
import './styles/lab.css';
import { spots, getSpot, getSubSpot, hasSubMap } from './data/spots.js';
import { createRouter, navigate } from './router.js';
import { renderMapPage } from './pages/map-page.js';
import { renderSpotPage } from './pages/spot-page.js';
import { renderSplatPage } from './pages/splat-page.js';
import { renderSubMapPage } from './pages/submap-page.js';
import { renderSubSpotPage } from './pages/subspot-page.js';

const root = document.querySelector('#app');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}

createRouter(async (route) => {
  const spot = route.id ? getSpot(route.id) : null;
  window.scrollTo(0, 0);

  if (route.page === 'map') {
    document.title = '听见贵阳 · 城市声音地图';
    return renderMapPage(root, spots, navigate);
  }

  if (route.page === 'spot' && spot) {
    // 有二级地图的景点不走三卡详情页，直接落到小地图。
    if (hasSubMap(spot)) {
      navigate(`/spot/${spot.id}/map`);
      return null;
    }
    document.title = `${spot.name} · 听见贵阳`;
    return renderSpotPage(root, spot, navigate);
  }

  if (route.page === 'submap' && hasSubMap(spot)) {
    document.title = `${spot.name} 小地图 · 听见贵阳`;
    return renderSubMapPage(root, spot, navigate);
  }

  if (route.page === 'subspot' && spot) {
    const subSpot = getSubSpot(spot, route.subId);
    if (subSpot) {
      document.title = `${spot.name} · ${subSpot.name} · 听见贵阳`;
      return renderSubSpotPage(root, spot, subSpot, navigate);
    }
  }

  if (route.page === 'splat' && spot?.splat.status === 'ready') {
    document.title = `${spot.name} 3D 场景 · 听见贵阳`;
    return renderSplatPage(root, spot, navigate);
  }

  navigate('/');
  return null;
});
