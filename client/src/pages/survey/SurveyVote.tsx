/**
 * 서브 사이트 - 투표 페이지 (QR 링크 두 번째 화면)
 * 메인 홈과 동일한 투표 UI - Supabase 직접 연결 버전
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { STRATEGIES, TOTAL_VOTES } from "@/lib/voteStore";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";

export default function SurveyVote() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [voteData, setVoteData] = useState({
    total: 0
  });

  const loadVotes = async () => {
    try {
      const { data, error } = await supabase.from("votes").select("option");
      if (error) throw error;
      
      setVoteData({
        total: data ? data.length : 0
      });
    } catch (err: any) {
      console.error("투표 불러오기 실패:", err.message);
    }
  };

  useEffect(() => {
    loadVotes();
  
    const interval = setInterval(loadVotes, 1000);
  
    return () => clearInterval(interval);
  }, []);

  const handleVote = async () => {
    if (!selected) {
      toast.error("마케팅 전략을 선택해주세요.");
      return;
    }
  
    if (voteData.total >= TOTAL_VOTES) {
      toast.error("투표가 마감되었습니다.");
      return;
    }
  
    try {
      const { error } = await supabase.from("votes").insert([{ option: selected }]);
      if (error) throw error;
  
      await loadVotes();
      setLocation("/survey/thanks");
    } catch (err: any) {
      toast.error(`투표 실패: ${err.message}`);
    }
  };

  const progressPercent = Math.min((voteData.total / TOTAL_VOTES) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 투표 현황 */}
      <div className="bg-white shadow-sm px-4 pt-5 pb-4">
        <div className="max-w-md mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 mb-1 tracking-wide uppercase">
            현재 투표자 수
          </p>
          <p className="text-center text-3xl font-black text-gray-800 mb-3">
            <span className="text-blue-600">{voteData.total}</span>
            <span className="text-lg font-medium text-gray-500 ml-1">명</span>
          </p>
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

      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        <h2 className="text-center text-base font-bold text-gray-700 mb-4">
          어떤 마케팅 전략이 가장 효과적이라고 생각하시나요?
        </h2>

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
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
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

      {/* 하단 화살표 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setLocation("/survey")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-gray-400 text-xs">2 / 2</span>
        <div className="w-10" />
      </div>
    </div>
  );
}