import { useEffect, useState } from "react";
import type { WidgetFailureKind } from "@/types/widget";

/**
 * `?simulate=` 로 재현할 장애 계획.
 * `kind`는 기존 `/api/verification/failure` 라우트가 이미 지원하는 값만 사용한다(라우트 무수정).
 * timeout은 라우트가 750ms 지연 후 정상 응답하므로, 짧은 `timeoutMs`로 실제 abort를 유도한다.
 */
export const SIMULATE_PLANS = {
  timeout: { kind: "timeout", timeoutMs: 200, keepPrevious: true },
  auth: { kind: "unauthorized", timeoutMs: 8_000, keepPrevious: true },
  ratelimit: { kind: "rate_limited", timeoutMs: 8_000, keepPrevious: true },
  empty: { kind: "offline", timeoutMs: 8_000, keepPrevious: false },
} as const satisfies Record<string, { kind: WidgetFailureKind; timeoutMs: number; keepPrevious: boolean }>;

export type SimulateKey = keyof typeof SIMULATE_PLANS;

function parseSimulate(search: string): SimulateKey | null {
  const requested = new URLSearchParams(search).get("simulate");
  return requested && requested in SIMULATE_PLANS ? (requested as SimulateKey) : null;
}

/**
 * 주소의 `?simulate=timeout|auth|ratelimit|empty` 를 읽는다.
 * 서버 렌더 결과와 어긋나지 않도록 마운트 후 useEffect에서만 읽는다.
 */
export function useSimulate(): SimulateKey | null {
  const [simulate, setSimulate] = useState<SimulateKey | null>(null);

  useEffect(() => {
    const sync = () => setSimulate(parseSimulate(window.location.search));
    // 초기 1회 동기화 + 뒤로/앞으로 이동 시 재동기화.
    const initial = window.setTimeout(sync, 0);
    window.addEventListener("popstate", sync);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return simulate;
}
