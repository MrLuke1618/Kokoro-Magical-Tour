export interface GeoCoords {
  latitude: number;
  longitude: number;
  districtName?: string;
  isCustom?: boolean;
}

export interface RecommendationItem {
  id: string;
  category: 'sunset' | 'deals' | 'food' | 'photomap';
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  highlight: string;
  highlightEn: string;
  distanceMeters: number;
  walkingMinutes: number;
  drivingMinutes: number;
  district: string;
  address: string;
  mapsQuery: string;
  iconEmoji: string;
  tag: string;
  tagEn: string;
  badgeType: 'sunset' | 'deal' | 'cafe' | 'photo';
  actionType: 'inspect' | 'maps' | 'copy';
  originalPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  bestTime?: string;
  rating?: number;
}

export interface LocationRecommendationResult {
  userCoords: GeoCoords;
  districtName: string;
  item: RecommendationItem;
  reasonVi: string;
  reasonEn: string;
}

// Key location coordinates in Hanoi
export const HANOI_DISTRICT_PRESETS: { id: string; nameVi: string; nameEn: string; coords: GeoCoords }[] = [
  {
    id: 'tay-ho',
    nameVi: 'Tây Hồ (Hồ Tây)',
    nameEn: 'Tay Ho (West Lake)',
    coords: { latitude: 21.0583, longitude: 105.8230, districtName: 'Tây Hồ' }
  },
  {
    id: 'ba-dinh',
    nameVi: 'Ba Đình (Trúc Bạch / Lăng Bác)',
    nameEn: 'Ba Dinh (Truc Bach / Mausoleum)',
    coords: { latitude: 21.0341, longitude: 105.8202, districtName: 'Ba Đình' }
  },
  {
    id: 'hoan-kiem',
    nameVi: 'Hoàn Kiếm (Phố Cổ / Cầu Gỗ)',
    nameEn: 'Hoan Kiem (Old Quarter / Sword Lake)',
    coords: { latitude: 21.0285, longitude: 105.8542, districtName: 'Hoàn Kiếm' }
  },
  {
    id: 'cau-giay',
    nameVi: 'Cầu Giấy (Xuân Thủy / Nghĩa Tân)',
    nameEn: 'Cau Giay (Xuan Thuy / Nghia Tan)',
    coords: { latitude: 21.0362, longitude: 105.7906, districtName: 'Cầu Giấy' }
  },
  {
    id: 'dong-da',
    nameVi: 'Đống Đa (Chùa Láng / Hoàng Cầu)',
    nameEn: 'Dong Da (Chua Lang / Hoang Cau)',
    coords: { latitude: 21.0180, longitude: 105.8285, districtName: 'Đống Đa' }
  },
  {
    id: 'long-bien',
    nameVi: 'Long Biên (Bồ Đề / Cầu Long Biên)',
    nameEn: 'Long Bien (Bo De / Long Bien Bridge)',
    coords: { latitude: 21.0435, longitude: 105.8752, districtName: 'Long Biên' }
  }
];

// Rich directory of geo-located spots for location-based recommendations
interface GeoSpotTarget {
  id: string;
  category: 'sunset' | 'deals' | 'food' | 'photomap';
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  highlightVi: string;
  highlightEn: string;
  coords: { lat: number; lng: number };
  district: string;
  address: string;
  mapsQuery: string;
  iconEmoji: string;
  tagVi: string;
  tagEn: string;
  badgeType: 'sunset' | 'deal' | 'cafe' | 'photo';
  originalPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  bestTime?: string;
  rating?: number;
}

