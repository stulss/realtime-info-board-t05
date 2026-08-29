import type { DataStatus } from "@/types/widget";

type FreshnessBadgeProps = {
  dataStatus: DataStatus;
  ageSeconds: number;
  lastGoodAt: string | null;
  reasonText: string | null;
};

const ICONS: Record<DataStatus, string> = {
  fresh: "●",
  stale: "◷",
  unavailable: "×",
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function FreshnessBadge({ dataStatus, ageSeconds, lastGoodAt, reasonText }: FreshnessBadgeProps) {
  const detail = dataStatus === "fresh"
    ? `업데이트 ${lastGoodAt ? formatTime(lastGoodAt) : "시각 미제공"}`
    : dataStatus === "stale"
      ? `마지막 정상 ${lastGoodAt ? formatTime(lastGoodAt) : "시각 미제공"} · 경과 ${ageSeconds}s`
      : "데이터를 가져오지 못했습니다";

  return (
    <div className="freshness-badge" data-status={dataStatus} aria-label={`상태: ${dataStatus}`}>
      <strong><span aria-hidden="true">{ICONS[dataStatus]}</span> {dataStatus}</strong>
      <span>{detail}</span>
      {reasonText && <small>{reasonText}</small>}
    </div>
  );
}
