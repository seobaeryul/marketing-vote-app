/**
 * 서브 사이트 - 투표 페이지
 * 중복 클라이언트 생성 코드 제거 완료
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { STRATEGIES, TOTAL_VOTES } from "@/lib/voteStore";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient"; // 1. 여기서 가져온 supabase만 사용하세요!

export default function SurveyVote() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [voteData, setVoteData] = useState({
    total: 0
  });

  // Supabase에서 직접 투표 데이터 개수 가져오기
  const loadVotes = async () => {
    try {
      // 2. 이제 여기서 supabase를 바로 사용하면 됩니다.
      const { data, error, count } = await supabase
        .from("votes")
        .select("*", { count: 'exact', head: true }); 
      
      if (error) throw error;
      
      setVoteData({
        total: count || 0
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

  // ... 나머지 UI 코드는 동일 ...
}