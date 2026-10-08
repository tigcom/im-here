'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tùy chỉnh icon đánh dấu (vì icon mặc định của leaflet thường bị lỗi đường dẫn trong Next.js)
const createCustomIcon = (isSelected) => {
  const bgColor = isSelected ? 'bg-accent' : 'bg-surface-900';
  const scale = isSelected ? 'scale-125 z-50' : 'scale-100 opacity-90';
  const html = `
    <div class="flex items-center justify-center h-8 w-8 rounded-full border-2 border-paper-000 shadow-md transition-transform ${bgColor} ${scale}">
      <div class="h-2 w-2 rounded-full bg-paper-000"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    // Tự động resize map khi container thay đổi kích thước để tránh lỗi mảng xám
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    map.flyTo(center, map.getZoom() < 14 ? 14 : map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  
  return null;
}

export default function TaskMap({ tasks, selectedTaskId, onSelectTask }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-surface-900 animate-pulse flex items-center justify-center text-on-surface-500 text-sm">Đang tải bản đồ...</div>;
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const center = selectedTask ? [selectedTask.lat, selectedTask.lng] : [10.7769, 106.7009];

  return (
    <MapContainer 
      center={center} 
      zoom={14} 
      zoomControl={false}
      style={{ height: '100%', width: '100%', zIndex: 10 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {tasks.map(task => (
        <Marker 
          key={task.id}
          position={[task.lat, task.lng]}
          icon={createCustomIcon(selectedTaskId === task.id)}
          eventHandlers={{
            click: () => onSelectTask(task)
          }}
        />
      ))}
      <MapController center={center} />
    </MapContainer>
  );
}
