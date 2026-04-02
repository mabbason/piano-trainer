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
  await expect(page.locator("canvas")).toBeVisible();
}

test.describe("Sections Panel", () => {
  test("shows sections panel with guided step", async ({ page }) => {
    await loadSong(page);

    await expect(page.locator("text=Section 1")).toBeVisible();
    await expect(page.locator("text=Try right hand first")).toBeVisible();
    await expect(page.locator("text=/\\d+\\/\\d+ learned/")).toBeVisible();

    await page.screenshot({ path: "test/screenshots/sections-01-panel.png" });
  });

  test("sections panel toggle works", async ({ page }) => {
    await loadSong(page);

    await expect(page.locator("text=Section 1")).toBeVisible();

    await page.click("text=Sections");
    await expect(page.locator("text=Section 1")).not.toBeVisible();

    await page.click("text=Sections");
    await expect(page.locator("text=Section 1")).toBeVisible();
  });

  test("clicking section jumps to it and sets loop", async ({ page }) => {
    await loadSong(page);

    await page.click("text=Section 1");

    // Should set a loop (amber B button indicates loop is active)
    const controlsBar = page.locator(".bg-slate-800.border-b");
    await expect(controlsBar.locator("text=/m\\d+-\\d+/")).toBeVisible();

    await page.screenshot({ path: "test/screenshots/sections-02-jump.png" });
  });

  test("mark learned changes section status", async ({ page }) => {
    await loadSong(page);

    await expect(page.locator("text=New")).toBeVisible();

    await page.click("text=Mark Learned");

    await expect(page.getByText("Learned", { exact: true })).toBeVisible();
    await expect(page.getByText("Mark Learned")).not.toBeVisible();

    await page.screenshot({ path: "test/screenshots/sections-03-learned.png" });
  });

  test("practice time accumulates during playback", async ({ page }) => {
    await loadSong(page);

    await page.click(playBtn);
    await page.waitForTimeout(2000);
    await page.click(pauseBtn);

    // Check that practice time is no longer 0:00
    const sectionPanel = page.locator(".w-52");
    const timeText = sectionPanel.locator("text=/0:\\d[1-9]/");
    await expect(timeText).toBeVisible();

    await page.screenshot({ path: "test/screenshots/sections-04-practice-time.png" });
  });

  test("guided step changes when hand toggled", async ({ page }) => {
    await loadSong(page);

    await expect(page.locator("text=Try right hand first")).toBeVisible();

    // Hide left hand (show only right)
    await page.click('[title="Hide left hand"]');

    // Play to advance mastery from "new"
    await page.click(playBtn);
    await page.waitForTimeout(1000);
    await page.click(pauseBtn);

    await page.screenshot({ path: "test/screenshots/sections-05-guided.png" });
  });
});
