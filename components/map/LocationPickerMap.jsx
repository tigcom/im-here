'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Loader2, MapPin } from 'lucide-react';

// Icon ghim vị trí chọn việc
const createPickerIcon = () => {
  return L.divIcon({
    className: '!bg-transparent !border-0',
    html: `
      <div class="relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing -translate-x-1/2 -translate-y-full">
        <div class="w-9 h-9 rounded-2xl bg-accent border-2 border-paper-000 shadow-[0_10px_25px_-4px_oklch(0_0_0/0.4)] flex items-center justify-center text-paper-000 transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="w-2.5 h-2.5 bg-accent rotate-45 -mt-1.5 border-r-2 border-b-2 border-paper-000"></div>
        <div class="w-3 h-1.5 bg-ink-900/30 rounded-full blur-[1px] mt-0.5"></div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

// Điều khiển camera di chuyển khi tọa độ thay đổi
function MapFlyController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, map.getZoom() < 15 ? 16 : map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center, map]);
  return null;
}

// Bắt sự kiện click vào bản đồ để dời ghim
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    },
  });
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  isReverseGeocoding = false,
}) {
  const [pinIcon, setPinIcon] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setPinIcon(createPickerIcon());
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        }
      },
    }),
    [onLocationChange]
  );

  const currentCenter = [latitude || 21.0285, longitude || 105.8542];

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-rule-subtle bg-paper-200 shadow-inner">
      <MapContainer
        center={currentCenter}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {pinIcon && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={currentCenter}
            ref={markerRef}
            icon={pinIcon}
          />
        )}

        {/* Vòng tròn bán kính check-in GPS 100m */}
        <Circle
          center={currentCenter}
          radius={100}
          pathOptions={{
            color: 'var(--accent)',
            fillColor: 'var(--accent)',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 6',
          }}
        />

        <MapFlyController center={currentCenter} />
        <MapClickHandler onLocationSelect={onLocationChange} />
      </MapContainer>

      {/* Badge hướng dẫn & trạng thái */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
        <span className="bg-paper-000/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rule-subtle text-[11px] font-semibold text-ink-900 elevation-rich flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span>Bấm hoặc kéo ghim để chọn vị trí trên bản đồ</span>
        </span>

        {isReverseGeocoding && (
          <span className="bg-accent text-paper-000 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 elevation-rich animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Đang lấy địa chỉ...</span>
          </span>
        )}
      </div>

      {/* Thông tin bán kính góc dưới */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <span className="bg-ink-900/80 backdrop-blur-md text-paper-000 px-2.5 py-1 rounded-lg text-[10px] font-mono">
          Vòng tròn nét đứt: Bán kính GPS 100m
        </span>
      </div>
    </div>
  );
}