const GEO_TARGET_SPOTS: GeoSpotTarget[] = [
  // Sunset Spots
  {
    id: 'rec-sunset-tranquoc',
    category: 'sunset',
    titleVi: 'Chùa Trấn Quốc & Đường Thanh Niên',
    titleEn: 'Tran Quoc Pagoda & Thanh Nien Causeway',
    subtitleVi: 'Bảo tháp cổ soi bóng mặt hồ Tây ráng đỏ rực',
    subtitleEn: 'Ancient pagoda reflection on red dusk waters',
    highlightVi: 'Khoảnh khắc ráng chiều vàng đẹp nhất lúc 17:45',
    highlightEn: 'Peak golden hour reflections at 5:45 PM',
    coords: { lat: 21.0478, lng: 105.8364 },
    district: 'Tây Hồ',
    address: 'Đường Thanh Niên, Yên Phụ, Tây Hồ, Hà Nội',
    mapsQuery: 'Chua Tran Quoc Thanh Nien Tay Ho',
    iconEmoji: '🏯',
    tagVi: 'Hoàng Hôn Hồ Tây',
    tagEn: 'West Lake Sunset',
    badgeType: 'sunset',
    bestTime: '17:45 - 18:30',
    rating: 4.9
  },
  {
    id: 'rec-sunset-benhanquoc',
    category: 'sunset',
    titleVi: 'Bến Hàn Quốc & Đầm Sen Quảng Bá',
    titleEn: 'Korean Wharf & Quang Ba Lotus Lagoon',
    subtitleVi: 'Bãi cỏ lộng gió hướng trọn tầm nhìn chân trời Tây Hồ',
    subtitleEn: 'Open grassy banks overlooking panoramic sunset skyline',
    highlightVi: 'Gió hồ mát rượi, góc chụp ảnh phong cách The Wind Rises',
    highlightEn: 'Gentle lake breeze, The Wind Rises aesthetic',
    coords: { lat: 21.0712, lng: 105.8175 },
    district: 'Tây Hồ',
    address: 'Ngõ 52 Tô Ngọc Vân rẽ vào ven hồ, Nhật Tân, Tây Hồ',
    mapsQuery: 'Ben Han Quoc Ho Tay Ha Noi',
    iconEmoji: '🌾',
    tagVi: 'Góc Lộng Gió',
    tagEn: 'Breezy Wharf',
    badgeType: 'sunset',
    bestTime: '18:00 - 18:40',
    rating: 4.9
  },
  {
    id: 'rec-sunset-longbien',
    category: 'sunset',
    titleVi: 'Cầu Long Biên (Nhịp Cầu Cổ Kính)',
    titleEn: 'Long Bien Bridge (Historic Steel Spans)',
    subtitleVi: 'Khung cảnh hoàng hôn hoài niệm trên sông Hồng',
    subtitleEn: 'Nostalgic golden dusk over the Red River',
    highlightVi: 'Ánh tà dương xuyên qua ray tàu lửa cổ kính',
    highlightEn: 'Sunlight filtering through vintage rail tracks',
    coords: { lat: 21.0435, lng: 105.8569 },
    district: 'Hoàn Kiếm / Long Biên',
    address: 'Cầu Long Biên, Hoàn Kiếm, Hà Nội',
    mapsQuery: 'Cau Long Bien Hoan Kiem Ha Noi',
    iconEmoji: '🌉',
    tagVi: 'Hoài Niệm Cổ Kính',
    tagEn: 'Vintage Heritage',
    badgeType: 'sunset',
    bestTime: '17:30 - 18:15',
    rating: 4.8
  },
  {
    id: 'rec-sunset-tuhoa',
    category: 'sunset',
    titleVi: 'Hẻm Từ Hoa & Ban Công Hoa Giấy',
    titleEn: 'Tu Hoa Alley & Bougainvillea Balcony',
    subtitleVi: 'Con hẻm nhỏ nhìn thẳng ra mặt nước Hồ Tây',
    subtitleEn: 'Charming floral alley framing the glistening lake',
    highlightVi: 'Khung cảnh yên ả như thị trấn ven biển Kiki',
    highlightEn: 'Serene coastal town mood from Kiki\'s Delivery Service',
    coords: { lat: 21.0543, lng: 105.8288 },
    district: 'Tây Hồ',
    address: 'Ngõ 5 Từ Hoa, Quảng An, Tây Hồ, Hà Nội',
    mapsQuery: 'Ngo 5 Tu Hoa Quang An Tay Ho',
    iconEmoji: '🌺',
    tagVi: 'Góc Check-in Thơ',
    tagEn: 'Poetic Alley',
    badgeType: 'sunset',
    bestTime: '17:15 - 18:00',
    rating: 5.0
  },

  // Deals & Clothes / Fashion Spots
  {
    id: 'rec-deal-linen-tayho',
    category: 'deals',
    titleVi: 'Váy Linen Cổ Vuông Vintage Thơ Thẩn',
    titleEn: 'Vintage Square-Neck Linen Dress (Ghibli Autumn)',
    subtitleVi: 'Tiệm Thời Trang Linen Thủ Công Ven Hồ Tây',
    subtitleEn: 'Artisan Linen Boutique near West Lake',
    highlightVi: 'Đang áp dụng mã giảm giá 34% cho đơn hàng chiều nay',
    highlightEn: '34% off discount voucher available for today\'s orders',
    coords: { lat: 21.0620, lng: 105.8260 },
    district: 'Tây Hồ',
    address: 'Tô Ngọc Vân, Quảng An, Tây Hồ, Hà Nội',
    mapsQuery: 'To Ngoc Van Quang An Tay Ho',
    iconEmoji: '👗',
    tagVi: 'Ưu Đãi Váy Linen',
    tagEn: 'Linen Dress Deal',
    badgeType: 'deal',
    originalPrice: 380000,
    salePrice: 249000,
    discountPercent: 34,
    rating: 4.9
  },
  {
    id: 'rec-deal-kraft-art',
    category: 'deals',
    titleVi: 'Sổ Tay Giấy Kraft Vẽ Màu Nước 300gsm & Cọ Vẽ',
    titleEn: '300gsm Cold-Pressed Watercolor Kraft Journal & Brush',
    subtitleVi: 'Xưởng Họa Cụ & Giấy Thủ Công Phố Cổ',
    subtitleEn: 'Old Quarter Artisan Art Supply & Paper Studio',
    highlightVi: 'Giảm 40% cho combo sổ ký họa hoàng hôn',
    highlightEn: '40% off sunset sketching bundle',
    coords: { lat: 21.0315, lng: 105.8510 },
    district: 'Hoàn Kiếm',
    address: 'Hàng Trống, Hoàn Kiếm, Hà Nội',
    mapsQuery: 'Hang Trong Hoan Kiem Ha Noi',
    iconEmoji: '🎨',
    tagVi: 'Họa Cụ Ký Họa',
    tagEn: 'Art & Journal Deal',
    badgeType: 'deal',
    originalPrice: 165000,
    salePrice: 99000,
    discountPercent: 40,
    rating: 5.0
  },
  {
    id: 'rec-deal-totoro-tote',
    category: 'deals',
    titleVi: 'Túi Canvas Totoro Thêu Tay & Mũ Cói Vintage',
    titleEn: 'Hand-Embroidered Totoro Canvas Tote & Straw Hat',
    subtitleVi: 'Tiệm Phụ Kiện & Đồ Vải Phong Cách Nhật',
    subtitleEn: 'Japanese Lifestyle & Canvas Accessories Nook',
    highlightVi: 'Ưu đãi 36% • Tặng kèm móc khóa gỗ sồi Totoro',
    highlightEn: '36% off • Includes handmade oak Totoro keychain',
    coords: { lat: 21.0345, lng: 105.8190 },
    district: 'Ba Đình',
    address: 'Kim Mã, Ba Đình, Hà Nội',
    mapsQuery: 'Kim Ma Ba Dinh Ha Noi',
    iconEmoji: '👜',
    tagVi: 'Phụ Kiện Ghibli',
    tagEn: 'Ghibli Accessories',
    badgeType: 'deal',
    originalPrice: 220000,
    salePrice: 139000,
    discountPercent: 36,
    rating: 4.9
  },
  {
    id: 'rec-deal-film-camera',
    category: 'deals',
    titleVi: 'Máy Ảnh Film Dùng 1 Lần Kodak Daylight 800',
    titleEn: 'Kodak Daylight Disposable Film Camera (39 Exp)',
    subtitleVi: 'Lab Film & Cửa Hàng Máy Ảnh Retro Cầu Giấy',
    subtitleEn: 'Retro Film Lab & Camera Store in Cau Giay',
    highlightVi: 'Tone màu ấm hoài niệm cho buổi chụp hoàng hôn',
    highlightEn: 'Warm vintage color grading for golden hour shoots',
    coords: { lat: 21.0370, lng: 105.7920 },
    district: 'Cầu Giấy',
    address: 'Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    mapsQuery: 'Xuan Thuy Cau Giay Ha Noi',
    iconEmoji: '📷',
    tagVi: 'Máy Ảnh Film',
    tagEn: 'Film Camera Sale',
    badgeType: 'deal',
    originalPrice: 320000,
    salePrice: 235000,
    discountPercent: 26,
    rating: 4.9
  },

  // Food & Cafe Spots
  {
    id: 'rec-cafe-coconut',
    category: 'food',
    titleVi: 'Cà Phê Cốt Dừa Hồ Tây & Ban Công Lộng Gió',
    titleEn: 'West Lake Iced Coconut Coffee & Sunset Balcony',
    subtitleVi: 'Ban công tầng 2 ngắm trọn vẹn đường chân trời Tây Hồ',
    subtitleEn: '2nd-floor breezy patio overlooking the horizon',
    highlightVi: 'Cốt dừa đá tuyết béo ngậy kèm bánh sừng bò',
    highlightEn: 'Creamy coconut espresso slush with warm croissant',
    coords: { lat: 21.0450, lng: 105.8235 },
    district: 'Tây Hồ',
    address: 'Đường Nguyễn Đình Thi ven hồ Tây, Thụy Khuê, Tây Hồ',
    mapsQuery: 'Ca Phe Cot Dua Nguyen Dinh Thi Tay Ho',
    iconEmoji: '🥥',
    tagVi: 'Cà Phê View Hồ',
    tagEn: 'Lakeside Cafe',
    badgeType: 'cafe',
    bestTime: '16:30 - 18:30',
    rating: 4.9
  },
  {
    id: 'rec-cafe-shrimp',
    category: 'food',
    titleVi: 'Bánh Tôm Hồ Tây Cổ Ngư & Nước Mơ Chùa Hương',
    titleEn: 'Crispy West Lake Golden Shrimp Cakes (Co Ngu)',
    subtitleVi: 'Quán ven hồ đối diện mặt nước Trúc Bạch êm đềm',
    subtitleEn: 'Lakeside terrace facing tranquil Truc Bach lake',
    highlightVi: 'Tôm tươi bột khoai giòn rụm chấm mắm chua ngọt',
    highlightEn: 'Crispy freshwater prawns on golden sweet potato crust',
    coords: { lat: 21.0440, lng: 105.8375 },
    district: 'Ba Đình / Tây Hồ',
    address: 'Số 1 đường Thanh Niên, Trúc Bạch, Ba Đình, Hà Nội',
    mapsQuery: 'Banh Tom Ho Tay So 1 Thanh Nien',
    iconEmoji: '🍤',
    tagVi: 'Đặc Sản Hà Nội',
    tagEn: 'Hanoi Delicacy',
    badgeType: 'cafe',
    bestTime: '17:00 - 19:00',
    rating: 4.8
  },
  {
    id: 'rec-cafe-lotus',
    category: 'food',
    titleVi: 'Trà Sen Bách Diệp Tây Hồ & Bánh Cốm Làng Vòng',
    titleEn: 'Pure West Lake Lotus Tea & Soft Com Cake',
    subtitleVi: 'Không gian thưởng trà mộc tĩnh lặng bên đầm sen',
    subtitleEn: 'Peaceful tea pavilion by lotus pond',
    highlightVi: 'Hương sen thanh khiết xoa dịu tâm hồn sau ngày dài',
    highlightEn: 'Hand-scented lotus tea calming your spirit',
    coords: { lat: 21.0665, lng: 105.8230 },
    district: 'Tây Hồ',
    address: 'Quảng Bá, Tây Hồ, Hà Nội',
    mapsQuery: 'Tra Sen Tay Ho Quang Ba Ha Noi',
    iconEmoji: '🪷',
    tagVi: 'Trà Đạo Thư Thái',
    tagEn: 'Artisan Tea Room',
    badgeType: 'cafe',
    bestTime: '15:00 - 18:00',
    rating: 5.0
  },
  {
    id: 'rec-cafe-egg',
    category: 'food',
    titleVi: 'Cà Phê Trứng Béo Ngậy Cổ Truyền Giảng',
    titleEn: 'Traditional Whipped Egg Cream Coffee',
    subtitleVi: 'Hương vị di sản Hà Nội trong góc sân giếng trời',
    subtitleEn: 'Heritage Hanoi flavor in vintage sunlit courtyard',
    highlightVi: 'Lớp kem trứng bông mịn thơm nồng ngâm bát nước ấm',
    highlightEn: 'Silky whipped egg custard served over warm brew',
    coords: { lat: 21.0335, lng: 105.8540 },
    district: 'Hoàn Kiếm',
    address: 'Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội',
    mapsQuery: 'Ca Phe Trung Giang Nguyen Huu Huan',
    iconEmoji: '☕',
    tagVi: 'Di Sản Ẩm Thực',
    tagEn: 'Heritage Coffee',
    badgeType: 'cafe',
    bestTime: '08:00 - 20:00',
    rating: 4.9
  }
];

