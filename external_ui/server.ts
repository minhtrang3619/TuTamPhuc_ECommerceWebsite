/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for Zen consultation advisor
app.post("/api/consult", async (req, res) => {
  const { messages, selectedProduct } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Tham số 'messages' không hợp lệ." });
    return;
  }

  // Formatting messages for prompt context
  const conversationContext = messages
    .map((m: any) => `${m.sender === "user" ? "Khách hàng" : "Trợ lý Từ Tâm"}: ${m.text}`)
    .join("\n");

  const productContext = selectedProduct
    ? `Khách hàng đang xem sản phẩm: "${selectedProduct.name}" (Giá: ${selectedProduct.price.toLocaleString("vi-VN")} đ, Mô tả: ${selectedProduct.description || ""}, Chất vải: ${selectedProduct.fabric || ""}).`
    : "";

  const systemPrompt = `Bạn là Trợ lý Tĩnh Tâm (một cư sĩ thông thái, ôn hòa, am hiểu Phật Pháp và y phục thiền môn) của thương hiệu "Từ Tâm Phục".
Nhiệm vụ của bạn là tư vấn cho khách hàng về y phục phật tử (Pháp phục, Đồ lam, Áo tràng), cách lựa chọn kích cỡ phù hợp dựa trên dáng người, tư thế ngồi thiền (bán già, kiết già hành lễ), cách bảo quản vải đũi/linen dệt tay, và xoa dịu tâm trí họ bằng sự thanh tịnh, tôn kính và hoan hỷ.

Nguyên tắc ứng xử của bạn:
1. Luôn mở đầu/kết thúc câu trả lời một cách lịch sự, nhã nhặn, mang đậm dấu ấn Thiền môn. Có thể dùng câu chào "A Di Đà Phật" hoặc "Nam Mô A Di Đà Phật" một cách nhẹ nhàng tự nhiên ở đầu hoặc cuối câu. xưng hô là "Từ Tâm Phục" hoặc "Đạo hữu" để tạo sự ấm áp, đồng điệu về tâm hồn.
2. Tư vấn chính xác về sản phẩm:
   - Các sản phẩm có tại cửa hàng:
     * Bộ Lam Tĩnh Tâm (1.250.000₫): Vải thô đũi dệt sợi tự nhiên, nhẹ nhõm, phù hợp đồ lam nữ.
     * Áo Tràng An Nhiên (1.850.000₫): Vải lanh lụa óng mượt xếp ly sang trọng.
     * Bộ Cư Sĩ Thiền Môn (1.450.000₫): Chất đũi xước cổ tàu dệt thô sang phái nam/nữ cư sĩ tu tập tinh tấn.
     * Bộ Lam Nam Mộc (1.300.000₫): Màu nâu đất trầm, đũi thô dệt tay, tôn nghiêm và giản đơn, hợp đồ lam nam.
     * Áo Tràng Khinh Thanh (2.100.000₫): Vải tơ tằm siêu nhẹ, giữ oai nghi đứng đi trang nghiêm.
     * Bộ Lam Thư Thái (1.250.000₫): Màu xanh rêu tự viện cổ kính, thảnh thơi.
3. Khi khách hỏi về kích cỡ:
   - Size S: Cho người dưới 48kg, chiều cao 1m50 - 1m58
   - Size M: Cho người 48kg - 55kg, chiều cao 1m56 - 1m64
   - Size L: Cho người 56kg - 63kg, chiều cao 1m62 - 1m70
   - Size XL: Cho người trên 64kg và dưới 78kg
   Lưu ý: Pháp phục nên mặc rộng một chút để khi ngồi thiền, hít thở bụng phình xẹp không bị gò bó, thụ cảm được sự thông thoáng của luồng khí sinh lý.
4. Trả lời bằng tiếng Việt thanh tao, súc tích, dịu dàng, đậm chất thơ tự nhiên. Hãy định dạng bằng Markdown đẹp mắt để khách dễ đọc. Tránh ngôn từ quảng cáo xô bồ thương mại, hãy coi việc tư vấn mua hàng như một nhân duyên lành để gieo duyên tĩnh lặng.`;

  try {
    const ai = getGeminiClient();
    const prompt = `${systemPrompt}\n\n${productContext}\n\nLịch sử hội thoại:\n${conversationContext}\n\nHãy phản hồi câu hỏi cuối cùng của khách hàng một cách chi tiết và từ tâm nhất:`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply = result.text || "Nam Mô A Di Đà Phật. Từ Tâm Phục đang tĩnh lặng cảm nhận yêu cầu của đạo hữu. Xin đạo hữu vui lòng hỏi lại để chúng tôi gieo duyên lành.";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Gemini Consultation Error:", error);
    // Graceful fallback for environments with missing/invalid API Key
    const fallbackText = `**A Di Đà Phật!** 🌸

Cảm ơn quý đạo hữu đã kết duyên cùng Từ Tâm Phục. Hệ thống Trợ lý Tĩnh Tâm AI đang trong trạng thái thiền định ngắn hạn (Chưa có mã khóa kết nối dịch vụ). 

Tuy nhiên, với lòng hoan hỷ, chúng tôi xin chia sẻ thông tin tư vấn nhanh:
- **Nguyên lý y phục:** Chúng tôi thiết kế áo tràng và đồ lam từ sợi đũi/thô mộc tự nhiên nguyên bản, rộng rãi để đạo hữu an tâm hít thở điều hòa và xếp chân thư thái trong các tư thế Kiết Già, Bán Già.
- **Tư vấn giặt là:** Với vải linen mộc dệt sợi, đạo hữu vui lòng giặt tay bằng nước lạnh, vắt nhẹ nhàng và phơi dưới hiên bóng râm để gìn giữ nếp vải dệt dịu dàng, bình an lâu dài.

Chúc đạo hữu một ngày an lạc và vạn sự cát tường!`;
    res.json({ text: fallbackText });
  }
});

// Vite or static file server deployment bridge
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Build files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Từ Tâm Phục Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

startServer();
