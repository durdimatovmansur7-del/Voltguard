import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
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

// API Route for Transformer AI Diagnosis
app.post("/api/diagnose", async (req, res) => {
  try {
    const { name, location, voltage, current, temperature, loadPercent, oilLevel } = req.body;

    // Guard parameters
    if (!name) {
      return res.status(400).json({ error: "Transformator nomi yuborilmadi." });
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
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || "Tahlil natijasini yuklab bo'lmadi.";
      return res.json({ diagnosis: text });

    } catch (apiError: any) {
      console.error("Gemini API error:", apiError);
      
      // Detailed rule-based fallback in case GEMINI_API_KEY is not defined or fails,
      // ensuring high-fidelity elegant UX even in offline/demo modes.
      let mockReasoning = `### 📌 Joriy holatning umumiy bahosi
Transformator nomi: **${name}**
Hozirda tizimda GEMINI_API_KEY sozlanmaganligi sababli, avtomatik tahliliy modul ishga tushdi.
* **Xavf darajasi**: ${temperature > 85 || loadPercent > 95 ? "🔴 OG'IR / XAVFLI" : temperature > 70 || loadPercent > 80 ? "🟡 OGOHLANTIRISH" : "🟢 YAXSHI / ME'YORIDA"}
* **Tizim xulosasi**: `;

      if (temperature > 85) {
        mockReasoning += `Moy harorati ultra-kritik darajada (${temperature}°C). Bu sarg'ichlarning termal parchalanishiga va jiddiy avariyaga olib kelishi mumkin.`;
      } else if (loadPercent > 95) {
        mockReasoning += `Yuklama deyarli uning eng yuqori chegarasida (${loadPercent}%). Uzoq muddat bunday ishlash xizmat muddatini keskin qisqartiradi.`;
      } else {
        mockReasoning += `Tarmoq parametrlari barqaror xizmat ko'rsatish rejimiga javob beradi.`;
      }

      mockReasoning += `

### 🌡️ Moy harorati va sovutish tizimi tahlili
- Joriy harorat: **${temperature} °C**
- Baholash: ${temperature > 85 ? "Moyning qaynash haroratiga yaqin. Zudlik bilan yuklamani kamaytirish va sovutish qovurg'alarini tozalash yoki havo purkagichlarni yoqish talab etiladi." : temperature > 70 ? "Moy harorati tezlashganda uning oksidlanish koeffitsiyenti ortadi. Rejali nazorat talab qilinadi." : "Harorat rejimiga ko'ra mo'tadil. Sovutish tizimi to'g'ri ishlamoqda."}

### ⚡ Yuklama simmetriyasi va faza toklari muvozanati
- Faza toklari: I_A: ${current?.A || 0}A, I_B: ${current?.B || 0}A, I_C: ${current?.C || 0}A.
- Kuchlanishlar: U_A: ${voltage?.A || 220}V, U_B: ${voltage?.B || 220}V, U_C: ${voltage?.C || 220}V.
- Izoh: Fazalar orasidagi yuklamaning bir xilda taqsimlanmaganligi neytral simning qizishiga olib keladi. Fazalardagi farq taxminan ${Math.max(current?.A || 0, current?.B || 0, current?.C || 0) - Math.min(current?.A || 0, current?.B || 0, current?.C || 0)} A ni tashkil etadi.

### 🛠️ Tavsiyalar
1. ${temperature > 75 ? "Zudlik bilan transformatordagi yuklamani boshqa backup liniyalarga o'tkazish yoki tok sarfini qisqartirish." : "Rejali ko'rik doirasida sarg'ichlar orasidagi o'tish qarshiligini o'lchash."}
2. Moy sathini muntazam tekshirib turish (${oilLevel === "low" ? "🔴 Zudlik bilan moy qo'shish zarur!" : "Moy sathi me'yorda."})
3. Sifatli monitoringni davom ettirish va datchiklar holatini tozalab turish.

*Eslatma: Haqiqiy sun'iy intellekt tahlilini olish uchun AI Studio sozlamalaridan 'GEMINI_API_KEY' ni bog'lang.*`;

      return res.json({ diagnosis: mockReasoning, isDemo: true });
    }
  } catch (error: any) {
    console.error("General error:", error);
    res.status(500).json({ error: "Tizim ichki xatosi yuz berdi." });
  }
});

// Serve static assets or mount Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
