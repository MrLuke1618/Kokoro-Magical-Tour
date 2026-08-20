import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
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

const VIRGO_STYLE_INSTRUCTION = `You are a detail-oriented, witty, and subtly sarcastic yet genuinely helpful Hanoi lifestyle companion.
Key communication rules:
1. Be ultra-practical, observant, and stylish with high aesthetic standards.
2. Infuse gentle, light humor and precision without being robotic or preachy.
3. NO asterisks (**) or markdown formatting symbols in output sentences.
4. Be fresh, creative, and unique every single time. Never reuse cliché phrases or generic filler text.
5. STRICT RULE: NEVER mention the words "Virgo", "Xử Nữ", "cung hoàng đạo", or "zodiac" anywhere under any circumstance.`;

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

  // 2. Dynamic 1-Click AI Sunset Plan
  app.post('/api/ai/sunset-plan', async (req, res) => {
    try {
      const { currentHour = 17, weather = 'Sunny evening', lang = 'vi', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const dynamicPlansVi = [
          'Hồ Tây hôm nay ráng chiều tán xạ đẹp nhất từ 17:38 đến 18:05 tại ngã ba Quảng Bá. Hãy chọn ghế sát mép nước để tránh ánh nắng gắt trực diện vào ống kính.',
          'Khu vực Bến Hàn Quốc chiều nay gió nhẹ 10km/h, ánh sáng vàng xiên lý tưởng lúc 17:45. Bạn nên đến sớm 15 phút để chọn góc không vướng xe cộ.',
          'Góc cầu Long Biên phía bãi bồi sông Hồng đón hoàng hôn màu hổ phách lúc 17:50. Hãy đứng nhịp số 4 để có khung hình đường ray cổ kính chuẩn nhất.',
          'Đường Nhật Chiêu đang có khoảng trời thoáng đãng, mặt trời lặn tròn và nét lúc 17:42. Một ly trà hoa cúc ấm sẽ giúp bạn ngắm trọn vẹn từng khoảnh khắc.',
          'Khu vực bán đảo Đặng Thai Mai đón hoàng hôn tím ấm lúc 17:55. Hãy canh đúng thời điểm đèn đường vừa bật để chụp khoảnh khắc giao thoa ánh sáng.'
        ];
        const dynamicPlansEn = [
          'West Lake twilight peaks between 5:38 PM and 6:05 PM at Quang Ba intersection. Pick a shoreline bench to avoid direct lens glare.',
          'Korean Wharf has a gentle 10km/h breeze with ideal slanted golden light at 5:45 PM. Arrive 15 minutes early to secure an unobstructed angle.',
          'Long Bien Bridge overlooking the Red River floodplain catches amber hues at 5:50 PM. Span number 4 provides the cleanest vintage railway perspective.',
          'Nhat Chieu promenade offers open sky with a crisp sunset disc at 5:42 PM. Pair the view with warm chamomile tea for an unhurried session.',
          'Dang Thai Mai peninsula welcomes violet-amber twilight at 5:55 PM. Catch the exact second street lamps flicker on for magical contrast.'
        ];
        const list = lang === 'vi' ? dynamicPlansVi : dynamicPlansEn;
        const text = list[seed % list.length];
        return res.json({ success: true, text: cleanText(text) });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Generate a brand new, highly specific, practical Hanoi sunset observation strategy for right now.
Current condition: Hour ~${currentHour}:00, Weather: ${weather}, Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Timestamp seed: ${seed}.
Format: 2 concise, practical sentences detailing exact location in Hanoi (West Lake, Long Bien, etc.), precise timing (e.g. 17:42), optimal viewing angle, and a witty practical tip. NO asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      res.json({
        success: true,
        text: cleanText(response.text || '')
      });
    } catch (err: any) {
      console.error('Sunset Plan Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi' 
          ? 'Hồ Tây chiều nay đón ráng vàng đẹp nhất lúc 17:45. Hãy chọn góc nhìn thoáng tại đường Nhật Chiêu để ngắm trọn vẹn ráng chiều.'
          : 'West Lake catches prime golden light around 5:45 PM. Secure a quiet spot on Nhat Chieu for the best horizon angle.')
      });
    }
  });

  // 3. Dynamic 1-Click AI Fashion Deal Recommendation
  app.post('/api/ai/deal-pick', async (req, res) => {
    try {
      const { category = 'all', mood = 'casual', lang = 'vi', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const dynamicDealsVi = [
          'Váy linen suông màu kem nhạt kết hợp túi cói đan tay là lựa chọn tối ưu cho thời tiết Hà Nội chiều nay. Chất vải thoáng khí không nhăn gắt khi ngồi ngắm hoàng hôn.',
          'Mũ bucket vải thô mộc kèm kính râm gọng tròn vintage vừa cản gió chiều Hồ Tây vừa tạo điểm nhấn tự nhiên trong khung hình.',
          'Sổ tay vẽ bìa vải thô và bút máy ngòi 0.5mm là combo hoàn hảo cho buổi chiều ghi chép yên tĩnh bên quán cà phê ven hồ.',
          'Áo cardigan dệt kim mỏng màu nâu gốm khoác ngoài váy hoa nhí giúp giữ ấm khi gió mặt nước hạ nhiệt sau 18:00.'
        ];
        const dynamicDealsEn = [
          'A breathable cream linen shift dress paired with a woven straw tote is the most sensible choice for Hanoi today. Breathable, relaxed, and photogenic.',
          'A soft canvas bucket hat with round tortoiseshell sunglasses shields against lakeside wind while anchoring a timeless silhouette.',
          'A raw linen-bound sketchbook and a 0.5mm fineliner make the most practical companion for quiet cafe journaling.',
          'A lightweight terracotta knit cardigan over an earth-tone slip dress ensures comfort once the breeze cools down after 6:00 PM.'
        ];
        const list = lang === 'vi' ? dynamicDealsVi : dynamicDealsEn;
        const text = list[seed % list.length];
        return res.json({ success: true, text: cleanText(text) });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Generate a unique, practical fashion & lifestyle recommendation for Hanoi right now.
Category: ${category}, Mood: ${mood}, Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Seed: ${seed}.
Format: 2 sentences explaining the exact garment/item, why it is practically superior for Hanoi weather, and a sharp styling note. NO asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      res.json({
        success: true,
        text: cleanText(response.text || '')
      });
    } catch (err: any) {
      console.error('Deal Pick Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Một chiếc váy linen màu be mộc kết hợp túi cói nhỏ gọn là sự phối hợp tinh tế và tiện lợi nhất cho buổi dạo chiều.'
          : 'A cream linen dress with a minimal woven tote provides the cleanest aesthetic and best comfort for an evening stroll.')
      });
    }
  });

  // 4. Dynamic 1-Click AI Taste Pairing (Cafes & Food)
  app.post('/api/ai/taste-match', async (req, res) => {
    try {
      const { mood = 'chilling', timeOfDay = 'sunset', lang = 'vi', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const dynamicTastesVi = [
          'Gợi ý chuẩn vị chiều nay: Cà phê cốt dừa ít ngọt tại ban công tầng 2 đường Trích Sài. Vị béo bùi cân bằng hoàn hảo với làn gió hồ mát lạnh.',
          'Gợi ý chiều nay: Trà sen Tây Hồ ướp bông tươi kèm bánh đậu xanh Hải Dương ít đường. Thanh tao, thơm đượm và không làm bạn mất ngủ buổi tối.',
          'Gợi ý chiều nay: Bánh tôm giòn rụm phố Thanh Niên ăn kèm đĩa rau thơm tươi sạch. Hãy đến trước 17:30 để bánh luôn nóng hổi và phục vụ chu đáo nhất.',
          'Gợi ý chiều nay: Cà phê trứng đánh bông mịn tại góc ngõ Nguyễn Tri Phương. Nhiệt độ ly nước nóng giữ ấm chuẩn mực cho vị béo ngậy tan trên đầu lưỡi.'
        ];
        const dynamicTastesEn = [
          'Top taste pairing today: Lightly sweetened coconut coffee on a second-floor balcony along Trich Sai. Rich, silky, and balanced against the cool lake breeze.',
          'Top taste pairing today: Freshly scented West Lake lotus blossom tea with low-sugar mung bean cakes. Delicate, aromatic, and gentle for the evening.',
          'Top taste pairing today: Crispy Hanoi shrimp patties on Thanh Nien street with fresh herbs. Arrive before 5:30 PM for the freshest batch.',
          'Top taste pairing today: Silky whipped egg coffee in a quiet Nguyen Tri Phuong courtyard. Kept warm in hot water baths for the smoothest finish.'
        ];
        const list = lang === 'vi' ? dynamicTastesVi : dynamicTastesEn;
        const text = list[seed % list.length];
        return res.json({ success: true, text: cleanText(text) });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Generate a unique, realistic Hanoi food or drink pairing for right now.
Mood: ${mood}, Time: ${timeOfDay}, Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Seed: ${seed}.
Format: 2 clear, appetizing sentences naming the exact dish/drink, exact district/street in Hanoi, and a perfectionist taste tip. NO asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      res.json({
        success: true,
        text: cleanText(response.text || '')
      });
    } catch (err: any) {
      console.error('Taste Match Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Trà sen Tây Hồ thơm nhẹ cùng chỗ ngồi ban công thoáng đãng là sự kết hợp hoàn hảo cho buổi chiều thư thái.'
          : 'A warm pot of West Lake lotus tea paired with a breezy lakeside balcony makes for the most refined evening.')
      });
    }
  });

  // 5. Dynamic 1-Click AI Photo Spot & Outfit Coordinate
  app.post('/api/ai/photo-coordinate', async (req, res) => {
    try {
      const { district = 'all', lang = 'vi', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const dynamicSpotsVi = [
          'Toạ độ vàng: Bậc thềm gạch rêu phong Chùa Trấn Quốc lúc 17:35. Trang phục khuyên dùng: Áo dài linen hoặc sơ mi màu be trơn, tránh hoạ tiết cầu kỳ để khung hình luôn thanh thoát.',
          'Toạ độ vàng: Cổng vòm gạch cổ Báo Khánh - Hoàn Kiếm lúc 17:15. Trang phục khuyên dùng: Váy yếm màu xanh olive phối áo sơ mi trắng cổ sen, tạo chiều sâu mộc mạc.',
          'Toạ độ vàng: Cầu gỗ ven đầm sen Quảng An lúc 17:50. Trang phục khuyên dùng: Váy suông màu nâu đất kèm nón cói nhỏ, tương phản dịu mắt với mặt nước óng ánh ráng chiều.',
          'Toạ độ vàng: Đoạn rặng liễu đường Thanh Niên rọi nắng xiên lúc 17:40. Trang phục khuyên dùng: Áo dệt kim màu mật ong và quần ống rộng linen trắng.'
        ];
        const dynamicSpotsEn = [
          'Optimal coordinate: The mossy brick courtyard of Tran Quoc Pagoda at 5:35 PM. Outfit formula: Plain linen tunic or crisp beige shirt for clean minimalist balance.',
          'Optimal coordinate: The vintage archway near Bao Khanh at 5:15 PM. Outfit formula: Olive green pinafore over a white Peter Pan collar blouse for subtle depth.',
          'Optimal coordinate: The wooden boardwalk by Quang An lotus pond at 5:50 PM. Outfit formula: Earth-brown slip dress with a straw boater hat contrasting against amber reflections.',
          'Optimal coordinate: The weeping willow promenade on Thanh Nien street at 5:40 PM. Outfit formula: Honey knit top with relaxed white linen trousers.'
        ];
        const list = lang === 'vi' ? dynamicSpotsVi : dynamicSpotsEn;
        const text = list[seed % list.length];
        return res.json({ success: true, text: cleanText(text) });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
Generate a unique aesthetic photography coordinate in Hanoi right now.
District: ${district}, Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
Seed: ${seed}.
Format: 2 sentences specifying the exact photo angle in Hanoi, precise time window, outfit color pairing, and one composition rule. NO asterisks (**).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      res.json({
        success: true,
        text: cleanText(response.text || '')
      });
    } catch (err: any) {
      console.error('Photo Coordinate Error:', err);
      res.json({
        success: true,
        text: cleanText(req.body.lang === 'vi'
          ? 'Góc ven hồ đường Nhật Chiêu lúc 17:45 đón ánh sáng xiên hoàn hảo. Bạn nên chọn trang phục màu kem hoặc be mộc để ảnh trong trẻo nhất.'
          : 'The lakeside promenade along Nhat Chieu at 5:45 PM offers clean golden side-light. Stick to cream and beige tones for pristine clarity.')
      });
    }
  });

  // 6. Live Companion Dialogue (English Voice + Vietnamese Subtitle)
  app.post('/api/ai/live-dialogue', async (req, res) => {
    try {
      const { userText = 'Where should I go for sunset today?', seed = Date.now() } = req.body;
      const ai = getGenAI();

      if (!ai) {
        const fallbacks = [
          {
            englishSpeech: "West Lake has such serene amber light around 5:45 PM today. I recommend heading to Nhat Chieu for the cleanest horizon angle.",
            vietnameseSubtitle: "Hồ Tây hôm nay có ánh sáng hổ phách rất êm dịu lúc 17:45. Mình khuyên bạn nên ghé đường Nhật Chiêu để đón góc nhìn thoáng đãng nhất."
          },
          {
            englishSpeech: "If you enjoy a quiet balcony, Dang Thai Mai has lovely hidden cafes overlooking the water. Make sure to bring a light jacket as the breeze picks up.",
            vietnameseSubtitle: "Nếu bạn thích ban công yên tĩnh, khu Đặng Thai Mai có nhiều quán nhỏ view hồ rất xinh. Nhớ mang áo khoác mỏng vì gió chiều sẽ mát dần đấy."
          },
          {
            englishSpeech: "For photos today, soft earth tones and linen will blend gracefully with the evening reflections without overwhelming the scene.",
            vietnameseSubtitle: "Để chụp ảnh chiều nay, trang phục màu đất nhạt và vải linen sẽ hòa hợp tự nhiên với ánh hoàng hôn mà không bị gắt."
          },
          {
            englishSpeech: "Long Bien Bridge at golden hour is quite poetic. Span number four offers an uncluttered view of the train tracks and Red River.",
            vietnameseSubtitle: "Cầu Long Biên vào giờ vàng rất hoài niệm. Nhịp cầu số 4 mang lại góc nhìn thoáng đãng của đường ray và sông Hồng."
          }
        ];
        const pick = fallbacks[seed % fallbacks.length];
        return res.json({
          success: true,
          englishSpeech: cleanText(pick.englishSpeech),
          vietnameseSubtitle: cleanText(pick.vietnameseSubtitle)
        });
      }

      const prompt = `${VIRGO_STYLE_INSTRUCTION}
The user is speaking to you in the Live Companion.
User input: "${userText}"
You MUST respond with a JSON object containing two fields:
1. "englishSpeech": A natural, fluent, spoken English sentence (1-2 sentences max) crafted for high-quality text-to-speech audio.
2. "vietnameseSubtitle": The accurate, natural, and elegant Vietnamese translation of the English speech for real-time display.
NO asterisks (**), NO robotic formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        parsed = {
          englishSpeech: cleanText(response.text || "West Lake is bathed in warm golden light right now."),
          vietnameseSubtitle: cleanText("Hồ Tây lúc này đang ngập tràn ánh nắng vàng rực rỡ.")
        };
      }

      res.json({
        success: true,
        englishSpeech: cleanText(parsed.englishSpeech || ''),
        vietnameseSubtitle: cleanText(parsed.vietnameseSubtitle || '')
      });
    } catch (err: any) {
      console.error('Live Dialogue Error:', err);
      res.json({
        success: true,
        englishSpeech: "West Lake has such a calming breeze right now. Enjoy the peaceful evening.",
        vietnameseSubtitle: "Gió Hồ Tây lúc này rất dễ chịu. Chúc bạn có một buổi chiều thật an yên."
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

  // Create HTTP Server & WebSocket
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', (ws: WebSocket) => {
    const ai = getGenAI();

    ws.on('message', async (data: Buffer | string) => {
      try {
        let msg: any;
        if (typeof data === 'string') {
          msg = JSON.parse(data);
        } else {
          try {
            msg = JSON.parse(data.toString());
          } catch {
            msg = { type: 'user_text', text: data.toString() };
          }
        }

        if (msg.type === 'start_session') {
          ws.send(JSON.stringify({
            type: 'session_ready',
            message: 'Live Companion ready.'
          }));
          return;
        }

        if (msg.type === 'user_text') {
          const userText = msg.text || 'Tell me about sunset at West Lake';

          if (!ai) {
            const staticLive = [
              {
                englishSpeech: "West Lake is looking magnificent this evening. The light around the pagoda softens right at 5:45 PM.",
                vietnameseSubtitle: "Hồ Tây chiều nay rất đẹp. Ánh sáng quanh khu vực chùa sẽ mềm mại nhất đúng lúc 17:45."
              },
              {
                englishSpeech: "I suggest wearing lightweight linen today. The lakeside breeze is crisp and cooling down nicely.",
                vietnameseSubtitle: "Mình gợi ý bạn nên mặc vải linen nhẹ nhàng hôm nay. Gió ven hồ đang thổi rất thoáng mát."
              }
            ];
            const pick = staticLive[Math.floor(Math.random() * staticLive.length)];
            ws.send(JSON.stringify({
              type: 'ai_dialogue',
              englishSpeech: pick.englishSpeech,
              vietnameseSubtitle: pick.vietnameseSubtitle
            }));
            return;
          }

          const prompt = `${VIRGO_STYLE_INSTRUCTION}
User said: "${userText}".
Respond with JSON:
{
  "englishSpeech": "Spoken English sentence (1-2 sentences max)",
  "vietnameseSubtitle": "Accurate Vietnamese translation of the English speech"
}
NO asterisks (**).`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          });

          let parsed: any;
          try {
            parsed = JSON.parse(response.text || '{}');
          } catch {
            parsed = {
              englishSpeech: cleanText(response.text || "West Lake sunset is breathtaking today."),
              vietnameseSubtitle: "Hoàng hôn Hồ Tây hôm nay rất ấn tượng."
            };
          }

          ws.send(JSON.stringify({
            type: 'ai_dialogue',
            englishSpeech: cleanText(parsed.englishSpeech || ''),
            vietnameseSubtitle: cleanText(parsed.vietnameseSubtitle || '')
          }));
        }
      } catch (err: any) {
        console.error('WS Error:', err);
      }
    });
  });

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
