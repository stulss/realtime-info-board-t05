import { expect, test, type Page } from "@playwright/test";

const RUN_ID = process.env.SCREENSHOT_RUN_ID
  ?? new Date().toISOString().replace(/[:.]/g, "-");
const SCREENSHOT_DIR = `docs/검증스크린샷/${RUN_ID}`;

/**
 * 신선도 배지 검증은 외부 공급자 상태에 흔들리면 안 되므로
 * 배지의 원천인 `/api/widgets/status` 만 고정 응답으로 대체한다.
 * 장애 재현 경로(`/api/verification/failure`)는 실제 라우트를 그대로 쓴다.
 */
async function mockStatusWidget(page: Page) {
  await page.route("**/api/widgets/status", async (route) => {
    const fetchedAt = new Date().toISOString();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        value: { headline: "All Systems Operational", subline: "GitHub 서비스 정상" },
        status: "ok",
        source: {
          provider: "GitHub Status",
          docsUrl: "https://www.githubstatus.com/api",
          endpointTemplate: "GET /api/v2/status.json",
        },
        sourceTimestamp: fetchedAt,
        fetchedAt,
        cacheAgeMs: 0,
      }),
    });
  });
}

const badgeOf = (page: Page) => page.locator(".freshness-badge");

async function readAgeSeconds(page: Page): Promise<number> {
  const text = await badgeOf(page).innerText();
  const matched = /경과 (\d+)s/.exec(text);
  expect(matched, `배지에 경과 시간이 없습니다: ${text}`).not.toBeNull();
  return Number(matched![1]);
}

async function openDashboard(page: Page, search = "") {
  await mockStatusWidget(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`/${search}`);
}

test("T05-C01·C02·C09 정상 수신 시 fresh 배지와 갱신 시각·경과 시간을 텍스트로 표시한다", async ({ page }) => {
  await openDashboard(page);
  const badge = badgeOf(page);

  await expect(badge).toHaveAttribute("data-status", "fresh");
  // C09: 색상이 아니라 텍스트로 상태를 구분할 수 있어야 한다.
  await expect(badge).toContainText("fresh");
  await expect(badge).toHaveAttribute("aria-label", "상태: fresh");
  // C02: 마지막 정상 수신 시각(HH:MM:SS)과 경과 시간이 숫자로 보인다.
  await expect(badge).toContainText(/업데이트 \d{2}:\d{2}:\d{2}/);
  await expect(badge).toContainText(/경과 \d+s/);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/T05_01_fresh.png`, fullPage: true });
});

test("T05-C03·C04·C05 timeout 장애에서 이전 값을 유지하고 stale 배지의 경과 시간만 증가한다", async ({ page }) => {
  await openDashboard(page);
  await expect(badgeOf(page)).toHaveAttribute("data-status", "fresh");

  await openDashboard(page, "?simulate=timeout");
  const badge = badgeOf(page);
  await expect(badge).toHaveAttribute("data-status", "stale");
  // C04: 문구가 stale 로 바뀐다.
  await expect(badge).toContainText("stale");
  await expect(badge).toContainText("업데이트 지연");

  // C03: 이전 정상 데이터가 화면에서 사라지지 않는다.
  await expect(page.locator(".widget-card")).toHaveCount(5);
  await expect(page.getByText("All Systems Operational").first()).toBeVisible();

  // C05: 마지막 정상 수신 시각은 멈춰 있고 경과 시간만 증가한다.
  const lastGoodAt = /마지막 정상 (\d{2}:\d{2}:\d{2})/.exec(await badge.innerText())?.[1];
  expect(lastGoodAt).toBeTruthy();
  const before = await readAgeSeconds(page);
  await page.waitForTimeout(3_000);
  const after = await readAgeSeconds(page);
  expect(after).toBeGreaterThan(before);
  await expect(badge).toContainText(`마지막 정상 ${lastGoodAt}`);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/T05_02_stale_timeout.png`, fullPage: true });
});

test("T05-C06 auth 장애에서 stale 배지와 401/403 원인 문구를 표시한다", async ({ page }) => {
  await openDashboard(page, "?simulate=auth");
  const badge = badgeOf(page);

  await expect(badge).toHaveAttribute("data-status", "stale");
  await expect(badge).toContainText("stale");
  await expect(badge).toContainText("권한 오류(401/403)");
  await expect(page.locator(".widget-card")).toHaveCount(5);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/T05_03_stale_auth.png`, fullPage: true });
});

test("T05-C07 ratelimit 장애에서 stale 배지와 다음 갱신 대기 문구를 표시한다", async ({ page }) => {
  await openDashboard(page, "?simulate=ratelimit");
  const badge = badgeOf(page);

  await expect(badge).toHaveAttribute("data-status", "stale");
  await expect(badge).toContainText("stale");
  await expect(badge).toContainText("다음 갱신 대기 중");
  await expect(page.locator(".widget-card")).toHaveCount(5);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/T05_04_stale_ratelimit.png`, fullPage: true });
});

test("T05-C08 정상 수신 기록이 없으면 unavailable 배지와 안내 문구를 표시한다", async ({ page }) => {
  await openDashboard(page, "?simulate=empty");
  const badge = badgeOf(page);

  await expect(badge).toHaveAttribute("data-status", "unavailable");
  await expect(badge).toContainText("unavailable");
  await expect(badge).toContainText("데이터를 가져오지 못했습니다");

  await page.screenshot({ path: `${SCREENSHOT_DIR}/T05_05_unavailable.png`, fullPage: true });
});
