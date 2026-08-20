import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // localStorage ใช้ร่วมกัน ต้องรันตามลำดับ
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    storageState: undefined, // เริ่ม localStorage ว่างทุก test
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
  },
});
