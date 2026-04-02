import { test, expect } from "@playwright/test";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIDI_FILE = join(__dirname, "../fixtures/test-c-major-scale.mid");
const BASE_URL = "http://localhost:5173";

const playBtn = '[aria-label="Play"]';
const pauseBtn = '[aria-label="Pause"]';

async function loadSong(page: import("@playwright/test").Page) {
  await page.goto(BASE_URL);
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(MIDI_FILE);
  await expect(page.locator("canvas").first()).toBeVisible();
}

test.describe("Notation Panel", () => {
  test("notation chevron is visible and toggles panel", async ({ page }) => {
    await loadSong(page);

    // Chevron toggle should be visible
    const toggle = page.locator("text=Notation");
    await expect(toggle).toBeVisible();

    // Panel should be collapsed by default (only 1 canvas = waterfall)
    const canvases = page.locator("canvas");
    await expect(canvases).toHaveCount(1);

    // Click to expand
    await toggle.click();

    // Now 2 canvases (waterfall + notation)
    await expect(canvases).toHaveCount(2);

    await page.screenshot({ path: "test/screenshots/notation-01-expanded.png" });

    // Click to collapse
    await toggle.click();
    await expect(canvases).toHaveCount(1);
  });

  test("notation shows notes during playback", async ({ page }) => {
    await loadSong(page);

    // Expand notation
    await page.locator("text=Notation").click();

    // Start playback
    await page.click(playBtn);
    await page.waitForTimeout(1500);
    await page.click(pauseBtn);

    await page.screenshot({ path: "test/screenshots/notation-02-playing.png" });
  });

  test("notation works with Bella's Lullaby", async ({ page }) => {
    await page.goto(BASE_URL);
    const bellaFile = join(__dirname, "../fixtures/bellas-lullaby.mid");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(bellaFile);
    await expect(page.locator("canvas").first()).toBeVisible();

    await page.locator("text=Notation").click();

    await page.click(playBtn);
    await page.waitForTimeout(2000);
    await page.click(pauseBtn);

    await page.screenshot({ path: "test/screenshots/notation-03-bellas.png" });
  });
});
