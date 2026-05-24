/**
 * 감사 페이지 - 투표 완료 후 표시
 */
import { useLocation } from "wouter";

export default function Thanks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-6">
      {/* 체크 아이콘 */}
      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 className="text-2xl font-black text-gray-800 text-center mb-3 leading-tight">
        설문조사에 참여해주셔서<br />
        <span className="text-blue-600">감사합니다!</span>
      </h1>
      <p className="text-gray-500 text-sm text-center mb-10 leading-relaxed">
        소중한 의견이 마케팅 전략 연구에<br />큰 도움이 됩니다.
      </p>

      <button
        onClick={() => setLocation("/")}
        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all duration-200"
      >
        홈으로 가기
      </button>
    </div>
  );
}
