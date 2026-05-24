/**
 * 서브 사이트 - 이미지 페이지 (QR 링크 첫 화면)
 * 첨부된 치킨 마케팅 이미지 표시
 */
import { useLocation } from "wouter";

export default function SurveyImage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src="/chicken-marketing_0ae9d29b.jpg"
          alt="마케팅 전략 예시"
          className="w-full max-w-sm rounded-xl shadow-2xl object-contain"
          style={{ maxHeight: "80vh" }}
        />
      </div>

      {/* 하단 화살표 네비게이션 */}
      <div className="bg-black/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-white/10">
        <div className="w-10" /> {/* 왼쪽 빈 공간 */}
        <span className="text-white/60 text-xs">1 / 2</span>
        <button
          onClick={() => setLocation("/survey/vote")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
