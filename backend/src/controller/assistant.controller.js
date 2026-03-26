const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dataService = require('../service/data.service');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    console.log("--- New Chat Request (Gemini 2.5) ---");
    
    const [latestData, isOnline] = await Promise.all([
      dataService.getLatest(),
      dataService.isSystemOnline()
    ]);

    console.log("Latest Sensor Data:", latestData);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      Bạn là một Chuyên gia Nông nghiệp Công nghệ cao (Smart Farm Expert).
      Ngữ cảnh hệ thống:
      - Trạng thái kết nối: ${isOnline ? 'Đang trực tuyến (Online)' : 'Mất kết nối (Offline)'}.
      - Nhiệt độ: ${latestData?.temperature ?? 'N/A'}°C (Lý tưởng: 22-30°C).
      - Độ ẩm không khí: ${latestData?.airHumidity ?? 'N/A'}% (Lý tưởng: 60-80%).
      - Độ ẩm đất: ${latestData?.soilMoisture ?? 'N/A'}% (Cần tưới nếu < 30%, nguy cơ úng nếu > 85%).
      - Ánh sáng: ${latestData?.light ?? 'N/A'} lux (Cần bổ sung LED nếu < 500 lux vào ban ngày).

      Quy tắc trả lời:
      1. Phân tích: Dựa vào số liệu trên, nhận xét xem thông số nào đang bất thường.
      2. Giải pháp: Đưa ra hành động cụ thể (ví dụ: "Bật máy bơm ngay", "Mở quạt thông gió").
      3. Phong cách: Chuyên nghiệp, ngắn gọn
      4. Ngôn ngữ: Tiếng Việt.
      5. Nếu hệ thống Offline: Nhắc người dùng kiểm tra nguồn điện hoặc kết nối WiFi của thiết bị IoT.
    `;

    console.log("Detailed Prompt sent to 2.5");

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const text = response.text();

    console.log("AI 2.5 Response:", text);
    
    res.json({ reply: text });

  } catch (error) {
    console.error("--- Gemini 2.5 Error Details ---");
    console.error("Message:", error.message);
    res.status(500).json({ reply: "Lỗi hệ thống AI: " + error.message });
  }
});

module.exports = router;