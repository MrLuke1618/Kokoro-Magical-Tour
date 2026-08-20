export type Language = 'vi' | 'en';
export type ThemePalette = 'golden' | 'twilight';

export interface LocationWeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  weatherDescriptionVi: string;
  weatherDescriptionEn: string;
  weatherCode: number;
  isDay: boolean;
  sunsetTime: string; // "18:18"
  goldenHourStart: string; // "17:43"
  goldenHourEnd: string; // "18:33"
  isUserLocation: boolean;
  status: 'idle' | 'prompt' | 'loading' | 'success' | 'denied' | 'error';
  errorMessage?: string;
}

export interface SunsetSpot {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  image?: string;
  iconEmoji: string;
  gradientTheme: string;
  description: string;
  descriptionEn: string;
  bestTime: string;
  ghibliVibe: string;
  ghibliVibeEn: string;
  photoTip: string;
  photoTipEn: string;
  address: string;
  mapsQuery: string;
}

export interface DealItem {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  rating: number;
  soldCount: number;
  image?: string;
  iconEmoji: string;
  colorSwatches: string[];
  gradientTheme: string;
  aestheticTag: string;
  aestheticTagEn: string;
  platform: 'Lazada' | 'TikTok Shop';
  searchKeyword: string;
}

export interface FoodSpot {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  priceRange: string;
  rating: number;
  image?: string;
  iconEmoji: string;
  gradientTheme: string;
  description: string;
  descriptionEn: string;
  signatureDish: string;
  signatureDishEn: string;
  bestSeat: string;
  bestSeatEn: string;
  address: string;
  mapsQuery: string;
}

export interface PhotoSpot {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  districtEn: string;
  image?: string;
  iconEmoji: string;
  gradientTheme: string;
  concept: string;
  conceptEn: string;
  outfitSuggestion: {
    top: string;
    bottom: string;
    accessories: string;
    colorPalette: string[];
    ghibliCharacter: string;
  };
  outfitSuggestionEn: {
    top: string;
    bottom: string;
    accessories: string;
    colorPalette: string[];
    ghibliCharacter: string;
  };
  bestLighting: string;
  bestLightingEn: string;
  cameraSettingsTip: string;
  cameraSettingsTipEn: string;
  address: string;
  mapsQuery: string;
}

export interface TasteMatchResult {
  moodId: string;
  moodLabel: string;
  moodLabelEn: string;
  beverage: string;
  beverageEn: string;
  comfortSnack: string;
  comfortSnackEn: string;
  recommendedSpot: string;
  recommendedSpotEn: string;
  soundtrack: string;
  ghibliQuote: string;
  ghibliQuoteEn: string;
}

