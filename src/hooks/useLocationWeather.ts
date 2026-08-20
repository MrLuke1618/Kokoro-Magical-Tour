import { useState, useEffect, useCallback } from 'react';
import { LocationWeatherData } from '../types';

const DEFAULT_HANOI: LocationWeatherData = {
  locationName: 'Hà Nội • Hồ Tây & Hoàn Kiếm',
  latitude: 21.0285,
  longitude: 105.8542,
  temperature: 28,
  humidity: 72,
  windSpeed: 9.5,
  windDirection: 'Tây Nam (SW)',
  weatherDescriptionVi: 'Trời quang đãng • Nắng dịu chiều muộn',
  weatherDescriptionEn: 'Clear Sky • Mild Golden Evening',
  weatherCode: 0,
  isDay: true,
  sunsetTime: '18:18',
  goldenHourStart: '17:43',
  goldenHourEnd: '18:30',
  isUserLocation: false,
  status: 'idle'
};

function getWindDirection(deg: number, lang: 'vi' | 'en'): string {
  const directions = [
    { vi: 'Bắc (N)', en: 'N' },
    { vi: 'Đông Bắc (NE)', en: 'NE' },
    { vi: 'Đông (E)', en: 'E' },
    { vi: 'Đông Nam (SE)', en: 'SE' },
    { vi: 'Nam (S)', en: 'S' },
    { vi: 'Tây Nam (SW)', en: 'SW' },
    { vi: 'Tây (W)', en: 'W' },
    { vi: 'Tây Bắc (NW)', en: 'NW' },
  ];
  const idx = Math.round(deg / 45) % 8;
  return lang === 'vi' ? directions[idx].vi : directions[idx].en;
}

function getWeatherDescription(code: number): { vi: string; en: string } {
  switch (code) {
    case 0:
      return { vi: 'Trời trong xanh • Ánh sáng vàng rực rỡ', en: 'Clear Skies • Crisp Golden Horizon' };
    case 1:
    case 2:
      return { vi: 'Mây mỏng nhẹ • Ráng chiều tỏa đều', en: 'Partly Cloudy • Soft Sunset Glow' };
    case 3:
      return { vi: 'Nhiều mây êm • Ánh hoàng hôn bảng lảng', en: 'Overcast • Diffused Pastel Twilight' };
    case 45:
    case 48:
      return { vi: 'Sương mù nhẹ • Bầu không khí huyền ảo', en: 'Misty • Dreamy Ethereal Haze' };
    case 51:
    case 53:
    case 55:
      return { vi: 'Mưa phùn hạt nhỏ • Không khí trong lành', en: 'Light Drizzle • Fresh Crisp Air' };
    case 61:
    case 63:
    case 65:
      return { vi: 'Mưa rào êm • Phản chiếu mặt nước lấp lánh', en: 'Gentle Rain • Glowing Lake Reflections' };
    case 80:
    case 81:
    case 82:
      return { vi: 'Mưa rào ngắt quãng • Cầu vồng hoàng hôn', en: 'Passing Showers • Twilight Rainbow' };
    case 95:
    case 96:
      return { vi: 'Có dông chiều muộn • Gió mát rượi', en: 'Late Thunderstorm • Cool Gusty Breeze' };
    default:
      return { vi: 'Thời tiết mát mẻ • Thuận lợi ngắm chiều', en: 'Mild & Pleasant • Great Sunset Viewing' };
  }
}