/**
 * Calculates Great-Circle Distance using Haversine formula (in meters)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Converts distance in meters to formatted string (m or km)
 */
export function formatDistance(meters: number, lang: 'vi' | 'en' = 'vi'): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Estimates travel times (walking @ 4.8 km/h and driving @ 25 km/h in Hanoi traffic)
 */
export function estimateTravelMinutes(meters: number): { walking: number; driving: number } {
  const walkingMinutes = Math.max(1, Math.round((meters / 1000) / 4.8 * 60));
  const drivingMinutes = Math.max(1, Math.round((meters / 1000) / 25 * 60) + 2); // +2 mins traffic buffer
  return { walking: walkingMinutes, driving: drivingMinutes };
}

/**
 * Resolves the closest district name for user coords
 */
export function resolveDistrictName(coords: GeoCoords): string {
  if (coords.districtName) return coords.districtName;
  
  let closestDistrict = 'Tây Hồ';
  let minDistance = Infinity;

  for (const preset of HANOI_DISTRICT_PRESETS) {
    const dist = calculateHaversineDistance(
      coords.latitude,
      coords.longitude,
      preset.coords.latitude,
      preset.coords.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestDistrict = preset.nameVi.split(' ')[0];
    }
  }

  return closestDistrict;
}

/**
 * Core Recommendation Engine: fetches top personalized recommendation by tab category
 */
