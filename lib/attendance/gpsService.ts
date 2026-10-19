/**
 * GPS & REVERSE GEOCODING SERVICE
 * Quản lý định vị GPS độ chính xác cao và phân giải địa chỉ thực tế đa tầng
 */

import { AUTO_CAPTURE_CONFIG } from './faceUtils';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // Sai số mét
  timestamp: number;
}

export interface GeocodedAddress {
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
}

interface CacheItem {
  timestamp: number;
  data: GeocodedAddress;
}

const geocodeCache = new Map<string, CacheItem>();
const THROTTLE_MS = 60 * 1000; // 60 giây throttle

export class GpsService {
  private watcherId: number | null = null;
  private lastPosition: GpsCoordinates | null = null;

  /**
   * Theo dõi tọa độ thời gian thực
   */
  startWatching(
    onSuccess: (coords: GpsCoordinates) => void,
    onError?: (error: GeolocationPositionError) => void
  ): number | null {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (onError) {
        onError({
          code: 2,
          message: 'Trình duyệt không hỗ trợ Geolocation API',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }
      return null;
    }

    this.stopWatching();

    this.watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: GpsCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
        };
        this.lastPosition = coords;
        onSuccess(coords);
      },
      (err) => {
        if (onError) onError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return this.watcherId;
  }

  /**
   * Hủy theo dõi định vị
   */
  stopWatching(): void {
    if (this.watcherId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watcherId);
      this.watcherId = null;
    }
  }

  getLastPosition(): GpsCoordinates | null {
    return this.lastPosition;
  }

  /**
   * Phân giải tọa độ thành địa chỉ thực tế với cơ chế đa tầng (Multi-fallback)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const now = Date.now();

    const cached = geocodeCache.get(cacheKey);
    if (cached && now - cached.timestamp < THROTTLE_MS) {
      return cached.data;
    }

    let result: GeocodedAddress | null = null;

    // Tầng 1: Google Maps Geocoding API nếu có API key
    const googleApiKey = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_GOOGLE_MAPS_KEY : '';
    if (googleApiKey) {
      try {
        result = await this.fetchFromGoogle(latitude, longitude, googleApiKey);
      } catch (err) {
        console.warn('Google Geocode fallback:', err);
      }
    }

    // Tầng 2: BigDataCloud Reverse Geocode Client API (Không cần key, chuyên biệt địa danh VN)
    if (!result) {
      try {
        result = await this.fetchFromBigDataCloud(latitude, longitude);
      } catch (err) {
        console.warn('BigDataCloud Geocode fallback:', err);
      }
    }

    // Tầng 3: Nominatim OpenStreetMap API
    if (!result) {
      try {
        result = await this.fetchFromNominatim(latitude, longitude);
      } catch (err) {
        console.warn('Nominatim Geocode fallback:', err);
      }
    }

    if (!result) {
      result = {
        formattedAddress: `Tọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }

    geocodeCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  }

  private async fetchFromGoogle(lat: number, lng: number, key: string): Promise<GeocodedAddress | null> {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=vi`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        formattedAddress: data.results[0].formatted_address,
      };
    }
    return null;
  }

  private async fetchFromBigDataCloud(lat: number, lng: number): Promise<GeocodedAddress | null> {
    const url = `${AUTO_CAPTURE_CONFIG.BIGDATACLOUD_API_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=vi`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const parts: string[] = [];
    if (data.locality) parts.push(data.locality);
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
    if (data.countryName) parts.push(data.countryName);

    const fullAddr = parts.length > 0 ? parts.join(', ') : '';
    if (!fullAddr && !data.city) return null;

    return {
      formattedAddress: fullAddr || data.city || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      ward: data.locality,
      district: data.localityInfo?.administrative?.[3]?.name,
      city: data.principalSubdivision || data.city,
      country: data.countryName,
    };
  }

  private async fetchFromNominatim(lat: number, lng: number): Promise<GeocodedAddress | null> {
    const url = `${AUTO_CAPTURE_CONFIG.NOMINATIM_API_URL}?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'vi,en',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      formattedAddress: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      streetNumber: data.address?.house_number,
      route: data.address?.road,
      ward: data.address?.quarter || data.address?.suburb,
      district: data.address?.city_district || data.address?.district,
      city: data.address?.city || data.address?.state,
      country: data.address?.country,
    };
  }
}

export const gpsService = new GpsService();
