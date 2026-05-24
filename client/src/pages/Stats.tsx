/**
 * 통계 페이지 - 투표 결과 시각화
 * ✅ Supabase에서 직접 읽기 + DELETE로 초기화
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { STRATEGIES, TOTAL_VOTES } from "@/lib/voteStore";
import { BottomNav } from "./Home";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface VoteData {
  totalVotes: number;
  votes: Record<string, number>;
}

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Stats() {
  const [, setLocation] = useLocation();
  const [voteData, setVoteData] = useState<VoteData>({
    totalVotes: 0,
    votes: { info: 0, scarcity: 0, price: 0, influencer: 0 },
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  // ✅ Supabase에서 투표 데이터 불러오기
  const loadVotes = async () => {
    try {
      const { data, error } = await supabase.from("votes").select("option");
      if (error) throw error;

      const counts: Record<string, number> = { info: 0, scarcity: 0, price: 0, influencer: 0 };
      (data || []).forEach((row: { option: string }) => {
        if (counts[row.option] !== undefined) {
          counts[row.option]++;
        }
      });

      setVoteData({
        totalVotes: data ? data.length : 0,
        votes: counts,
      });
    } catch (err: any) {
      console.error("통계 불러오기 실패:", err.message);
    }
  };

  useEffect(() => {
    loadVotes();
    const interval = setInterval(loadVotes, 3000); // 3초마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min((voteData.totalVotes / TOTAL_VOTES) * 100, 100);
  const remaining = TOTAL_VOTES - voteData.totalVotes;

  const totalPieData = [
    { name: "투표 완료", value: voteData.totalVotes },
    { name: "잔여", value: remaining > 0 ? remaining : 0 },
  ];

  const strategyPieData = STRATEGIES.map((s) => ({
    name: s.name,
    value: voteData.votes[s.id] || 0,
    color: s.color,
  }));

  const barData = STRATEGIES.map((s) => ({
    name: s.name.replace(" 마케팅", ""),
    votes: voteData.votes[s.id] || 0,
    fill: s.color,
  }));

  const handleResetClick = () => {
    setShowResetDialog(true);
    setResetConfirmed(false);
  };

  // ✅ Supabase에서 전체 DELETE로 초기화
  const handleConfirmReset = async () => {
    if (!resetConfirmed) {
      toast.error("체크박스를 선택해주세요.");
      return;
    }
    try {
      // votes 테이블 전체 삭제 (id > 0 조건으로 전체 행 DELETE)
      const { error } = await supabase.from("votes").delete().gte("id", 0);
      if (error) throw error;

      setVoteData({
        totalVotes: 0,
        votes: { info: 0, scarcity: 0, price: 0, influencer: 0 },
      });
      setShowResetDialog(false);
      setResetConfirmed(false);
      toast.success("투표 데이터가 초기화되었습니다.");
    } catch (err: any) {
      toast.error(`초기화 실패: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 리셋 확인 다이얼로그 */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>투표 데이터 초기화</DialogTitle>
            <DialogDescription className="text-base font-semibold text-gray-800 mt-2">
              현재까지의 투표가 사라집니다.<br />그래도 초기화 하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="confirm-reset"
                checked={resetConfirmed}
                onCheckedChange={(checked) => setResetConfirmed(checked as boolean)}
                className="w-5 h-5"
              />
              <label htmlFor="confirm-reset" className="text-sm text-gray-600 cursor-pointer flex-1">
                초기화에 동의합니다
              </label>
            </div>
            <button
              onClick={handleConfirmReset}
              className={`w-full py-2.5 rounded-lg font-bold text-white transition-all ${
                resetConfirmed
                  ? "bg-red-600 hover:bg-red-700 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!resetConfirmed}
            >
              초기화
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 헤더 */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-black text-gray-800">통계 자료</h1>
        <button
          onClick={() => setLocation("/qr")}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          QR 코드
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 max-w-md mx-auto w-full pb-32">
        {/* 총 투표 진행 원그래프 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-1">총 투표 진행률</h2>
          <p className="text-xs text-gray-400 mb-3">
            {voteData.totalVotes}명 / {TOTAL_VOTES}명 ({progressPercent.toFixed(1)}%)
          </p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={totalPieData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#E5E7EB" />
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}명`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              투표 완료 {voteData.totalVotes}명
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
              잔여 {remaining > 0 ? remaining : 0}명
            </span>
          </div>
        </div>

        {/* 전략별 비율 원그래프 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">마케팅 전략 선택 비율</h2>
          {voteData.totalVotes === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">아직 투표 데이터가 없습니다.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={strategyPieData}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    outerRadius={85}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {strategyPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}명`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {STRATEGIES.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-600 truncate">{s.name}</span>
                    <span className="font-bold text-gray-800 ml-auto">{voteData.votes[s.id] || 0}명</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 막대그래프 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">전략별 투표 수</h2>
          {voteData.totalVotes === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">아직 투표 데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  label={{ value: "명(투표 수)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: "#9CA3AF" } }}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v: number) => [`${v}명`, "투표 수"]} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {STRATEGIES.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-gray-600 truncate">{s.name.replace(" 마케팅", "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 초기화 버튼 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <button
            onClick={handleResetClick}
            className="w-full py-2 px-3 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
          >
            초기화
          </button>
        </div>
      </div>

      <BottomNav active="stats" />
    </div>
  );
}