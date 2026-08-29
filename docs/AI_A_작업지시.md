# AI A (Codex) 실행 지시서 — T05 신선도 배지

> law.md 기준 Codex 역할 = Primary Implementer. 이 문서는 AI A 세션의 작업 범위다.
> 상세 설계는 `docs/01_기획.md`, 동결 계약은 `docs/T05_고정검사_및_상한.md`.

## 상한 (엄수)
- 작업 시간 15분 / 프롬프트·호출 10회. 시작·종료 시각과 실제 사용량을 `docs/04_작업_기록.md` 에 기록.

## 시작 상태
- 브랜치 `feature/t05-freshness-badge`, 시작 커밋 `96d2048`.
- 기존 코드: `WidgetPayload`(6-값 status), `displayPayloadAfterFailure()`(이전 값 유지+stale), `/api/verification/failure` 장애 API, `useSyncExternalStore` 1초 클록.

## AI A 목표 (이번 세션에서 여기까지)
1. `src/types/widget.ts`: `export type DataStatus = "fresh" | "stale" | "unavailable";` 추가.
2. `src/lib/client/freshness.ts` (신규) + `freshness.test.ts`:
   - `toDataStatus(payload: WidgetPayload, now: number): { dataStatus: DataStatus; ageSeconds: number; lastGoodAt: string | null; reasonText: string | null }`
   - 규칙: `value && status==="ok"` → fresh · `value && (status==="stale"||status==="rate_limited")` → stale · `!value` → unavailable
   - `ageSeconds = lastGoodAt ? Math.floor((now - Date.parse(lastGoodAt))/1000) : 0`
   - `lastGoodAt = payload.sourceTimestamp ?? payload.fetchedAt || null`
   - `reasonText`: `lastError.kind` 로 분기 (unauthorized/rate_limited/timeout 문구는 `docs/01_기획.md` §4)
   - 단위 테스트로 fresh/stale/unavailable 3분기 + ageSeconds 증가 검증.
3. `src/components/freshness-badge.tsx` (신규):
   - props `{ dataStatus, ageSeconds, lastGoodAt, reasonText }`
   - 아이콘+텍스트: fresh `● fresh`, stale `◷ stale`, unavailable `× unavailable` — 가시 텍스트에 상태어 포함, `aria-label={`상태: ${dataStatus}`}` (C09)
   - fresh: "업데이트 HH:MM:SS" · stale: "마지막 정상 HH:MM:SS · 경과 {ageSeconds}s" + reasonText · unavailable: "데이터를 가져오지 못했습니다"
   - 색상 클래스는 `data-status` 속성으로만, 정보는 텍스트로.
4. `src/components/dashboard.tsx`: `<header className="topbar">` 우측에 `<FreshnessBadge>` 마운트. 정상 경로에서 `fresh` 가 뜨는 것까지 확인.
5. 여기까지 커밋: `feat(t05): freshness badge fresh-state rendering`.

## AI A가 남길 것 (세션 종료 직전, 필수)
- `docs/02_인수인계_문서.md` 7항목 실제 상태로 채우기 (특히 §6 다음 행동: "simulate 장애 분기 catch에서 displayPayloadAfterFailure로 이전 값 유지 + 배지 stale/unavailable 매핑, tests/e2e/t05-freshness.spec.ts 작성").
- `docs/04_작업_기록.md` AI A 칸 (시각·요약·커밋 해시·실측 분/회).
- 배지 fresh 상태 스크린샷 1장 → `docs/검증스크린샷/<UTC>/`.
- 종료 커밋 해시를 `docs/02`·`docs/04` 에 기입.

## AI A가 하지 말 것
- `src/app/api/widgets/**`, `src/app/api/verification/failure/route.ts`, `tests/e2e/dashboard.spec.ts`, `docs/T05_고정검사_및_상한.md` 수정.
- 기존 단위 테스트 assertion·기대값 변경.
- simulate 장애 분기·E2E 스펙까지 완성 (그건 AI B 몫 — 인계 실험의 핵심).

## 검증
- `npm run lint && npm run typecheck && npm test` 통과 후 커밋.

## 주의 (AI B에게도 전달)
- `src/app/page.tsx` 는 `<Dashboard/>` 만 렌더한다. Next App Router에서 `useSearchParams()` 는 Suspense 경계가 필요하므로,
  `use-simulate.ts` 는 `useSearchParams` 대신 **`useEffect` + `window.location.search`** 로 읽는 편이 빌드 에러 없이 간단하다.
  `useSearchParams` 를 쓰려면 `page.tsx` 에서 `<Suspense>` 로 감싸야 한다.
