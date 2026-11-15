'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationRecord } from '@/types';
import { Compass, Info, AlertTriangle } from 'lucide-react';

interface AsuHeatMapProps {
  locations: LocationRecord[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const DEFAULT_CENTER = { lat: 33.4187, lng: -111.9335 }; // ASU Tempe Campus
const DEFAULT_ZOOM = 16;

const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6b21a8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#ede9fe' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0e7ff' }] },
];

const ASU_HEATMAP_GRADIENT = [
  'rgba(0, 0, 0, 0)',
  'rgba(255, 198, 39, 0.35)', // Sun Devil Gold
  'rgba(245, 158, 11, 0.65)', // Amber
  'rgba(147, 51, 234, 0.80)', // Purple
  'rgba(140, 29, 64, 0.95)',  // ASU Maroon
  'rgba(140, 29, 64, 1.0)',
];

export const AsuHeatMap: React.FC<AsuHeatMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const googleMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const googleInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Map<string, any>>(new Map());
  const leafletHeatCirclesRef = useRef<any[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasValidKey = Boolean(apiKey && !apiKey.includes('your_google_maps_api_key'));

  // Attempt Google Maps by default if an API key is configured
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>(
    hasValidKey ? 'google' : 'leaflet'
  );
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Clean all previous map instances before switching engines
  const cleanupCurrentMaps = useCallback(() => {
    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch (e) {}
      leafletMapRef.current = null;
    }
    leafletMarkersRef.current.clear();
    leafletHeatCirclesRef.current = [];

    googleMarkersRef.current.forEach((marker) => {
      try {
        marker.setMap(null);
      } catch (e) {}
    });
    googleMarkersRef.current.clear();

    if (googleInfoWindowRef.current) {
      googleInfoWindowRef.current.close();
    }
    if (heatmapLayerRef.current) {
      try {
        (heatmapLayerRef.current as any).setMap(null);
      } catch (e) {}
      heatmapLayerRef.current = null;
    }
    googleMapInstanceRef.current = null;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  // Detect Google Maps Authentication Failure (e.g. Missing Billing on Google Cloud)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        console.warn('Google Maps auth error: Project requires Billing or API not enabled.');
        setGoogleAuthError(
          'Google Maps API rejected key (Billing not linked to Google Cloud project). Switched to CartoDB Voyager.'
        );
        cleanupCurrentMaps();
        setMapEngine('leaflet');
      };
    }
  }, [cleanupCurrentMaps]);

  // 1. Initialize Google Maps
  useEffect(() => {
    if (mapEngine !== 'google') return;

    if (!apiKey || apiKey.includes('your_google_maps_api_key')) {
      setGoogleAuthError('No Google Maps API Key found in .env.local. Using CartoDB Voyager.');
      setMapEngine('leaflet');
      return;
    }

    if (googleMapInstanceRef.current) return;

    cleanupCurrentMaps();

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['visualization'],
      });

      loader
        .load()
        .then((google) => {
          if (!containerRef.current) return;

          const map = new google.maps.Map(containerRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            styles: LIGHT_MAP_STYLE,
            disableDefaultUI: true,
          });

          googleMapInstanceRef.current = map;

          if (google.maps && google.maps.visualization && google.maps.visualization.HeatmapLayer) {
            const heatmapData = locations.map((loc) => ({
              location: new google.maps.LatLng(loc.lat, loc.lng),
              weight: loc.heatWeight || loc.occupancyPercentage,
            }));

            const heatmap = new (google.maps.visualization.HeatmapLayer as any)({
              data: heatmapData,
              map: map,
              radius: 42,
              opacity: 0.85,
              gradient: ASU_HEATMAP_GRADIENT,
            });

            heatmapLayerRef.current = heatmap;
          }
        })
        .catch((err) => {
          console.warn('Google Maps loader catch:', err);
          setGoogleAuthError('Google Maps failed to load. Reverting to CartoDB Voyager.');
          cleanupCurrentMaps();
          setMapEngine('leaflet');
        });
    } catch {
      cleanupCurrentMaps();
      setMapEngine('leaflet');
    }
  }, [mapEngine, apiKey, cleanupCurrentMaps]);

  // Update Google Maps Overlays (Heatmap Data + Clickable Markers)
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapInstanceRef.current) return;
    const map = googleMapInstanceRef.current;
    const google = (window as any).google;
    if (!google) return;

    // 1. Update Heatmap Layer Data
    if (heatmapLayerRef.current) {
      const heatmapData = locations.map((loc) => ({
        location: new google.maps.LatLng(loc.lat, loc.lng),
        weight: loc.heatWeight || loc.occupancyPercentage,
      }));
      (heatmapLayerRef.current as any).setData(heatmapData);
    }

    // 2. Update/Create Google Markers
    locations.forEach((loc) => {
      const isSelected = loc.id === selectedLocationId;
      const occ = loc.occupancyPercentage;
      const markerColor = occ >= 80 ? '#8C1D40' : occ >= 50 ? '#6B21A8' : '#FFC627';

      let marker = googleMarkersRef.current.get(loc.id);

      if (!marker) {
        const newMarker = new google.maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          map: map,
          title: loc.name,
        });

        newMarker.addListener('click', () => {
          onSelectLocation(loc.id);

          const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${loc.name}, ${loc.address}`
          )}`;

          const popupContent = `
            <div style="color: #0F172A; padding: 4px; font-family: system-ui, -apple-system, sans-serif; min-width: 210px;">
              <div style="font-weight: 700; font-size: 14px; color: #8C1D40; margin-bottom: 2px;">${loc.name}</div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">${loc.category} • ${loc.address}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <span style="color: #475569; font-weight: 600;">Live Crowd:</span>
                <strong style="color: #8C1D40; font-size: 13px;">${loc.occupancyPercentage}% (${loc.crowdLevel})</strong>
              </div>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #8C1D40; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 7px 10px; border-radius: 8px; text-decoration: none;">
                Get Directions ↗
              </a>
            </div>
          `;

          const infoWindow = googleInfoWindowRef.current || new google.maps.InfoWindow();
          googleInfoWindowRef.current = infoWindow;
          infoWindow.setContent(popupContent);
          infoWindow.open(map, newMarker);
        });

        googleMarkersRef.current.set(loc.id, newMarker);
        marker = newMarker;
      }

      if (marker) {
        // Styled Google Maps Pin Symbol
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 9,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: isSelected ? '#FFC627' : '#FFFFFF',
          strokeWeight: isSelected ? 3.5 : 2,
        });

        marker.setLabel({
          text: `${loc.occupancyPercentage}%`,
          color: '#0F172A',
          fontSize: '10px',
          fontWeight: 'bold',
          className: 'google-map-marker-label',
        });
      }
    });
  }, [locations, selectedLocationId, mapEngine, onSelectLocation]);

  // 2. Initialize Leaflet Map with CartoDB Voyager Light Tiles
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !containerRef.current || leafletMapRef.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = (window as any).L;
      if (!L || !containerRef.current || leafletMapRef.current) return;

      try {
        const map = L.map(containerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        leafletMapRef.current = map;
        renderLeafletOverlays(locations, selectedLocationId);
      } catch (e) {
        console.warn('Leaflet map creation catch:', e);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
    };
  }, [mapEngine, locations, selectedLocationId]);

  // 3. Render Leaflet Heatmap Circles & Pin Markers
  const renderLeafletOverlays = useCallback(
    (locs: LocationRecord[], selectedId: string | null) => {
      const L = (window as any).L;
      if (!L || !leafletMapRef.current || !leafletMapRef.current._container) return;

      const map = leafletMapRef.current;

      try {
        leafletHeatCirclesRef.current.forEach((circle) => {
          try {
            circle.remove();
          } catch (e) {}
        });
        leafletHeatCirclesRef.current = [];

        leafletMarkersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {}
        });
        leafletMarkersRef.current.clear();

        locs.forEach((loc) => {
          const isSelected = loc.id === selectedId;
          const occ = loc.occupancyPercentage;
          const circleColor = occ >= 80 ? '#8C1D40' : occ >= 50 ? '#6B21A8' : '#FFC627';
          const circleRadius = 70 + (occ / 100) * 80;

          try {
            const heatCircle = L.circle([loc.lat, loc.lng], {
              color: circleColor,
              fillColor: circleColor,
              fillOpacity: 0.28 + (occ / 100) * 0.25,
              radius: circleRadius,
              stroke: false,
            }).addTo(map);

            leafletHeatCirclesRef.current.push(heatCircle);
          } catch (e) {
            console.warn('Leaflet circle draw notice:', e);
          }

          // Custom White/Purple/Maroon + Sun Devil Yellow Texture Marker Badge
          const iconHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
              ${
                isSelected
                  ? '<div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(255, 198, 39, 0.45); animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>'
                  : ''
              }
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 9999px;
                background: ${isSelected ? '#8C1D40' : '#FFFFFF'};
                color: ${isSelected ? '#FFFFFF' : '#0F172A'};
                border: 1.5px solid ${isSelected ? '#FFC627' : '#E2E8F0'};
                box-shadow: ${isSelected ? '0 4px 12px rgba(140, 29, 64, 0.25)' : '0 2px 6px rgba(15, 23, 42, 0.08)'};
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
                cursor: pointer;
              ">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: ${circleColor};"></span>
                <span>${loc.shortName}</span>
                <span style="
                  background: ${isSelected ? '#FFC627' : '#F1F5F9'};
                  color: ${isSelected ? '#5C132A' : '#334155'};
                  padding: 1px 6px;
                  border-radius: 6px;
                  font-family: monospace;
                  font-weight: 700;
                  font-size: 10px;
                  border: 1px solid ${isSelected ? '#FDE047' : '#E2E8F0'};
                ">${occ}%</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${loc.name}, ${loc.address}`
          )}`;

          const popupHtml = `
            <div style="color: #0F172A; background: #FFFFFF; padding: 4px; font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
              <div style="font-weight: 700; font-size: 14px; color: #8C1D40; margin-bottom: 2px;">${loc.name}</div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">${loc.category} • ${loc.address}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <span style="color: #475569; font-weight: 600;">Crowd Traffic:</span>
                <strong style="color: #8C1D40; font-size: 13px;">${loc.occupancyPercentage}% (${loc.crowdLevel})</strong>
              </div>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #8C1D40; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 7px 10px; border-radius: 8px; text-decoration: none;">
                Get Directions ↗
              </a>
            </div>
          `;

          try {
            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
              .bindPopup(popupHtml)
              .addTo(map);

            marker.on('click', () => {
              onSelectLocation(loc.id);
            });

            leafletMarkersRef.current.set(loc.id, marker);
          } catch (e) {
            console.warn('Leaflet marker draw notice:', e);
          }
        });
      } catch (err) {
        console.warn('Leaflet overlay render catch:', err);
      }
    },
    [onSelectLocation]
  );

  useEffect(() => {
    if (mapEngine === 'leaflet') {
      renderLeafletOverlays(locations, selectedLocationId);
    }
  }, [locations, selectedLocationId, mapEngine, renderLeafletOverlays]);

  const handleRecenter = () => {
    onSelectLocation(null);
    if (mapEngine === 'google' && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo(DEFAULT_CENTER);
      googleMapInstanceRef.current.setZoom(DEFAULT_ZOOM);
    } else if (mapEngine === 'leaflet' && leafletMapRef.current) {
      try {
        leafletMapRef.current.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);
      } catch (e) {}
    }
  };

  const handleEngineSwitch = (engine: 'leaflet' | 'google') => {
    if (engine === mapEngine) return;
    setGoogleAuthError(null);
    cleanupCurrentMaps();
    setMapEngine(engine);
  };

  return (
    <div className="relative z-0 flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-2xl border border-slate-300/90 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900 isolate">
      {/* Top Map Toolbar Overlay — keep below sticky site header (z-500) */}
      <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 z-20 flex flex-wrap items-center justify-between gap-2">
        {/* Status Pill with Clean Minimalist Styling */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asu-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-asu-gold" />
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Tempe Campus Map
          </span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-[11px] text-slate-500 font-mono font-medium">33.4187° N, 111.9335° W</span>
        </div>

        {/* Map Engine Toggle & Recenter Controls */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Map Engine Selector */}
          <div className="bg-white/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80 shadow-xs flex items-center space-x-1 text-[11px] font-semibold">
            <button
              onClick={() => handleEngineSwitch('google')}
              className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1.5 ${
                mapEngine === 'google'
                  ? 'bg-asu-maroon text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps JavaScript API Layer (HeatmapLayer + Venue Markers)"
            >
              <span>Google Maps</span>
              {mapEngine === 'google' && <span className="w-1.5 h-1.5 rounded-full bg-asu-gold" />}
            </button>
            <button
              onClick={() => handleEngineSwitch('leaflet')}
              className={`px-3 py-1 rounded-full transition-all flex items-center space-x-1.5 ${
                mapEngine === 'leaflet'
                  ? 'bg-asu-maroon text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="CartoDB Voyager Light Map (Free, Zero API Key required)"
            >
              <span>CartoDB</span>
              {mapEngine === 'leaflet' && <span className="w-1.5 h-1.5 rounded-full bg-asu-gold" />}
            </button>
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="bg-white/90 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs text-xs font-semibold transition-all flex items-center space-x-1.5"
            title="Recenter ASU Campus"
          >
            <Compass className="w-3.5 h-3.5 text-asu-maroon" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Google Auth Notice Banner (if Billing isn't enabled) */}
      {googleAuthError && (
        <div className="pointer-events-auto absolute left-3.5 right-3.5 top-16 z-20 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/95 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{googleAuthError}</span>
          </div>
          <button
            onClick={() => setGoogleAuthError(null)}
            className="text-amber-800 font-bold hover:underline ml-2 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[480px] z-10 flex-1" />

      {/* Bottom Info Status Bar */}
      <div className="pointer-events-auto absolute bottom-3.5 left-3.5 right-3.5 z-20">
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2 shadow-xs backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/90">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {mapEngine === 'google'
                ? 'Google Maps JavaScript API Layer Active'
                : 'CartoDB Light Campus Heatmap Active'}
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-3 text-[11px] font-medium text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Low (&lt;40%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Mod (40-60%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>High (60-80%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-asu-maroon" />
              <span>Peak (&gt;80%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
