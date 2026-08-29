import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    // URL.pathname 은 비ASCII 경로(과제5)를 퍼센트 인코딩해 별칭 해석이 깨진다. fileURLToPath 로 디코딩한다.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
