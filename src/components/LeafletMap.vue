<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import myPlacesData from '../data/myPlaces.json'

const mapContainer = ref(null)
let map = null
let markers = []
let labelLayer = null
let routeLayer = null

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function createCustomIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

function initMap() {
  map = L.map(mapContainer.value, {
    center: [38.9, 116.0],
    zoom: 8,
    zoomControl: true
  })

  const tk = 'c924ddf03dcffcbf9012873da52bea00'

  L.tileLayer(`https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`, {
    maxZoom: 18,
    attribution: '© 天地图'
  }).addTo(map)

  L.tileLayer(`https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`, {
    maxZoom: 18,
    attribution: '© 天地图标注'
  }).addTo(map)

  addMarkers()
  addLabels()
  addRouteLine()
  fitToAllPlaces()
}

function addMarkers() {
  const features = myPlacesData.features
  
  features.forEach(feature => {
    const { id, name, category, categoryName, icon, color, description, date, highlights } = feature.properties
    const [lng, lat] = feature.geometry.coordinates
    
    const marker = L.marker([lat, lng], {
      icon: createCustomIcon(color)
    })
    
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
          ${icon} ${name}
        </h3>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>分类：</strong>${categoryName}
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>时间：</strong>${date}
        </p>
        <p style="margin: 8px 0; font-size: 13px; color: #444; line-height: 1.5;">
          ${description}
        </p>
        ${highlights && highlights.length > 0 ? `
          <div style="margin-top: 8px;">
            <strong style="font-size: 12px; color: #666;">亮点：</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
              ${highlights.map(h => `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${h}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
    
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    })
    
    marker.on('mouseover', () => marker.openPopup())
    
    markers.push(marker)
  })
  
  const markerLayer = L.layerGroup(markers)
  markerLayer.addTo(map)
}

function addLabels() {
  labelLayer = L.layerGroup()
  
  myPlacesData.features.forEach(feature => {
    const { name } = feature.properties
    const [lng, lat] = feature.geometry.coordinates
    
    const label = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'marker-label',
        html: `<div style="
          background: rgba(255,255,255,0.9);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">${name}</div>`,
        iconAnchor: [40, 0]
      })
    })
    
    labelLayer.addLayer(label)
  })
  
  labelLayer.addTo(map)
}

function addRouteLine() {
  const sortedFeatures = [...myPlacesData.features].sort((a, b) => {
    return new Date(a.properties.date) - new Date(b.properties.date)
  })

  const routePoints = sortedFeatures.map(feature => {
    const [lng, lat] = feature.geometry.coordinates
    return [lat, lng]
  })

  routeLayer = L.polyline(routePoints, {
    color: '#667eea',
    weight: 3,
    opacity: 0.7,
    dashArray: '10, 5',
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map)
}

function fitToAllPlaces() {
  if (!map || !myPlacesData.features.length) return

  const bounds = L.latLngBounds()
  
  myPlacesData.features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates
    bounds.extend([lat, lng])
  })
  
  map.fitBounds(bounds, {
    padding: [50, 50],
    animate: true,
    duration: 1
  })
}

function focusOnPlace(place) {
  const feature = myPlacesData.features.find(f => f.properties.id === place.id)
  if (feature && map) {
    const [lng, lat] = feature.geometry.coordinates
    map.flyTo([lat, lng], 12, { duration: 1 })
    
    const markerIndex = myPlacesData.features.findIndex(f => f.properties.id === place.id)
    if (markers[markerIndex]) {
      markers[markerIndex].openPopup()
    }
  }
}

function toggleLabels(visible) {
  if (labelLayer) {
    if (visible) {
      labelLayer.addTo(map)
    } else {
      map.removeLayer(labelLayer)
    }
  }
}

function toggleRoute(visible) {
  if (routeLayer) {
    if (visible) {
      routeLayer.addTo(map)
    } else {
      map.removeLayer(routeLayer)
    }
  }
}

defineExpose({
  focusOnPlace,
  toggleLabels,
  toggleRoute
})
</script>

<style>
.leaflet-map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 10px;
}

.custom-popup .leaflet-popup-content {
  margin: 15px;
}

.marker-label {
  pointer-events: none;
}
</style>