function calculateGoldenHour(sunsetIsoStr: string) {
  try {
    const sunsetDate = new Date(sunsetIsoStr);
    if (isNaN(sunsetDate.getTime())) {
      return {
        sunset: '18:18',
        start: '17:43',
        end: '18:30'
      };
    }
    const formatTime = (d: Date) => {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    const goldenStart = new Date(sunsetDate.getTime() - 35 * 60 * 1000);
    const goldenEnd = new Date(sunsetDate.getTime() + 12 * 60 * 1000);

    return {
      sunset: formatTime(sunsetDate),
      start: formatTime(goldenStart),
      end: formatTime(goldenEnd)
    };
  } catch {
    return {
      sunset: '18:18',
      start: '17:43',
      end: '18:30'
    };
  }
}

export function useLocationWeather(lang: 'vi' | 'en') {
  const [weather, setWeather] = useState<LocationWeatherData>(DEFAULT_HANOI);
  const [hasPrompted, setHasPrompted] = useState<boolean>(false);

  const fetchWeatherForCoords = useCallback(async (lat: number, lon: number, locationName?: string, isUser = false) => {
    setWeather(prev => ({ ...prev, status: 'loading' }));

    try {
      // 1. Fetch Open-Meteo real-time weather & sunset data
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day&daily=sunset,sunrise&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch Open-Meteo weather');
      const data = await res.json();

      const current = data.current || {};
      const daily = data.daily || {};
      const sunsetIso = daily.sunset && daily.sunset[0] ? daily.sunset[0] : '';
      const { sunset, start, end } = calculateGoldenHour(sunsetIso);
      const desc = getWeatherDescription(current.weather_code ?? 0);

      // 2. Reverse geocode if locationName not passed
      let resolvedName = locationName;
      if (!resolvedName && isUser) {
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const locality = geoData.locality || geoData.city || geoData.principalSubdivision || '';
            const city = geoData.city || geoData.principalSubdivision || geoData.countryName || '';
            if (locality && city && locality !== city) {
              resolvedName = `${locality}, ${city}`;
            } else if (locality || city) {
              resolvedName = `${locality || city} (${geoData.countryName || ''})`;
            }
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding fallback', geoErr);
        }
      }

      if (!resolvedName) {
        resolvedName = isUser 
          ? (lang === 'vi' ? `Toạ độ của bạn (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)` : `Your Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`)
          : (lang === 'vi' ? 'Hà Nội • Hồ Tây & Hoàn Kiếm' : 'Hanoi • West Lake & Hoan Kiem');
      }

      setWeather({
        locationName: resolvedName,
        latitude: lat,
        longitude: lon,
        temperature: Math.round(current.temperature_2m ?? 28),
        humidity: Math.round(current.relative_humidity_2m ?? 72),
        windSpeed: Math.round((current.wind_speed_10m ?? 10) * 10) / 10,
        windDirection: getWindDirection(current.wind_direction_10m ?? 220, lang),
        weatherDescriptionVi: desc.vi,
        weatherDescriptionEn: desc.en,
        weatherCode: current.weather_code ?? 0,
        isDay: current.is_day === 1,
        sunsetTime: sunset,
        goldenHourStart: start,
        goldenHourEnd: end,
        isUserLocation: isUser,
        status: 'success'
      });
    } catch (err: unknown) {
      console.error('Weather fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown weather error';
      setWeather(prev => ({
        ...prev,
        status: 'error',
        errorMessage
      }));
    }
  }, [lang]);

  // Request User Location with browser GPS
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setWeather(prev => ({
        ...prev,
        status: 'error',
        errorMessage: lang === 'vi' ? 'Trình duyệt không hỗ trợ GPS định vị.' : 'Geolocation is not supported by your browser.'
      }));
      return;
    }

    setWeather(prev => ({ ...prev, status: 'loading' }));
    setHasPrompted(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherForCoords(latitude, longitude, undefined, true);
      },
      (error) => {
        console.warn('Geolocation denied or failed:', error);
        setWeather(prev => ({
          ...prev,
          status: 'denied',
          errorMessage: lang === 'vi' 
            ? 'Đã từ chối quyền vị trí. Đang dùng toạ độ mặc định tại Hà Nội.' 
            : 'Location access was denied. Showing default Hanoi weather.'
        }));
        // Fallback to Hanoi live weather
        fetchWeatherForCoords(DEFAULT_HANOI.latitude, DEFAULT_HANOI.longitude, DEFAULT_HANOI.locationName, false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [fetchWeatherForCoords, lang]);

  // Initial load: Fetch real Hanoi weather
  useEffect(() => {
    fetchWeatherForCoords(DEFAULT_HANOI.latitude, DEFAULT_HANOI.longitude, DEFAULT_HANOI.locationName, false);
  }, [fetchWeatherForCoords]);

  return {
    weather,
    requestUserLocation,
    hasPrompted,
    refreshWeather: () => fetchWeatherForCoords(weather.latitude, weather.longitude, weather.locationName, weather.isUserLocation)
  };
}
