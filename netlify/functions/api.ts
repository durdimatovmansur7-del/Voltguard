import type { Handler, HandlerEvent } from "@netlify/functions";

let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    // Dynamic import workaround for @google/genai
    const { GoogleGenAI } = require("@google/genai");
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const handler: Handler = async (event: HandlerEvent) => {
  // Only handle POST to /api/diagnose
  const path = event.path.replace("/.netlify/functions/api", "");

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (path === "/diagnose" && event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { name, location, voltage, current, temperature, loadPercent, oilLevel } = body;

      if (!name) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Transformator nomi yuborilmadi." }),
        };
      }

      try {
        const ai = getGeminiClient();

        const prompt = `Siz elektr tarmoqlari bo'yicha yuqori malakali muhandis va transformatorlar diagnostikasi bo'yicha ekspertsiz. 
Sizga quyidagi transformatordan telemetriya ma'lumotlari keldi:
- Transformator: ${name} (${location || "Noma'lum hudud"})
- Yuklanish darajasi: ${loadPercent || 0}%
- Moy harorati: ${temperature || 0} °C
- Faza kuchlanishlari: U_A = ${voltage?.A || 220} V, U_B = ${voltage?.B || 220} V, U_C = ${voltage?.C || 220} V
- Faza toklari: I_A = ${current?.A || 0} A, I_B = ${current?.B || 0} A, I_C = ${current?.C || 0} A
- Moy sathi holati: ${oilLevel === "normal" ? "Meyorida" : "Meyoridan past"}

Iltimos, ushbu transformatorning joriy holati bo'yicha mukammal va professional muhandislik xulosasini o'zbek tilida tayyorlab bering.
Xulosa quyidagi bo'limlardan iborat bo'lsin:
1. **Joriy holatning umumiy bahosi** (Muammolar mavjudligi, xavf tavsifi, xavfsizlik darajasi: Yaxshi/Ogohlantirish/Xavfli).
2. **Moy harorati va sovutish tizimi tahlili** (Haroratning moy sifatiga va izolyatsiyaga ta'siri).
3. **Yuklama simmetriyasi va faza toklari muvozanati** (Faza toklaridagi farq (nomutanosiblik) bor-yo'qligi tahlili).
4. **Tavsiyalar** (Zudlik bilan bajarilishi kerak bo'lgan profilaktik tadbirlar).

Muhandislik tili juda aniq, sodda va foydali bo'lsin. Markdown formatida chiroyli sarlavhalar bilan javob bering.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });

        const text = response.text || "Tahlil natijasini yuklab bo'lmadi.";
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ diagnosis: text }),
        };
      } catch (apiError: any) {
        console.error("Gemini API error:", apiError);

        // Fallback rule-based response
        let mockReasoning = `### 📌 Joriy holatning umumiy bahosi\nTransformator nomi: **${name}**\n`;
        mockReasoning += `* **Xavf darajasi**: ${temperature > 85 || loadPercent > 95 ? "🔴 OG'IR / XAVFLI" : temperature > 70 || loadPercent > 80 ? "🟡 OGOHLANTIRISH" : "🟢 YAXSHI / ME'YORIDA"}\n`;

        if (temperature > 85) {
          mockReasoning += `* Moy harorati ultra-kritik darajada (${temperature}°C). Jiddiy avariyaga olib kelishi mumkin.\n`;
        } else if (loadPercent > 95) {
          mockReasoning += `* Yuklama eng yuqori chegarasida (${loadPercent}%). Xizmat muddatini qisqartiradi.\n`;
        } else {
          mockReasoning += `* Tarmoq parametrlari barqaror.\n`;
        }

        mockReasoning += `\n### 🌡️ Moy harorati: **${temperature} °C**\n`;
        mockReasoning += `### ⚡ Faza toklari: I_A: ${current?.A || 0}A, I_B: ${current?.B || 0}A, I_C: ${current?.C || 0}A\n`;
        mockReasoning += `\n*Eslatma: AI tahlili uchun GEMINI_API_KEY ni Netlify Environment Variables ga qo'shing.*`;

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ diagnosis: mockReasoning, isDemo: true }),
        };
      }
    } catch (error: any) {
      console.error("General error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Tizim ichki xatosi yuz berdi." }),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not found" }),
  };
};

export { handler };
