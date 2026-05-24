import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 클라이언트 초기화 (Vercel 환경변수에서 불러옴)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  app.use(express.json()); // JSON 파싱 필수

  // 1. 투표 결과 가져오기 API (Supabase에서 데이터 개수 세기)
  app.get("/api/votes", async (req, res) => {
    const { data, error } = await supabase
      .from("votes")
      .select("option");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 전역 상태 관리에 맞춰 전체 투표 수 계산
    res.json({ votes: data ? data.length : 0 });
  });

  // 2. 투표하기 API (Supabase DB에 행 삽입)
  app.post("/api/vote", async (req, res) => {
    // 프론트에서 주는 option 값 받기 (없으면 기본값 info)
    const { option } = req.body || { option: "info" };

    const { error } = await supabase
      .from("votes")
      .insert([{ option: option }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 최신 전체 투표수 다시 세서 응답
    const { data: updatedData } = await supabase
      .from("votes")
      .select("option");

    res.json({ votes: updatedData ? updatedData.length : 0 });
  });

  const server = createServer(app);
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  
  app.use(express.static(staticPath));
  
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);