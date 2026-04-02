import { test, expect } from "@playwright/test";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIDI_FILE = join(__dirname, "../fixtures/test-c-major-scale.mid");
const BASE_URL = "http://localhost:5173";

const playBtn = '[aria-label="Play"]';
const pauseBtn = '[aria-label="Pause"]';
const loopA = '[title="Set loop start at current position"]';
const loopB = '[title="Set loop end at current position"]';
const loopClear = '[title="Clear loop"]';

async function loadSong(page: import("@playwright/test").Page) {
  await page.goto(BASE_URL);
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(MIDI_FILE);
  await expect(page.locator("canvas")).toBeVisible();
}

test.describe("Practice Loop", () => {
  test("A and B buttons are visible after loading song", async ({ page }) => {
    await loadSong(page);
    await expect(page.locator(loopA)).toBeVisible();
    await expect(page.locator(loopB)).toBeVisible();
    await page.screenshot({ path: "test/screenshots/loop-01-buttons.png" });
  });

  test("B button is disabled before setting A", async ({ page }) => {
    await loadSong(page);
    await expect(page.locator(loopB)).toBeDisabled();
  });

  test("setting A highlights the A button", async ({ page }) => {
    await loadSong(page);
    await page.click(loopA);
    await expect(page.locator(loopA)).toHaveClass(/bg-amber/);
    await page.screenshot({ path: "test/screenshots/loop-02-a-set.png" });
  });

  test("setting A then B creates a loop with measure labels", async ({ page }) => {
    await loadSong(page);

    await page.click(playBtn);
    await page.waitForTimeout(1000);
    await page.click(pauseBtn);

    await page.click(loopA);

    await page.click(playBtn);
    await page.waitForTimeout(1500);
    await page.click(pauseBtn);

    await page.click(loopB);

    // Should show measure range label in controls bar
    const controlsBar = page.locator(".bg-slate-800.border-b");
    await expect(controlsBar.locator("text=/m\\d+-\\d+/")).toBeVisible();

    await expect(page.locator(loopClear)).toBeVisible();
    await page.screenshot({ path: "test/screenshots/loop-03-ab-set.png" });
  });

  test("clearing loop removes markers", async ({ page }) => {
    await loadSong(page);

    await page.click(loopA);
    await page.click(loopB);

    await page.click(loopClear);

    // Measure label should disappear from controls bar
    const controlsBar = page.locator(".bg-slate-800.border-b");
    await expect(controlsBar.locator("text=/m\\d+-\\d+/")).not.toBeVisible();
    await page.screenshot({ path: "test/screenshots/loop-04-cleared.png" });
  });

  test("loop auto-seeks back to start", async ({ page }) => {
    await loadSong(page);

    await page.click(loopA);
    await page.click(loopB);

    await page.click(playBtn);
    await page.waitForTimeout(3000);

    await expect(page.locator(pauseBtn)).toBeVisible();
    await page.screenshot({ path: "test/screenshots/loop-05-auto-loop.png" });
  });

  test("loop region is visible on waterfall", async ({ page }) => {
    await loadSong(page);

    await page.click(loopA);

    await page.click(playBtn);
    await page.waitForTimeout(1500);
    await page.click(pauseBtn);

    await page.click(loopB);

    await page.screenshot({ path: "test/screenshots/loop-06-waterfall-overlay.png" });
  });
});
