# AGENTS.md — realtime-info-board-t05 (OpenAI Codex 진입 지침)

> 현재 과제: **T05 — 데이터 신선도 상태 배지** (베이스: T04 커밋 `96d2048`).
> 세션 시작 시 가장 먼저 `작업내역_체크리스트.md`를 읽는다.
> 워크스페이스 전체 규칙은 `C:\Users\stuls\Desktop\Agent\law.md`. 충돌 시 law.md 우선.
> law.md 기준 이 프로젝트에서 Codex 역할 = **Primary Implementer**.

## 1. 세션 시작 시 가장 먼저 할 일
1. `작업내역_체크리스트.md` 한 파일만 먼저 읽는다.
2. AI B로 인계받았다면 `docs/02_인수인계_문서.md` 를 읽고 그대로 이어서 구현한다.
3. AI A로 시작이면 `docs/AI_A_작업지시.md` → `docs/01_기획.md` → `docs/T05_고정검사_및_상한.md`.

## 2. 절대 통째로 읽지 말 것
| 경로 | 이유 |
|---|---|
| node_modules/, .next/, dist/, build/ | 의존성·빌드 산출물 |
| .git/ | Git 내부 데이터 |
| docs/T04_*.pdf, *.pptx | 대용량 보고서 바이너리 |

## 3. 작업 유형별로 문서 하나만 읽기
| 하려는 작업 | 읽을 문서 |
|---|---|
| 구현 지시 | `docs/AI_A_작업지시.md` |
| 인계받은 작업 시작 | `docs/02_인수인계_문서.md` |
| 설계/데이터 계약 | `docs/01_기획.md` |
| 고정 검사·상한 | `docs/T05_고정검사_및_상한.md` |
| 진행 상황·다음 할 일 | `작업내역_체크리스트.md` |
| 요구사항 전체 | `docs/00_과제_요구사항_매핑.md` |

## 4. 코드 작성 시 필수 규칙
- 상한 엄수: 세션당 15분 / 프롬프트·호출 10회. 실측치를 `docs/04_작업_기록.md` 에 기록.
- 에러 대응은 클라이언트 렌더링 단에서만. `src/app/api/widgets/**`, `src/app/api/verification/failure/route.ts` 수정 금지(재사용만).
- 기존 단위 테스트·`tests/e2e/dashboard.spec.ts`·`docs/T05_고정검사_및_상한.md` 의 기대값을 바꾸지 않는다.
- 파일을 통째로 다시 쓰지 않는다.
- 세션 종료 직전 `docs/02_인수인계_문서.md`·`docs/04_작업_기록.md`·스크린샷을 갱신하고 커밋으로 남긴다.

## 5. 완료 보고
law.md 10장 표준 템플릿을 그대로 사용하고, 보고 후 `작업내역_체크리스트.md` §6 "다음 작업자에게" 를 갱신한다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
