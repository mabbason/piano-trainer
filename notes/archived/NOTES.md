# Chorda - Current Notes

## 1. Swap R/L Toggle Positions
**Screenshot:** `RL swap sides.png`
**Type:** Fix
**Status:** Done

L now on left, R on right (matching piano hand positions).

---

## 2. Sections Toolbar - Explained
**Screenshot:** `sections in toolbar.png`
**Type:** Understand
**Status:** Resolved

A/B are manual loop markers (snap to measure boundaries). x clears the loop. m1-4 shows loop range. Clicking a section in the sidebar auto-loops to it. Separate from the A/B manual looping.

---

## 3. "Mark Learned" -> Check Icon
**Screenshot:** `learned check instead.png`
**Type:** Fix
**Status:** Done

Replaced green button with: grayed check circle (unlearned, hover tooltip "Mark as Learned") / green filled check circle (learned).

---

## 4. Back Arrow Too Thin
**Screenshot:** `back arrow.png`
**Type:** Fix
**Status:** Done

Replaced thin HTML arrow with a proper SVG icon in a rounded button matching the stop button style.

---

## 5. Key Highlights Too Subtle
**Screenshot:** `keys highlights.png`
**Type:** Fix
**Status:** Done

Increased key highlight opacity from 15%/30% to 55%/65% (white/black keys). About 60-70% of waterfall strength.

---

## 6. Branding Kit Applied
**Type:** Enhancement
**Status:** Done

Full brand theme applied:
- Goldman Sans font across all UI
- Brand color palette (purple, pink, green, yellow + neutral scale)
- Logo on auth screens (passphrase, user picker, file loader)
- Custom favicons and web manifest
- Waterfall and notation renderer colors updated
- All UI components re-themed

---

## 7. Hand-Filtered Audio Playback
**Type:** Feature
**Status:** Done

Audio now only plays tracks for the selected hand(s). Toggling R/L reschedules Tone.Transport notes while preserving playback position. Unknown-hand tracks always play.

---

## 8. Circular User Avatars
**Type:** Feature
**Status:** Done

User picker and avatar picker buttons changed from rounded rectangles to circles (w-28 h-28 rounded-full).

---

## 9. Persistent User Menu
**Type:** Feature
**Status:** Done

User icon button (top-right) with dropdown menu on all pages: Dashboard, Switch User, Logout. Closes on click-outside and Escape key. Dashboard item hidden when already on Dashboard page (onDashboard is optional). Replaced duplicate Switch User/Logout buttons in Dashboard header.

---

## 10. Code Review Fixes
**Type:** Cleanup
**Status:** Done

From code review pass:
- **usePlayback**: Fixed missing `visibleHands` dependency (uses ref instead), added mount guard to prevent double-scheduling on initial song load
- **UserPicker**: `catch (e: any)` → `catch (e: unknown)` with proper narrowing
- **Dashboard**: Removed duplicate Switch User/Logout nav, uses UserMenu instead
- **UserMenu**: Added Escape key handler for keyboard accessibility
- **Canvas renderers**: Added `// Keep in sync with src/index.css @theme` comments with token names

---

## Status Summary

All changes are **uncommitted on main**, build passes clean. Ready to commit + deploy next session.
