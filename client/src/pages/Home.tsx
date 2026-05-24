/**
 * 홈 페이지 - 마케팅 전략 투표
 * 디자인: 깔끔한 화이트 베이스, 포인트 블루, 모바일 최적화
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { STRATEGIES, TOTAL_VOTES } from "@/lib/voteStore"; // 안 쓰는 옛날 함수들은 지웠어!
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// 🌟 Supabase 클라이언트 연결 추가
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  
  // 🌟 Supabase에서 가져올 숫자 저장소
  const [voteData, setVoteData] = useState({
    totalVotes: 0
  });

  // 🌟 Supabase에서 진짜 투표 데이터 개수 가져오기
  const loadVotes = async () => {
    try {
      const { data, error } = await supabase.from("votes").select("option");
      if (error) throw error;
      
      setVoteData({
        totalVotes: data ? data.length : 0 // 전체 줄 수를 세서 투표자 수로 적용!
      });
    } catch (err: any) {
      console.error("투표 불러오기 실패:", err.message);
    }
  };

  useEffect(() => {
    loadVotes(); // 처음 켰을 때 한 번 불러오고
    
    // 🌟 1초마다 Supabase 새로고침 (큐얼이랑 실시간 동기화)
    const interval = setInterval(loadVotes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 🌟 투표하기 버튼 눌렀을 때 Supabase에 바로 저장하기
  const handleVote = async () => {
    if (!selected) {
      toast.error("마케팅 전략을 선택해주세요.");
      return;
    }
    if (voteData.totalVotes >= TOTAL_VOTES) {
      toast.error("투표가 마감되었습니다.");
      return;
    }

    try {
      // 데이터베이스에 유저가 선택한 option 저장
      const { error } = await supabase.from("votes").insert([{ option: selected }]);
      if (error) throw error;
  
      await loadVotes(); // 저장 성공하면 숫자 한 번 더 갱신
      setLocation("/thanks");
    } catch (err: any) {
      toast.error(`투표 실패: ${err.message}`);
    }
  };

  const progressPercent = Math.min((voteData.totalVotes / TOTAL_VOTES) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 투표 현황 */}
      <div className="bg-white shadow-sm px-4 pt-5 pb-4">
        <div className="max-w-md mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 mb-1 tracking-wide uppercase">
            현재 투표자 수
          </p>
          <p className="text-center text-3xl font-black text-gray-800 mb-3">
            <span className="text-blue-600">{voteData.totalVotes}</span>
            <span className="text-lg font-medium text-gray-500 ml-1">명</span>
          </p>
          {/* 그라데이션 진행 바 */}
          <div className="relative w-full h-4 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`,
                minWidth: progressPercent > 0 ? "8px" : "0",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0명</span>
            <span>TOTAL {TOTAL_VOTES}명</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        <h2 className="text-center text-base font-bold text-gray-700 mb-4">
          어떤 마케팅 전략이 가장 효과적이라고 생각하시나요?
        </h2>

        {/* 4사분면 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {STRATEGIES.map((strategy) => {
            const isSelected = selected === strategy.id;
            return (
              <button
                key={strategy.id}
                onClick={() => setSelected(isSelected ? null : strategy.id)}
                className={`
                  relative flex flex-col items-start p-4 rounded-2xl text-left
                  border-2 transition-all duration-200 bg-white shadow-sm
                  active:scale-95
                  ${isSelected
                    ? "border-blue-500 shadow-blue-100 shadow-md bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }
                `}
                style={{ minHeight: "130px" }}
              >
                {/* 선택 인디케이터 */}
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                {/* 색상 도트 */}
                <span
                  className="w-3 h-3 rounded-full mb-2 flex-shrink-0"
                  style={{ backgroundColor: strategy.color }}
                />
                <span className={`text-sm font-bold mb-1 leading-tight ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                  {strategy.name}
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  {strategy.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* 투표하기 버튼 */}
        <button
          onClick={handleVote}
          className={`
            w-full py-4 rounded-2xl text-white font-bold text-base
            transition-all duration-200 active:scale-95 shadow-md
            ${selected
              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              : "bg-gray-300 cursor-not-allowed"
            }
          `}
          disabled={!selected}
        >
          투표하기
        </button>
      </div>

      {/* 하단 탭 네비게이션 */}
      <BottomNav active="home" />
    </div>
  );
}

export function BottomNav({ active }: { active: "home" | "stats" }) {
  const [, setLocation] = useLocation();
  return (
    <nav className="bg-white border-t border-gray-200 flex sticky bottom-0 z-10">
      <button
        onClick={() => setLocation("/")}
        className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
          active === "home" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span className="text-xs font-semibold">홈</span>
      </button>
      {active !== "stats" && (
        <button
          onClick={() => setLocation("/qr")}
          className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors text-gray-400 hover:text-gray-600"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span className="text-xs font-semibold">QR</span>
        </button>
      )}
      <button
        onClick={() => setLocation("/stats")}
        className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
          active === "stats" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span className="text-xs font-semibold">통계</span>
      </button>
    </nav>
  );
}