export function getRecommendationForCategory(
  category: 'sunset' | 'deals' | 'food' | 'photomap',
  userCoords: GeoCoords,
  lang: 'vi' | 'en' = 'vi'
): LocationRecommendationResult {
  const candidateSpots = GEO_TARGET_SPOTS.filter(s => s.category === category);
  
  // Sort candidate spots by distance from user coordinates
  const ranked = candidateSpots.map(spot => {
    const distanceMeters = calculateHaversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      spot.coords.lat,
      spot.coords.lng
    );
    const { walking, driving } = estimateTravelMinutes(distanceMeters);

    const item: RecommendationItem = {
      id: spot.id,
      category: spot.category,
      title: spot.titleVi,
      titleEn: spot.titleEn,
      subtitle: spot.subtitleVi,
      subtitleEn: spot.subtitleEn,
      highlight: spot.highlightVi,
      highlightEn: spot.highlightEn,
      distanceMeters,
      walkingMinutes: walking,
      drivingMinutes: driving,
      district: spot.district,
      address: spot.address,
      mapsQuery: spot.mapsQuery,
      iconEmoji: spot.iconEmoji,
      tag: spot.tagVi,
      tagEn: spot.tagEn,
      badgeType: spot.badgeType,
      actionType: spot.category === 'deals' ? 'inspect' : 'maps',
      originalPrice: spot.originalPrice,
      salePrice: spot.salePrice,
      discountPercent: spot.discountPercent,
      bestTime: spot.bestTime,
      rating: spot.rating
    };

    return { item, distanceMeters };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  const top = ranked[0]?.item || {
    id: 'default-rec',
    category,
    title: 'Hồ Tây Lộng Gió',
    titleEn: 'West Lake Breeze',
    subtitle: 'Điểm đến lý tưởng chiều nay',
    subtitleEn: 'Ideal destination this evening',
    highlight: 'Không gian thoáng đãng ngắm hoàng hôn',
    highlightEn: 'Open sky for golden dusk view',
    distanceMeters: 650,
    walkingMinutes: 8,
    drivingMinutes: 3,
    district: 'Tây Hồ',
    address: 'Đường Thanh Niên, Tây Hồ, Hà Nội',
    mapsQuery: 'Ho Tay Ha Noi',
    iconEmoji: '✨',
    tag: 'Gần Bạn Nhất',
    tagEn: 'Nearest To You',
    badgeType: 'sunset',
    actionType: 'maps'
  };

  const districtName = resolveDistrictName(userCoords);
  const distStr = formatDistance(top.distanceMeters, lang);

  const reasons = {
    sunset: {
      vi: `Gợi ý hoàng hôn gần bạn nhất tại ${districtName} • Cách ${distStr} (${top.walkingMinutes} phút đi bộ)`,
      en: `Nearest sunset spot from your ${districtName} location • ${distStr} away (${top.walkingMinutes} min walk)`
    },
    deals: {
      vi: `Ưu đãi thời trang & phụ kiện tốt nhất gần khu vực ${districtName} của bạn`,
      en: `Best curated fashion & craft deals near your ${districtName} area`
    },
    food: {
      vi: `Quán cà phê & món ngon lý tưởng nhất quanh ${districtName} chiều nay`,
      en: `Top cafe & food pairing near ${districtName} this evening`
    },
    photomap: {
      vi: `Góc check-in nghệ thuật phong cách Ghibli gần bạn tại ${districtName}`,
      en: `Artistic Ghibli-inspired photo spot near ${districtName}`
    }
  };

  return {
    userCoords,
    districtName,
    item: top,
    reasonVi: reasons[category].vi,
    reasonEn: reasons[category].en
  };
}
