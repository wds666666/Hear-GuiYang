import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wgs84ToGcj02 } from './china-coordinates.js';

function coordinates(spot, useAmap) {
  return useAmap ? wgs84ToGcj02(spot.lat, spot.lng) : [spot.lat, spot.lng];
}

function previewHtml(spot) {
  return `<article class="spot-preview">
    <img src="${spot.image}" alt="${spot.name}" />
    <div><span class="spot-preview__eyebrow">正在聆听</span><h2>${spot.name}</h2><p>${spot.description}</p></div>
  </article>`;
}

export function createMap({ element, spots, onSelect, onPreview, onPreviewEnd }) {
  let useAmap = true;
  const map = L.map(element, { zoomControl: false }).setView(wgs84ToGcj02(26.578, 106.713), 12);
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

  const markerById = new Map();
  const markers = spots.map((spot) => {
    const marker = L.marker(coordinates(spot, useAmap), {
      title: spot.name,
      alt: `打开${spot.name}`,
      keyboard: true,
      icon: L.divIcon({
        className: 'sound-marker',
        html: `<span class="sound-marker__wave" style="--spot:${spot.color}"></span><span class="sound-marker__pin" style="--spot:${spot.color}">${spot.icon}</span>`,
        iconSize: [48, 48], iconAnchor: [24, 24], tooltipAnchor: [0, -24],
      }),
    }).addTo(map);

    marker.bindTooltip(previewHtml(spot), {
      className: 'spot-tooltip', direction: 'top', offset: [0, -12], opacity: 1,
    });
    marker.on('click', () => onSelect(spot));
    marker.on('tooltipopen', () => onPreview(spot));
    marker.on('tooltipclose', () => onPreviewEnd(spot));
    markerById.set(spot.id, marker);
    return marker;
  });

  map.on('baselayerchange', (event) => {
    useAmap = event.name === '高德地图';
    spots.forEach((spot, index) => markers[index].setLatLng(coordinates(spot, useAmap)));
  });

  return {
    focus(spot) {
      const marker = markerById.get(spot.id);
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: .8 });
      marker.openTooltip();
      onPreview(spot);
    },
    close(spot) {
      markerById.get(spot.id)?.closeTooltip();
      onPreviewEnd(spot);
    },
    destroy() {
      map.remove();
    },
  };
}
