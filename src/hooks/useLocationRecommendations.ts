import { useState, useEffect, useCallback } from 'react';
import { 
  GeoCoords, 
  LocationRecommendationResult, 
  getRecommendationForCategory, 
  HANOI_DISTRICT_PRESETS 
} from '../services/recommendationService';
import { Language } from '../types';

const STORAGE_LOCATION_KEY = 'hanoi_user_location_coords';

export function useLocationRecommendations(
  category: 'sunset' | 'deals' | 'food' | 'photomap',
  lang: Language = 'vi'
) {
  // Default to Tay Ho preset or stored coordinates
  const [coords, setCoords] = useState<GeoCoords>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCATION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored location coords', e);
    }
    return HANOI_DISTRICT_PRESETS[0].coords;
  });

  const [recommendation, setRecommendation] = useState<LocationRecommendationResult>(() => 
    getRecommendationForCategory(category, coords, lang)
  );

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Recalculate recommendation when coords, category or lang changes
  useEffect(() => {
    const res = getRecommendationForCategory(category, coords, lang);
    setRecommendation(res);
  }, [category, coords, lang]);

  // Set preset district
  const setDistrict = useCallback((districtId: string) => {
    const target = HANOI_DISTRICT_PRESETS.find(p => p.id === districtId);
    if (target) {
      const newCoords = { ...target.coords, isCustom: false };
      setCoords(newCoords);
      try {
        localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(newCoords));
      } catch (e) {
        console.warn('Failed to save location', e);
      }
      setGpsError(null);
    }
  }, []);

  // Request browser GPS position
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError(lang === 'vi' ? 'Trình duyệt không hỗ trợ GPS' : 'GPS not supported');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: GeoCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          districtName: lang === 'vi' ? 'Toạ độ GPS của bạn' : 'Your GPS Coords',
          isCustom: true
        };
        setCoords(userLoc);
        try {
          localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(userLoc));
        } catch (e) {
          console.warn('Failed to save GPS location', e);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location request denied/failed:', err);
        setGpsError(
          lang === 'vi'
            ? 'Không thể truy cập GPS. Đang dùng vị trí Tây Hồ.'
            : 'GPS access denied. Using West Lake location.'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, [lang]);

  return {
    coords,
    recommendation,
    setDistrict,
    requestGpsLocation,
    isLocating,
    gpsError,
    presets: HANOI_DISTRICT_PRESETS
  };
}
