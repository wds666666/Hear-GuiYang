import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { asset } from '../assets.js';
import { spotPreview } from '../components/spot-preview.js';

// 像素原点：图片左上角，x 向右、y 向下。显示图已缩小，坐标仍按原图像素。
export const ILLUSTRATED_MAP = {
  src: '/assets/images/maps/guizhou-illustrated.jpg',
  width: 5607,
  height: 7797,
};

function markerIcon(item) {
  return L.divIcon({
    className: `sound-marker ${item.markerClass || ''}`.trim(),
    html: `<span class="sound-marker__wave" style="--spot:${item.color}"></span>`
      + `<span class="sound-marker__pin" style="--spot:${item.color}">${item.icon}</span>`,
    iconSize: [48, 48], iconAnchor: [24, 24], tooltipAnchor: [0, -24],
  });
}

function pixelToLatLng({ x, y }) {
  return [ILLUSTRATED_MAP.height - y, x];
}

export function createImageMap(element, {
  spots = [], onSelect, onPreview, onPreviewEnd, onPick, pick = false,
} = {}) {
  const { width: w, height: h, src } = ILLUSTRATED_MAP;
  const bounds = L.latLngBounds([0, 0], [h, w]);
  let pickOn = pick;

  const map = L.map(element, {
    crs: L.CRS.Simple,
    minZoom: -4,
    maxZoom: 1,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    attributionControl: false,
    zoomControl: false,
    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false,
  });
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.imageOverlay(asset(src), bounds, { interactive: false, className: 'illustrated-layer' }).addTo(map);
  map.fitBounds(bounds, { padding: [12, 12] });
  map.setMaxBounds(bounds.pad(0.35));

  const pin = L.circleMarker([0, 0], {
    radius: 7, weight: 2, color: '#1f7770', fillColor: '#65c9b8', fillOpacity: 0.45, interactive: false,
  });

  const isPickEvent = (event) => pickOn || event.originalEvent?.ctrlKey || event.originalEvent?.metaKey;

  const copyAt = (latlng) => {
    const x = Math.round(latlng.lng);
    const y = Math.round(h - latlng.lat);
    if (x < 0 || y < 0 || x > w || y > h) return;
    pin.setLatLng(latlng);
    if (!map.hasLayer(pin)) pin.addTo(map);
    const text = `{ x: ${x}, y: ${y} }`;
    navigator.clipboard?.writeText(text).catch(() => {});
    onPick?.({ x, y, text });
  };

  map.on('click', (event) => {
    if (!isPickEvent(event)) return;
    copyAt(event.latlng);
  });

  const markerById = new Map();
  spots.forEach((spot) => {
    if (!spot.pixel) return;
    const marker = L.marker(pixelToLatLng(spot.pixel), {
      title: spot.name,
      alt: `打开${spot.name}`,
      keyboard: true,
      icon: markerIcon(spot),
    }).addTo(map);
    marker.bindTooltip(spotPreview(spot, spot.previewEyebrow || '正在聆听'), {
      className: 'spot-tooltip', direction: 'top', offset: [0, -12], opacity: 1,
    });
    marker.on('click', (event) => {
      if (isPickEvent(event)) {
        L.DomEvent.stop(event);
        copyAt(event.latlng);
        return;
      }
      onSelect?.(spot);
    });
    marker.on('tooltipopen', () => onPreview?.(spot));
    marker.on('tooltipclose', () => onPreviewEnd?.(spot));
    markerById.set(spot.id, marker);
  });

  const applyPick = () => element.classList.toggle('is-picking', pickOn);
  applyPick();

  return {
    setPick(on) {
      pickOn = on;
      applyPick();
    },
    focus(spot) {
      const marker = markerById.get(spot.id);
      if (!marker) return;
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), -1), { duration: .5 });
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
