import type { DataStatus, WidgetPayload } from "@/types/widget";

export type FreshnessState = {
  dataStatus: DataStatus;
  ageSeconds: number;
  lastGoodAt: string | null;
  reasonText: string | null;
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function toDataStatus(payload: WidgetPayload, now: number): FreshnessState {
  const lastGoodAt = payload.sourceTimestamp ?? (payload.fetchedAt || null);
  const ageSeconds = lastGoodAt
    ? Math.floor((now - Date.parse(lastGoodAt)) / 1_000)
    : 0;
  const dataStatus: DataStatus = !payload.value
    ? "unavailable"
    : payload.status === "ok"
      ? "fresh"
      : "stale";

  let reasonText: string | null = null;
  if (payload.lastError?.kind === "unauthorized") {
    reasonText = "권한 오류(401/403)로 갱신 중지";
  } else if (payload.lastError?.kind === "rate_limited") {
    reasonText = "호출 제한 — 다음 갱신 대기 중";
  } else if (payload.lastError && lastGoodAt) {
    reasonText = `업데이트 지연 — 마지막 정상 수신 ${formatTime(lastGoodAt)}`;
  }

  return { dataStatus, ageSeconds, lastGoodAt, reasonText };
}
