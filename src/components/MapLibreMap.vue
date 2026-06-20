<template>
  <div ref="mapContainer" class="maplibre-map"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import myPlacesData from '../data/myPlaces.json'

const mapContainer = ref(null)
let map = null
let popup = null

const MAPLIBRE_GLYPHS = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'

const TIANDITU_TK = 'c924ddf03dcffcbf9012873da52bea00'

const brightStyle = {
  version: 8,
  name: '天地图',
  glyphs: MAPLIBRE_GLYPHS,
  sources: {
    'tianditu': {
      type: 'raster',
      tiles: [
        `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_TK}`
      ],
      tileSize: 256,
      attribution: '© 天地图',
      maxzoom: 18
    }
  },
  layers: [
    {
      id: 'tianditu-layer',
      type: 'raster',
      source: 'tianditu',
      minzoom: 0,
      maxzoom: 18
    }
  ]
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
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: brightStyle,
    center: [116.0, 38.9],
    zoom: 8
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.on('load', () => {
    addDataLayers()
    addLabels()
    addRouteLine()
    // 延迟执行确保地图和底图完全加载
    setTimeout(() => {
      fitToAllPlaces()
    }, 800)
  })

  map.on('error', (e) => {
    console.error('[MapLibre] 地图错误:', e)
  })

  popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    className: 'custom-popup'
  })
}

function addDataLayers() {
  map.addSource('places-data', {
    type: 'geojson',
    data: myPlacesData,
    generateId: true
  })

  map.addLayer({
    id: 'places-marker',
    type: 'circle',
    source: 'places-data',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        14,
        10
      ],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        4,
        3
      ],
      'circle-stroke-color': '#ffffff',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.95
      ]
    }
  })

  map.addLayer({
    id: 'places-marker-glow',
    type: 'circle',
    source: 'places-data',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        20,
        15
      ],
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.4,
        0.2
      ],
      'circle-blur': 1
    }
  })

  // 鼠标悬停显示弹窗
  map.on('mouseenter', 'places-marker', (e) => {
    const feature = e.features[0]
    const coordinates = feature.geometry.coordinates.slice()
    const { name, icon, categoryName, date, description, highlights } = feature.properties

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

    map.getCanvas().style.cursor = 'pointer'
    popup.setLngLat(coordinates).setHTML(popupContent).addTo(map)
  })

  // 鼠标离开关闭弹窗
  map.on('mouseleave', 'places-marker', () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })

  let hoveredFeatureId = null

  map.on('mousemove', 'places-marker', (e) => {
    if (e.features.length > 0) {
      const featureId = e.features[0].id

      if (hoveredFeatureId !== null && hoveredFeatureId !== featureId) {
        map.setFeatureState(
          { source: 'places-data', id: hoveredFeatureId },
          { hover: false }
        )
      }

      hoveredFeatureId = featureId
      map.setFeatureState(
        { source: 'places-data', id: hoveredFeatureId },
        { hover: true }
      )

      map.getCanvas().style.cursor = 'pointer'
    }
  })

  map.on('mouseleave', 'places-marker', () => {
    if (hoveredFeatureId !== null) {
      map.setFeatureState(
        { source: 'places-data', id: hoveredFeatureId },
        { hover: false }
      )
      hoveredFeatureId = null
    }
    map.getCanvas().style.cursor = ''
  })
}

function addLabels() {
  map.addLayer({
    id: 'places-label',
    type: 'symbol',
    source: 'places-data',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-font': ['Open Sans Bold'],
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
      'text-allow-overlap': false
    },
    paint: {
      'text-color': '#333333',
      'text-halo-color': '#ffffff',
      'text-halo-width': 2
    }
  })
}

function addRouteLine() {
  const sortedFeatures = [...myPlacesData.features].sort((a, b) => {
    return new Date(a.properties.date) - new Date(b.properties.date)
  })

  const routeCoordinates = sortedFeatures.map(feature => {
    return feature.geometry.coordinates
  })

  const routeData = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates
    }
  }

  map.addSource('route-data', {
    type: 'geojson',
    data: routeData
  })

  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route-data',
    beforeId: 'places-marker',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#667eea',
      'line-width': 3,
      'line-opacity': 0.7,
      'line-dasharray': [10, 5]
    }
  })
}

function fitToAllPlaces() {
  if (!map || !myPlacesData.features.length) return

  let minLat = 90
  let maxLat = -90
  let minLng = 180
  let maxLng = -180

  myPlacesData.features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })

  const padding = 50
  
  map.fitBounds([
    [minLng, minLat],
    [maxLng, maxLat]
  ], {
    padding: padding,
    duration: 0
  })

  console.log('[MapLibre] 视野已调整到所有地点:', minLng.toFixed(2), '~', maxLng.toFixed(2))
}

function focusOnPlace(place) {
  const feature = myPlacesData.features.find(f => f.properties.id === place.id)
  if (feature && map) {
    const [lng, lat] = feature.geometry.coordinates
    map.flyTo([lng, lat], 12, { duration: 1 })
    
    const { name, icon, categoryName, date, description } = feature.properties
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
      </div>
    `
    popup.setLngLat([lng, lat]).setHTML(popupContent).addTo(map)
  }
}

function toggleLabels(visible) {
  if (map && map.getLayer('places-label')) {
    map.setLayoutProperty('places-label', 'visibility', visible ? 'visible' : 'none')
  }
}

function toggleRoute(visible) {
  if (map && map.getLayer('route-line')) {
    map.setLayoutProperty('route-line', 'visibility', visible ? 'visible' : 'none')
  }
}

defineExpose({
  focusOnPlace,
  toggleLabels,
  toggleRoute
})
</script>

<style>
.maplibre-map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.custom-popup .maplibregl-popup-content {
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
</style>
