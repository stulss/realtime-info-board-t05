import { describe, expect, it } from "vitest";
import type { WidgetPayload } from "@/types/widget";
import { toDataStatus } from "./freshness";

const fetchedAt = "2026-08-29T00:00:00.000Z";
const base: WidgetPayload = {
  value: { headline: "정상값" },
  status: "ok",
  source: { provider: "test", docsUrl: "#", endpointTemplate: "/test" },
  fetchedAt,
  cacheAgeMs: 0,
};

describe("toDataStatus", () => {
  it("정상값을 fresh로 투영하고 경과 시간을 매초 계산한다", () => {
    expect(toDataStatus(base, Date.parse(fetchedAt) + 1_000)).toMatchObject({
      dataStatus: "fresh",
      ageSeconds: 1,
      lastGoodAt: fetchedAt,
    });
    expect(toDataStatus(base, Date.parse(fetchedAt) + 2_000).ageSeconds).toBe(2);
  });

  it("마지막 정상값이 있는 실패를 stale로 투영한다", () => {
    expect(toDataStatus({
      ...base,
      status: "stale",
      lastError: { kind: "timeout", message: "timeout", occurredAt: fetchedAt },
    }, Date.parse(fetchedAt))).toMatchObject({
      dataStatus: "stale",
      reasonText: expect.stringContaining("업데이트 지연"),
    });
  });

  it("표시할 값이 없으면 unavailable로 투영한다", () => {
    expect(toDataStatus({ ...base, value: null, status: "error", fetchedAt: "" }, Date.now()))
      .toMatchObject({ dataStatus: "unavailable", ageSeconds: 0, lastGoodAt: null });
  });
});
