'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Crosshair, 
  Loader2, 
  X, 
  AlertCircle,
  Map as MapIcon,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Dynamic import Leaflet Map để tránh lỗi window undefined trong SSR của Next.js
const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-2xl bg-paper-200 animate-pulse flex flex-col items-center justify-center gap-2 text-ink-500 border border-rule-subtle">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
      <span className="text-xs font-mono">Đang tải bản đồ tương tác...</span>
    </div>
  ),
});

export default function AddressMapSelector({
  address = '',
  latitude = 21.0285,
  longitude = 105.8542,
  onChange,
  required = true,
}) {
  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Đồng bộ prop address khi thay đổi từ ngoài
  useEffect(() => {
    setQuery(address);
  }, [address]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gọi API tìm kiếm địa chỉ Nominatim OpenStreetMap (Debounce 350ms)
  const fetchAddressSuggestions = useCallback(async (searchKeyword) => {
    const clean = searchKeyword.trim();
    if (clean.length < 3) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoadingSuggestions(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        clean
      )}&addressdetails=1&limit=6&countrycodes=vn&accept-language=vi`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept-Language': 'vi,en;q=0.9',
        },
      });

      if (!response.ok) throw new Error('Không thể tìm kiếm địa chỉ');
      const data = await response.json();

      setSuggestions(data || []);
      setIsDropdownOpen(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Lỗi tìm kiếm địa chỉ gợi ý:', err);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ address: val, latitude, longitude });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(val);
    }, 350);
  };

  // Chọn 1 địa chỉ gợi ý từ kết quả tìm kiếm
  const handleSelectSuggestion = (item) => {
    const lat = Number(parseFloat(item.lat).toFixed(6));
    const lng = Number(parseFloat(item.lon).toFixed(6));
    const displayName = item.display_name || item.name || query;

    setQuery(displayName);
    setSuggestions([]);
    setIsDropdownOpen(false);

    onChange({
      address: displayName,
      latitude: lat,
      longitude: lng,
    });
  };

  // Truy vấn ngược tên địa chỉ từ tọa độ (Reverse Geocoding)
  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'vi,en;q=0.9' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setQuery(data.display_name);
          onChange({
            address: data.display_name,
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } catch (err) {
      console.warn('Lỗi reverse geocode:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Xử lý khi click hoặc kéo Marker trên bản đồ
  const handleMapLocationChange = (newLat, newLng) => {
    onChange({
      address: query,
      latitude: newLat,
      longitude: newLng,
    });
    reverseGeocode(newLat, newLng);
  };

  // Lấy vị trí GPS hiện tại từ thiết bị
  const handleGetCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsFeedback({
        type: 'error',
        message: 'Thiết bị chưa hỗ trợ GPS. Vui lòng chọn trên bản đồ hoặc nhập địa chỉ.',
      });
      return;
    }

    setIsLocatingGps(true);
    setGpsFeedback({
      type: 'info',
      message: 'Đang xin quyền và dò tọa độ GPS thiết bị...',
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setIsLocatingGps(false);
        setGpsFeedback({
          type: 'success',
          message: `Đã định vị GPS thành công (±${acc}m).`,
        });
        setTimeout(() => setGpsFeedback(null), 4000);

        onChange({
          address: query,
          latitude: lat,
          longitude: lng,
        });
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocatingGps(false);
        let msg = 'Không thể lấy vị trí từ thiết bị.';
        if (err.code === 1) {
          msg = 'Vui lòng cấp quyền vị trí cho trình duyệt trong cài đặt.';
        }
        setGpsFeedback({
          type: 'error',
          message: msg,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Ô tìm kiếm / Nhập địa chỉ với gợi ý Dropdown */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-ink-700 flex items-center gap-1.5">
            <span>Địa chỉ thực hiện</span>
            {required && <span className="text-danger">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMap ? 'Thu gọn bản đồ' : 'Mở bản đồ chọn vị trí'}</span>
            {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="relative">
          <MapPin className="w-4 h-4 text-accent absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required={required}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Nhập tên đường, số nhà, địa danh để tìm kiếm trên bản đồ..."
            className="w-full pl-10 pr-20 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none transition-colors"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoadingSuggestions && (
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsDropdownOpen(false);
                  onChange({ address: '', latitude, longitude });
                }}
                className="p-1 rounded-md text-ink-400 hover:text-ink-700 transition-colors"
                title="Xóa địa chỉ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => fetchAddressSuggestions(query)}
              className="p-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-700 transition-colors"
              title="Tìm kiếm vị trí"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropdown danh sách gợi ý địa điểm */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-paper-000 rounded-2xl border border-rule-strong shadow-[0_16px_35px_-5px_oklch(0_0_0/0.18)] overflow-hidden max-h-64 overflow-y-auto animate-in fade-in duration-150">
            <div className="px-3 py-2 bg-paper-100 border-b border-rule-subtle text-[10px] font-mono text-ink-500 uppercase tracking-wider flex items-center justify-between">
              <span>Gợi ý địa điểm từ bản đồ OpenStreetMap</span>
              <span className="text-accent">{suggestions.length} kết quả</span>
            </div>
            {suggestions.map((item, idx) => (
              <div
                key={item.place_id || idx}
                onClick={() => handleSelectSuggestion(item)}
                className="px-3.5 py-2.5 hover:bg-paper-100 cursor-pointer border-b border-rule-subtle/50 last:border-0 transition-colors flex items-start gap-2.5 text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-accent-quiet text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-ink-900 truncate">
                    {item.name || item.display_name?.split(',')?.[0]}
                  </span>
                  <span className="block text-[11px] text-ink-500 line-clamp-1 leading-snug">
                    {item.display_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bản đồ tương tác trực quan */}
      {showMap && (
        <div className="space-y-2">
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleMapLocationChange}
            isReverseGeocoding={isReverseGeocoding}
          />

          {/* Thanh công cụ định vị & thông tin tọa độ */}
          <div className="p-3 bg-paper-100 rounded-xl border border-rule-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-500">Tọa độ đã chọn:</span>
              <span className="font-mono text-xs font-bold text-ink-900 bg-paper-000 px-2 py-0.5 rounded border border-rule-subtle">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocatingGps}
                className="px-3 py-1.5 rounded-lg bg-accent text-paper-000 hover:bg-accent-hover font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50 elevation-rich"
              >
                {isLocatingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{isLocatingGps ? 'Đang định vị...' : 'Về vị trí của tôi'}</span>
              </button>
            </div>
          </div>

          {gpsFeedback && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                gpsFeedback.type === 'success'
                  ? 'bg-accent/10 border border-accent/30 text-accent font-medium'
                  : gpsFeedback.type === 'error'
                  ? 'bg-danger/10 border border-danger/30 text-danger font-medium'
                  : 'bg-paper-200 text-ink-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsFeedback.message}</span>
            </div>
          )}

          {/* Mẫu nhanh các đô thị lớn */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
            <span className="text-ink-400">Chọn nhanh:</span>
            <button
              type="button"
              onClick={() => {
                const lat = 21.0285;
                const lng = 105.8542;
                const addr = 'Hồ Hoàn Kiếm, Hà Nội';
                setQuery(addr);
                onChange({ address: addr, latitude: lat, longitude: lng });
              }}
              className="px-2 py-0.5 rounded-md bg-paper-200 hover:bg-paper-300 text-ink-700 font-mono transition-colors"
            >
              Hà Nội (21.0285, 105.8542)
            </button>
            <button
              type="button"
              onClick={() => {
                const lat = 10.7769;
                const lng = 106.7009;
                const addr = 'Bến Nghé, Quận 1, TP. Hồ Chí Minh';
                setQuery(addr);
                onChange({ address: addr, latitude: lat, longitude: lng });
              }}
              className="px-2 py-0.5 rounded-md bg-paper-200 hover:bg-paper-300 text-ink-700 font-mono transition-colors"
            >
              TP.HCM (10.7769, 106.7009)
            </button>
            <button
              type="button"
              onClick={() => {
                const lat = 16.0544;
                const lng = 108.2022;
                const addr = 'Hải Châu, Đà Nẵng';
                setQuery(addr);
                onChange({ address: addr, latitude: lat, longitude: lng });
              }}
              className="px-2 py-0.5 rounded-md bg-paper-200 hover:bg-paper-300 text-ink-700 font-mono transition-colors"
            >
              Đà Nẵng (16.0544, 108.2022)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
