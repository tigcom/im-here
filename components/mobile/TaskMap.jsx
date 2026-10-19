'use client';

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatVnd } from '@/lib/format';

/**
 * Bản đồ các tin đăng gần người nhận việc.
 * Tối ưu hoá hiệu năng với Leaflet icon caching & debounced resize.
 */

// Cached icons để tránh khởi tạo L.divIcon trên mỗi render cycle
let cachedPinSelected = null;
let cachedPinNormal = null;
let cachedUserIcon = null;

const getPinIcon = (isSelected) => {
  if (isSelected) {
    if (!cachedPinSelected) {
      cachedPinSelected = L.divIcon({
        className: 'custom-listing-icon',
        html: `
          <div class="flex items-center justify-center h-8 w-8 rounded-full border-2 border-paper-000 transition-transform bg-accent scale-125 z-50 ring-4 ring-accent/30">
            <div class="h-2 w-2 rounded-full bg-paper-000"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });
    }
    return cachedPinSelected;
  }

  if (!cachedPinNormal) {
    cachedPinNormal = L.divIcon({
      className: 'custom-listing-icon',
      html: `
        <div class="flex items-center justify-center h-8 w-8 rounded-full border-2 border-paper-000 transition-transform bg-surface-900 scale-100 opacity-90">
          <div class="h-2 w-2 rounded-full bg-paper-000"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  }
  return cachedPinNormal;
};

// Vị trí hiện tại của người nhận việc — có vòng lan toả để dễ thấy.
const getUserLocationIcon = () => {
  if (!cachedUserIcon) {
    cachedUserIcon = L.divIcon({
      className: '!bg-transparent !border-0 custom-user-location-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 pointer-events-auto cursor-pointer">
          <span class="absolute inline-flex w-10 h-10 animate-ping rounded-full bg-accent opacity-75"></span>
          <span class="absolute inline-flex w-7 h-7 rounded-full bg-accent/30"></span>
          <div class="relative flex h-5 w-5 items-center justify-center rounded-full bg-accent border-2 border-paper-000 shadow-[0_4px_12px_-2px_oklch(0_0_0/0.3)]">
            <div class="h-1.5 w-1.5 rounded-full bg-paper-000"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });
  }
  return cachedUserIcon;
};

function MapController({ userLocation, flyToUserTrigger, selectedListing }) {
  const map = useMap();
  const lastTaskIdRef = useRef(null);

  useEffect(() => {
    // Container đổi kích thước (ví dụ khi kéo bottom sheet) → debounce để tránh đơ giao diện
    let resizeTimer = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 120);
    });
    observer.observe(map.getContainer());
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [map]);

  // Bấm nút "về vị trí của tôi" → bay tới đúng toạ độ người dùng.
  useEffect(() => {
    if (flyToUserTrigger > 0 && userLocation) {
      map.invalidateSize();
      map.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 0.8 });
    }
  }, [flyToUserTrigger, userLocation, map]);

  // Chọn một tin khác (từ danh sách hoặc từ bản đồ) → bay tới tin đó.
  useEffect(() => {
    const loc = selectedListing?.location;
    if (loc?.lat && loc?.lng) {
      if (selectedListing.id !== lastTaskIdRef.current) {
        lastTaskIdRef.current = selectedListing.id;
        map.invalidateSize();
        map.flyTo([loc.lat, loc.lng], 15, { animate: true, duration: 0.8 });
      }
    } else {
      lastTaskIdRef.current = null;
    }
  }, [selectedListing, map]);

  return null;
}

function TaskMap({
  listings = [],
  selectedListingId,
  onSelectListing,
  userLocation,
  flyToUserTrigger = 0,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full bg-surface-900 animate-pulse flex items-center justify-center text-on-surface-500 text-sm font-semibold">
        Đang tải bản đồ...
      </div>
    );
  }

  const pinned = listings.filter((l) => l.location?.lat && l.location?.lng);
  const selectedListing = pinned.find((l) => l.id === selectedListingId) || null;

  const initialCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : selectedListing
      ? [selectedListing.location.lat, selectedListing.location.lng]
      : [10.7756, 106.7004];

  return (
    <MapContainer
      center={initialCenter}
      zoom={15}
      zoomControl={false}
      style={{ height: '100%', width: '100%', zIndex: 10 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Vị trí hiện tại của người nhận việc */}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocation.accuracy || 60}
            pathOptions={{
              color: 'var(--color-accent, #00C853)',
              fillColor: 'var(--color-accent, #00C853)',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={getUserLocationIcon()}
            zIndexOffset={1000}
          />
        </>
      )}

      {/* Các tin đăng đang mở */}
      {pinned.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.location.lat, listing.location.lng]}
          icon={getPinIcon(selectedListingId === listing.id)}
          eventHandlers={{ click: () => onSelectListing?.(listing) }}
        >
          <Popup className="custom-map-popup">
            <div className="p-1 text-left font-sans max-w-[200px]">
              <span className="font-mono text-[9px] font-bold text-accent uppercase">
                {listing.category?.name}
              </span>
              <h4 className="font-bold text-xs text-ink-900 line-clamp-1 mt-0.5">{listing.title}</h4>
              <p className="text-[11px] text-accent font-bold mt-1">+{formatVnd(listing.reward)}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      <MapController
        userLocation={userLocation}
        flyToUserTrigger={flyToUserTrigger}
        selectedListing={selectedListing}
      />
    </MapContainer>
  );
}

export default memo(TaskMap);
