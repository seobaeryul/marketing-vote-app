// 투표 데이터 전역 상태 관리 (localStorage 기반)
// 마케팅 전략 투표 앱 - 공유 상태

export const TOTAL_VOTES = 500;

export const STRATEGIES = [
  {
    id: "info",
    name: "정보 마케팅",
    description: "유용한 지식과 사실을 투명하게 제공해 신뢰를 얻는 마케팅",
    color: "#3B82F6", // blue
  },
  {
    id: "scarcity",
    name: "희소성 마케팅",
    description: "구매 기회나 수량을 제한해 안달 나게 만드는 마케팅",
    color: "#EF4444", // red
  },
  {
    id: "price",
    name: "가격 마케팅",
    description: "파격 할인이나 가성비를 내세워 즉각 유혹하는 마케팅",
    color: "#F59E0B", // amber
  },
  {
    id: "influencer",
    name: "인플루언서 마케팅",
    description: "영향력 있는 유명인의 팬덤과 친근함을 빌리는 마케팅",
    color: "#8B5CF6", // purple
  },
];

export interface VoteData {
  totalVotes: number;
  votes: Record<string, number>;
}

const STORAGE_KEY = "marketing_vote_data";
const QR_VOTED_KEY = "qr_voted_already";

export function getVoteData(): VoteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalVotes: 0,
    votes: { info: 0, scarcity: 0, price: 0, influencer: 0 },
  };
}

export function saveVoteData(data: VoteData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // 다른 탭/창에도 이벤트 발생
  window.dispatchEvent(new CustomEvent("voteUpdated", { detail: data }));
}

// localStorage 변경 감지 (다른 탭에서의 변경)
export function initStorageListener(): void {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        window.dispatchEvent(new CustomEvent("voteUpdated", { detail: data }));
      } catch {}
    }
  });
}

// 주기적으로 localStorage 확인 (폴링 방식 - 폰과 컴퓨터 간 동기화)
export function startPolling(interval: number = 1000): () => void {
  let lastData = JSON.stringify(getVoteData());
  const timer = setInterval(() => {
    const currentData = JSON.stringify(getVoteData());
    if (currentData !== lastData) {
      lastData = currentData;
      window.dispatchEvent(new CustomEvent("voteUpdated", { detail: getVoteData() }));
    }
  }, interval);
  return () => clearInterval(timer);
}

export function addVote(strategyId: string): VoteData {
  const data = getVoteData();
  if (data.totalVotes >= TOTAL_VOTES) return data;
  data.totalVotes += 1;
  data.votes[strategyId] = (data.votes[strategyId] || 0) + 1;
  saveVoteData(data);
  return data;
}

// QR 투표 여부 확인
export function hasQRVoted(): boolean {
  return localStorage.getItem(QR_VOTED_KEY) === "true";
}

// QR 투표 표시
export function markQRVoted(): void {
  localStorage.setItem(QR_VOTED_KEY, "true");
}
