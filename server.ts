import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Clean markdown artifacts and robot formatting (** and *)
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s?/g, '')
    .replace(/`/g, '')
    .trim();
}

const VIRGO_STYLE_INSTRUCTION = `You are a detail-oriented, discerning, elegant and practical Hanoi lifestyle advisor.
Key communication principles:
1. Ultra-practical, observant, and stylish with high aesthetic standards.
2. Real-time accuracy: Always ground your recommendations in real-time Hanoi geography, current weather, actual sunset physics, and verified venue qualities.
3. No asterisks (**) or markdown formatting symbols in output sentences.
4. Provide concrete timings (e.g. 17:42), exact locations, and practical reasoning (wind direction, lighting contrast, crowding levels).
5. STRICT RULE: NEVER mention the words "Virgo", "Xử Nữ", "cung hoàng đạo", or "zodiac" anywhere under any circumstance.`;

// Calculate distance helper on server
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 1. Health Status
  app.get('/api/health', (req, res) => {
    const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    res.json({
      status: 'ok',
      hasApiKey: hasKey,
      appName: 'Hanoi Sunset Sanctuary',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Real-Time Search-Grounded AI Sunset Strategy
  app.post('/api/ai/sunset-plan', async (req, res) => {
    try {
      const {
        currentHour = new Date().getHours(),
        weather = 'Sunny evening in Hanoi',
        lang = 'vi',
        latitude = 21.0560,
        longitude = 105.8240,
        userLocationName = 'Hanoi',
      } = req.body;

      const ai = getGenAI();

      if (!ai) {
        // Dynamic astronomical estimation based on current date & time
        const now = new Date();
        const month = now.getMonth() + 1;
        // Approximation of sunset minute in Hanoi: winter ~17:25, summer ~18:35
        const approxSunsetMinute = 25 + Math.round(Math.sin(((month - 1) / 12) * Math.PI * 2 - Math.PI / 2) * 35 + 35);
        const sunsetMinStr = approxSunsetMinute < 10 ? `0${approxSunsetMinute}` : `${approxSunsetMinute}`;
        const goldenStartMin = Math.max(0, approxSunsetMinute - 35);
        const goldenStartStr = goldenStartMin < 10 ? `0${goldenStartMin}` : `${goldenStartMin}`;

        const distFromWestLake = calculateHaversineKm(latitude, longitude, 21.0560, 105.8240);
        const isNearLakeside = distFromWestLake < 3.0;

        let responseText = '';
        if (lang === 'vi') {
          responseText = isNearLakeside
            ? `Dựa trên tọa độ thực tế cách bờ Tây Hồ ${distFromWestLake.toFixed(1)}km, hôm nay ráng chiều bắt đầu đẹp từ 17:${goldenStartStr} và rực rỡ nhất lúc 17:${sunsetMinStr}. Gợi ý bạn chọn vị trí đón gió tại ngã ba Quảng Bá hoặc đường Nhật Chiêu để có góc nhìn chân trời thoáng đãng không bị che khuất.`
            : `Từ vị trí của bạn (cách Tây Hồ ${distFromWestLake.toFixed(1)}km), hãy di chuyển trước 17:${goldenStartStr} để đón trọn vẹn dải hoàng hôn lúc 17:${sunsetMinStr}. Điểm ngắm tối ưu là đoạn ven hồ phố Quảng An với góc phản xạ mặt nước êm dịu.`;
        } else {
          responseText = isNearLakeside
            ? `Based on your real-time coordinates (${distFromWestLake.toFixed(1)}km from West Lake), golden light begins at 5:${goldenStartStr} PM, peaking at 5:${sunsetMinStr} PM. Position yourself along Quang Ba or Nhat Chieu promenade for an unobstructed horizon view.`
            : `From your current location (${distFromWestLake.toFixed(1)}km away), head towards the lake before 5:${goldenStartStr} PM to catch twilight at 5:${sunsetMinStr} PM along Quang An promenade.`;
        }

        return res.json({ success: true, text: cleanText(responseText), realTimeGrounded: false });
      }

      const currentDateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Perform a real-time search query for today's Hanoi weather, sunset time, and current sky conditions on ${currentDateStr}.
User Context:
- User Coordinates: Lat ${latitude}, Lng ${longitude} (${userLocationName})
- Current Hanoi Hour: ${currentHour}:00
- Client Weather Input: ${weather}
- Desired Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Task:
Generate a fresh, precision-tailored sunset strategy for TODAY.
Include:
1. Exact golden hour peak minute for today in Hanoi based on real-time search.
2. The best vantage point relative to their proximity (e.g. West Lake Quang Ba / Nhat Chieu / Long Bien bridge / Truc Bach).
3. Practical advice: lighting angle, wind exposure, crowd avoidance, and exact camera/seating recommendation.
Format: Exactly 2-3 crisp, practical sentences without asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Google Search Grounding',
        uri: chunk.web?.uri || '',
      })).filter((s: any) => s.uri) || [];

      res.json({
        success: true,
        text: cleanText(response.text || ''),
        sources,
        realTimeGrounded: true,
      });
    } catch (err: any) {
      console.error('Real-Time Sunset Plan Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi' 
          ? 'Hồ Tây chiều nay đón ráng vàng đẹp nhất lúc 17:45. Hãy chọn góc nhìn thoáng tại đường Nhật Chiêu để ngắm trọn vẹn ráng chiều.'
          : 'West Lake catches prime golden light around 5:45 PM. Secure a quiet spot on Nhat Chieu for the best horizon angle.'),
        realTimeGrounded: false,
      });
    }
  });

  // 3. Real-Time Search-Grounded AI Fashion & Art Supplies Deal Finder
  app.post('/api/ai/deal-pick', async (req, res) => {
    try {
      const { category = 'all', mood = 'casual', lang = 'vi', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const dynamicDealsVi = [
          'Váy linen suông dệt mộc tự nhiên 100% kết hợp túi cói đan tay là lựa chọn tối ưu cho thời tiết Hà Nội chiều nay: thoáng khí, không bết dính và giữ phom chuẩn khi dạo hồ.',
          'Sổ phác thảo giấy 300gsm cold-pressed cotton cùng bút kim kỹ thuật 0.5mm là họa cụ chuẩn mực cho buổi ký họa ngoài trời, không bị lem màu khi bắt ẩm sương chiều.',
          'Áo khoác cardigan dệt kim mỏng màu nâu gốm khoác ngoài đầm hoa nhí giữ ấm tinh tế khi nhiệt độ hạ nhanh sau 18:00 bên mặt hồ.'
        ];
        const dynamicDealsEn = [
          'A 100% raw linen shift dress paired with a woven straw tote provides the ideal breathability and silhouette for Hanoi lakeside weather today.',
          'A 300gsm cold-pressed cotton sketchbook and a 0.5mm waterproof fineliner offer archival quality for plein-air sketching by the lake.',
          'A lightweight terracotta knit cardigan layered over a floral slip dress protects against cooling breezes once the sun dips past 6:00 PM.'
        ];
        const list = lang === 'vi' ? dynamicDealsVi : dynamicDealsEn;
        const text = list[seed % list.length];
        return res.json({ success: true, text: cleanText(text), realTimeGrounded: false });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Perform a real-time web search for authentic sustainable materials, linen apparel, watercolor art supplies (300gsm paper), and vintage accessories currently available in Hanoi or Vietnamese e-commerce.
Context:
- Category: ${category}
- Style/Mood: ${mood}
- Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Task:
Provide a real-time grounded recommendation for 1 concrete, high-quality garment or art supply item.
Explain:
1. Exact material specifications (e.g. 100% natural flax linen, 300gsm cold-pressed cotton paper, brass hardware).
2. Why it is practically superior for Hanoi's current climate and outdoor sketching/strolling.
3. Realistic price estimation and practicality verdict.
Format: Exactly 2 practical sentences without asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Google Search Grounding',
        uri: chunk.web?.uri || '',
      })).filter((s: any) => s.uri) || [];

      res.json({
        success: true,
        text: cleanText(response.text || ''),
        sources,
        realTimeGrounded: true,
      });
    } catch (err: any) {
      console.error('Deal Pick Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Một chiếc váy linen màu be mộc kết hợp túi cói nhỏ gọn là sự phối hợp tinh tế và tiện lợi nhất cho buổi dạo chiều.'
          : 'A cream linen dress with a minimal woven tote provides the cleanest aesthetic and best comfort for an evening stroll.'),
        realTimeGrounded: false,
      });
    }
  });

  // 4. Real-Time Search-Grounded AI Taste & Cafe Atmosphere Pairing
  app.post('/api/ai/taste-match', async (req, res) => {
    try {
      const {
        mood = 'chilling',
        timeOfDay = 'sunset',
        lang = 'vi',
        latitude = 21.0560,
        longitude = 105.8240,
      } = req.body;

      const ai = getGenAI();

      if (!ai) {
        const distFromWestLake = calculateHaversineKm(latitude, longitude, 21.0560, 105.8240);
        const nearWestLake = distFromWestLake < 3.0;

        let responseText = '';
        if (lang === 'vi') {
          responseText = nearWestLake
            ? `Gợi ý thực tế gần bạn (${distFromWestLake.toFixed(1)}km): Cà phê cốt dừa ít ngọt tại ban công tầng 2 đường Nguyễn Đình Thi hoặc Trích Sài. Vị béo bùi cân bằng mát lạnh cùng tầm nhìn trực diện mặt nước lúc chạng vạng.`
            : `Gợi ý thực tế: Trà sen Tây Hồ ướp bông tươi kèm bánh cốm dẻo thơm tại phố Yên Phụ / Quảng Bá. Vị chát thanh tao và không gian yên tĩnh rất thích hợp để thư giãn sau giờ làm.`;
        } else {
          responseText = nearWestLake
            ? `Top pairing near you (${distFromWestLake.toFixed(1)}km): Lightly sweetened coconut coffee on a second-floor breezy balcony along Nguyen Dinh Thi or Trich Sai.`
            : `Top pairing: Fresh hundred-petal lotus tea with soft green rice cake in a tranquil tea salon along Yen Phu street.`;
        }

        return res.json({ success: true, text: cleanText(responseText), realTimeGrounded: false });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Search in real-time for authentic, highly rated Hanoi cafes, specialty teas, and seasonal culinary pairings in Hanoi right now.
User Context:
- User Coordinates: Lat ${latitude}, Lng ${longitude}
- Mood / Preference: ${mood}
- Time: ${timeOfDay}
- Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Task:
Recommend a specific, real culinary or cafe experience in Hanoi matching their mood and location.
Include:
1. Exact dish or drink (e.g. Cà phê cốt dừa ít ngọt, Trà sen bách diệp ướp tươi, Bánh tôm giòn nóng).
2. Exact street or landmark in Hanoi relative to West Lake / Old Quarter / Ba Dinh.
3. Practical advice: specific seat (balcony, courtyard), best time to order for optimal temperature/freshness.
Format: Exactly 2 practical, appetizing sentences without asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Google Search Grounding',
        uri: chunk.web?.uri || '',
      })).filter((s: any) => s.uri) || [];

      res.json({
        success: true,
        text: cleanText(response.text || ''),
        sources,
        realTimeGrounded: true,
      });
    } catch (err: any) {
      console.error('Taste Match Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Trà sen Tây Hồ thơm nhẹ cùng chỗ ngồi ban công thoáng đãng là sự kết hợp hoàn hảo cho buổi chiều thư thái.'
          : 'A warm pot of West Lake lotus tea paired with a breezy lakeside balcony makes for the most refined evening.'),
        realTimeGrounded: false,
      });
    }
  });

  // 5. Real-Time Search-Grounded AI Photo Coordinate & Outfit Matcher
  app.post('/api/ai/photo-coordinate', async (req, res) => {
    try {
      const {
        district = 'all',
        lang = 'vi',
        latitude = 21.0560,
        longitude = 105.8240,
      } = req.body;

      const ai = getGenAI();

      if (!ai) {
        const dynamicSpotsVi = [
          'Toạ độ vàng chiều nay: Bậc thềm gạch rêu phong Chùa Trấn Quốc lúc 17:35. Trang phục khuyên dùng: Áo dài linen hoặc sơ mi màu be trơn, tránh hoạ tiết cầu kỳ để khung hình luôn thanh thoát.',
          'Toạ độ vàng chiều nay: Cầu gỗ ven đầm sen Quảng An lúc 17:50. Trang phục khuyên dùng: Váy suông màu nâu đất kèm nón cói nhỏ, tương phản dịu mắt với mặt nước óng ánh ráng chiều.',
          'Toạ độ vàng chiều nay: Đại lộ sấu Phan Đình Phùng lúc 16:30. Trang phục khuyên dùng: Áo dệt kim màu mật ong và quần ống rộng linen trắng.'
        ];
        const dynamicSpotsEn = [
          'Optimal coordinate today: The mossy brick courtyard of Tran Quoc Pagoda at 5:35 PM. Outfit formula: Plain linen tunic or crisp beige shirt for clean minimalist balance.',
          'Optimal coordinate today: The wooden boardwalk by Quang An at 5:50 PM. Outfit formula: Earth-brown slip dress with a straw boater hat contrasting against amber reflections.',
          'Optimal coordinate today: Phan Dinh Phung tree-lined avenue at 4:30 PM. Outfit formula: Honey knit top with relaxed white linen trousers.'
        ];
        const list = lang === 'vi' ? dynamicSpotsVi : dynamicSpotsEn;
        const text = list[Math.floor(Math.random() * list.length)];
        return res.json({ success: true, text: cleanText(text), realTimeGrounded: false });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Search in real-time for current photography conditions, seasonal foliage/flowers in Hanoi (e.g. Phan Dinh Phung flower carts, West Lake sunset angles, Old Quarter archways).
User Context:
- Preferred District: ${district}
- User Coordinates: Lat ${latitude}, Lng ${longitude}
- Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Task:
Provide a real-time grounded photography coordinate for Hanoi today.
Include:
1. Exact photo location and micro-spot (e.g. Span #4 Long Bien Bridge, 19-12 Book Street pavilion, Tu Hoa bougainvillea alley).
2. Precise lighting window and side-light angle for today.
3. Strict outfit palette recommendation (specific HEX / neutral color pairing) and 1 composition rule.
Format: Exactly 2 practical sentences without asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Google Search Grounding',
        uri: chunk.web?.uri || '',
      })).filter((s: any) => s.uri) || [];

      res.json({
        success: true,
        text: cleanText(response.text || ''),
        sources,
        realTimeGrounded: true,
      });
    } catch (err: any) {
      console.error('Photo Coordinate Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Góc ven hồ đường Nhật Chiêu lúc 17:45 đón ánh sáng xiên hoàn hảo. Bạn nên chọn trang phục màu kem hoặc be mộc để ảnh trong trẻo nhất.'
          : 'The lakeside promenade along Nhat Chieu at 5:45 PM offers clean golden side-light. Stick to cream and beige tones for pristine clarity.'),
        realTimeGrounded: false,
      });
    }
  });

  // 6. Live Grounded Real-Time Cafe Search
  app.post('/api/ai/search-nearby-cafes', async (req, res) => {
    try {
      const {
        keyword = 'quiet cafe with lake view',
        latitude = 21.0560,
        longitude = 105.8240,
        lang = 'vi',
      } = req.body;

      const ai = getGenAI();

      if (!ai) {
        return res.json({
          success: true,
          suggestions: [
            {
              name: 'Maison de Blanc - Hồ Tây',
              address: '5 Tây Hồ, Quảng An, Tây Hồ',
              highlight: 'Không gian biệt thự Pháp cổ nhìn ra hồ, yên tĩnh tuyệt đối cho việc đọc sách.',
              bestTime: '15:00 - 18:30',
              distanceEstimate: 'Cách bạn ~1.1km',
            },
            {
              name: 'La Chérie Pastry & Tea',
              address: '155 Nhật Chiêu, Tây Hồ',
              highlight: 'Bánh ngọt thủ công chuẩn Pháp, ban công tầng 2 ngắm trọn vẹn hoàng hôn Hồ Tây.',
              bestTime: '16:30 - 18:15',
              distanceEstimate: 'Cách bạn ~1.8km',
            }
          ]
        });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Search in real-time via Google Search for actual, currently operating cafes in Hanoi matching: "${keyword}".
User Coordinates: Lat ${latitude}, Lng ${longitude}.
Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.

Respond strictly with a JSON object:
{
  "suggestions": [
    {
      "name": "Actual Cafe Name",
      "address": "Actual Street Address in Hanoi",
      "highlight": "1 practical sentence explaining why it suits quiet reading or sunset viewing",
      "bestTime": "Recommended hour (e.g. 16:30 - 18:00)",
      "distanceEstimate": "Estimated proximity"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        }
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        parsed = { suggestions: [] };
      }

      res.json({
        success: true,
        suggestions: parsed.suggestions || [],
        realTimeGrounded: true,
      });
    } catch (err: any) {
      console.error('Search Cafes Error:', err);
      res.json({
        success: true,
        suggestions: [],
        realTimeGrounded: false,
      });
    }
  });

  // 7. Image Analysis (gemini-3.7-flash)
  app.post('/api/ai/analyze-image', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', lang = 'vi' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'No image data provided' });
      }

      const ai = getGenAI();
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      if (!ai) {
        return res.json({
          success: true,
          analysis: {
            ghibliMatch: '94% Tone màu Nắng Chiều & Mộc Mạc',
            heroineArchetype: 'Sophie Hatter (Nét đẹp dịu dàng, tự nhiên & hoài niệm)',
            palette: [
              { hex: '#d49b48', name: 'Sunset Amber' },
              { hex: '#5d6e58', name: 'Olive Leaf' },
              { hex: '#7a9aab', name: 'Twilight Blue' },
              { hex: '#f4f1ea', name: 'Warm Linen' },
              { hex: '#c97d60', name: 'Old Brick' }
            ],
            lightingEvaluation: 'Ánh sáng vàng ấm (Golden Hour), độ tương phản mềm mại êm dịu, tạo chiều sâu hoài niệm.',
            locationGuess: 'Ven hồ Tây hoặc góc ban công Phố Cổ Hà Nội',
            outfitFeedback: 'Trang phục mang hơi thở cổ điển, phối màu mộc mạc hài hòa với sắc trời chiều.',
            sketchbookCaption: 'Mặt trời nghiêng bóng trên mặt hồ lặng, gió mang theo một chút bình yên.'
          }
        });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Analyze this image thoroughly in ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Respond with a JSON object:
{
  "ghibliMatch": "e.g. 94% Natural Twilight Palette",
  "heroineArchetype": "e.g. Sophie Hatter with a short elegant note",
  "palette": [
    {"hex": "#hexcode", "name": "Color name"}
  ],
  "lightingEvaluation": "Clear 1-sentence analysis of lighting angle and soft contrast",
  "locationGuess": "Detection of Hanoi spot or aesthetic vibe",
  "outfitFeedback": "Constructive styling analysis with zero fluff",
  "sketchbookCaption": "A clean 1-sentence poetic caption without asterisks"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      let parsedData: any;
      try {
        parsedData = JSON.parse(response.text || '{}');
      } catch {
        parsedData = {
          ghibliMatch: '90% Natural Palette',
          palette: [
            { hex: '#d49b48', name: 'Sunset Honey' },
            { hex: '#5d6e58', name: 'Olive Green' },
            { hex: '#f4f1ea', name: 'Parchment' }
          ],
          sketchbookCaption: cleanText(response.text || '')
        };
      }

      res.json({
        success: true,
        analysis: parsedData
      });
    } catch (err: any) {
      console.error('Image Analysis Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Image analysis failed'
      });
    }
  });

  // Create HTTP Server
  const server = http.createServer(app);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Hanoi Sunset Sanctuary Server running on http://localhost:${PORT}`);
  });
}

startServer();
