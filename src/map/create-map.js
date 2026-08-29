import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wgs84ToGcj02, gcj02ToWgs84 } from './china-coordinates.js';
import { spotPreview } from '../components/spot-preview.js';

const GUIYANG_CENTER = [26.578, 106.713];

function markerIcon(item) {
  return L.divIcon({
    className: `sound-marker ${item.markerClass || ''}`.trim(),
    html: `<span class="sound-marker__wave" style="--spot:${item.color}"></span>`
      + `<span class="sound-marker__pin" style="--spot:${item.color}">${item.icon}</span>`,
    iconSize: [48, 48], iconAnchor: [24, 24], tooltipAnchor: [0, -24],
  });
}

export function createMap({
  element, spots, onSelect, onPreview, onPreviewEnd,
  center = GUIYANG_CENTER, zoom = 12, fit = false, color, extraMarkers = [],
}) {
  let useAmap = true;
  const coordinates = (item) => (useAmap ? wgs84ToGcj02(item.lat, item.lng) : [item.lat, item.lng]);

  const map = L.map(element, { zoomControl: false })
    .setView(useAmap ? wgs84ToGcj02(center[0], center[1]) : center, zoom);
  L.control.zoom({ position: 'topright' }).addTo(map);

  const amap = L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    { subdomains: '1234', maxZoom: 18, attribution: '© 高德地图', keepBuffer: 4, crossOrigin: true },
  );
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap', crossOrigin: true,
  });
  amap.addTo(map);
  L.control.layers({ '高德地图': amap, 'OpenStreetMap': osm }, null, { position: 'topright' }).addTo(map);

  const placed = [];
  const markerById = new Map();

  const place = (item, options) => {
    const marker = L.marker(coordinates(item), {
      title: item.name,
      alt: options.alt(item),
      keyboard: true,
      icon: markerIcon(item),
    }).addTo(map);
    marker.bindTooltip(spotPreview(item, item.previewEyebrow || options.eyebrow), {
      className: 'spot-tooltip', direction: 'top', offset: [0, -12], opacity: 1,
    });
    placed.push([item, marker]);
    return marker;
  };

  spots.forEach((spot) => {
    const marker = place({ ...spot, color: spot.color || color }, {
      alt: (item) => `打开${item.name}`,
      eyebrow: '正在聆听',
    });
    marker.on('click', () => onSelect(spot));
    marker.on('tooltipopen', () => onPreview?.(spot));
    marker.on('tooltipclose', () => onPreviewEnd?.(spot));
    markerById.set(spot.id, marker);
  });

  extraMarkers.forEach((item) => {
    const marker = place(item, {
      alt: (entry) => `打开${entry.name}`,
      eyebrow: item.eyebrow || '专题',
    });
    marker.on('click', () => item.onClick?.(item));
    markerById.set(item.id, marker);
  });

  if (fit && spots.length) {
    map.fitBounds(L.latLngBounds(spots.map(coordinates)), { padding: [110, 110], maxZoom: 17 });
  }

  const applyBase = (amapOn) => {
    if (useAmap === amapOn) return;
    const { lat, lng } = map.getCenter();
    const z = map.getZoom();
    useAmap = amapOn;
    map.setView(amapOn ? wgs84ToGcj02(lat, lng) : gcj02ToWgs84(lat, lng), z, { animate: false });
    placed.forEach(([item, marker]) => marker.setLatLng(coordinates(item)));
  };

  map.on('baselayerchange', (event) => applyBase(event.name === '高德地图'));
  let amapFails = 0;
  amap.on('tileerror', () => {
    if (!useAmap || ++amapFails < 4) return;
    map.removeLayer(amap);
    osm.addTo(map);
    applyBase(false);
  });

  return {
    focus(spot, { minZoom = 14 } = {}) {
      const marker = markerById.get(spot.id);
      if (!marker) return;
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), minZoom), { duration: .8 });
      marker.getElement()?.classList.add('is-highlighted');
      marker.openTooltip();
      onPreview?.(spot);
    },
    close(spot) {
      const marker = markerById.get(spot.id);
      if (!marker) return;
      marker.getElement()?.classList.remove('is-highlighted');
      marker.closeTooltip();
      onPreviewEnd?.(spot);
    },
    destroy() {
      map.remove();
    },
  };
}
