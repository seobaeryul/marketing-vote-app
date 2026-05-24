/**
 * QR 코드 페이지 - 서브 사이트 링크 QR 표시
 */
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

// QR 코드 생성 (qrcode 라이브러리 없이 외부 API 사용)
function QRCodeImage({ url }: { url: string }) {
  const encoded = encodeURIComponent(url);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}&bgcolor=ffffff&color=1a1a2e&margin=10`;
  return (
    <img
      src={qrUrl}
      alt="QR 코드"
      className="w-56 h-56 rounded-xl shadow-lg border-4 border-white"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function QRPage() {
  const [, setLocation] = useLocation();
  const [subUrl, setSubUrl] = useState("");

  useEffect(() => {
    // 현재 도메인 기반으로 서브 사이트 URL 생성
    const base = window.location.origin;
    setSubUrl(`${base}/survey`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 닫기 버튼 */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl max-w-xs w-full">
          <h2 className="text-lg font-black text-gray-800 mb-1 text-center">설문 참여 QR</h2>
          <p className="text-xs text-gray-400 mb-5 text-center">QR 코드를 스캔하여 설문에 참여하세요</p>

          {subUrl ? (
            <QRCodeImage url={subUrl} />
          ) : (
            <div className="w-56 h-56 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 text-sm">로딩 중...</span>
            </div>
          )}

          <div className="mt-5 px-3 py-2 bg-gray-50 rounded-lg w-full">
            <p className="text-xs text-gray-400 text-center break-all">{subUrl}</p>
          </div>
        </div>

        <p className="text-white/50 text-xs mt-6 text-center">
          카메라 앱으로 QR 코드를 스캔하세요
        </p>
      </div>
    </div>
  );
}
