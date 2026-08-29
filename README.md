# realtime-info-board-t05 — 데이터 신선도 상태 배지

과제 4 실시간 정보판(`realtime-info-board-t04`) 위에, 데이터가 늦거나 실패해도
**마지막 정상값을 유지한 채** 화면 우측 상단에 신선도 상태 배지(`fresh` / `stale` / `unavailable`)와
경과 시간(`ageSeconds`)을 표시하는 기능을 추가한 프로젝트입니다.

- 시작 소스: `github.com/stulss/realtime-info-board-t04` `main` (커밋 `96d2048`)
- 작업 브랜치: `feature/t05-freshness-badge`
- 진행 방식: AI A → 인계 문서 → AI B (대화 전문 없이 저장소만으로 이어받아 완성)
- 공개 소스: `https://github.com/stulss/realtime-info-board-t05`
- 최종 Vercel URL: `https://realtime-info-board-t05.vercel.app/`

## 빠른 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

장애 재현: 주소창에 `?simulate=timeout` / `?simulate=auth` / `?simulate=ratelimit` / `?simulate=empty` 추가.

## 검증 명령

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e
```

## 문서 색인

| 문서 | 용도 |
|---|---|
| [작업내역_체크리스트.md](작업내역_체크리스트.md) | **SSOT** — 진행 상황·결정·다음 작업자 프롬프트 |
| [docs/T05_고정검사_및_상한.md](docs/T05_고정검사_및_상한.md) | 동결된 고정 검사 10개(T05-C01~C10)·공통 상한 (변경 금지) |
| [docs/01_기획.md](docs/01_기획.md) | 신선도 배지 아키텍처·데이터 계약·컴포넌트 변경 |
| [docs/00_과제_요구사항_매핑.md](docs/00_과제_요구사항_매핑.md) | 고정 검사 1:1 + 과제 5 루브릭 5카드(T05-C01~C53) |
| [docs/검증안내서.md](docs/검증안내서.md) | 3단계 육안 검증 절차 + 스크린샷 정책 |
| [docs/AI_A_작업지시.md](docs/AI_A_작업지시.md) | Codex(AI A) 구현 지시서 |
| [docs/02_인수인계_문서.md](docs/02_인수인계_문서.md) | AI A → AI B 7항목 인계 (AI A가 종료 시 작성) |
| [docs/03_최종_보고서_및_비교.md](docs/03_최종_보고서_및_비교.md) | 제출 보고서·AI A/B 익명 비교표 |
| [docs/04_작업_기록.md](docs/04_작업_기록.md) | 세션 타임라인·커밋 해시·실측 상한 |
| [docs/05_배포.md](docs/05_배포.md) | 배포 절차 |
| [docs/트러블슈팅.md](docs/트러블슈팅.md) · [docs/AI_3줄.md](docs/AI_3줄.md) · [docs/포트폴리오_추가용_소개글.md](docs/포트폴리오_추가용_소개글.md) | 공통 문서 |
| `docs/T04_*.md` | 과제 4 시절 문서·보고서 보존본 |

## 안전한 호출 경로

외부 원자료 호출은 Next.js Route Handler(`src/app/api/widgets/*`)를 통해 서버에서만 수행합니다.
T05 변경은 **클라이언트 렌더링 단**에만 적용하며 외부 API·DB 코드는 수정하지 않습니다.

## 프로젝트 구조 (T05 추가분 표시)

```text
src/app/api/widgets/          공개 데이터 Route Handler        (수정 금지)
src/app/api/verification/     합성 장애 검증 API               (재사용만)
src/components/               대시보드·위젯·검증 UI
  freshness-badge.tsx         [T05 신규] 상단 상태 배지
src/lib/client/
  widget-state.ts             기존 실패 처리 (displayPayloadAfterFailure 재사용)
  freshness.ts                [T05 신규] toDataStatus() 순수 함수
  clock.ts                    [T05 신규] 1초 단위 공용 클록 (useSyncExternalStore)
  use-simulate.ts             [T05 신규] ?simulate= 파라미터 훅
tests/e2e/
  dashboard.spec.ts           기존 (수정 금지)
  t05-freshness.spec.ts       [T05 신규] 배지 UI 검증
docs/검증스크린샷/<UTC>/       덮어쓰기 방지 증거 폴더
```
