import { useRef, useEffect, useCallback } from "react";
import type { Song } from "../models/song";
import type { LoopRange } from "../utils/loop";
import { render, VIEWPORT_AHEAD_SEC, VIEWPORT_BEHIND_SEC } from "../renderer/waterfall-renderer";

const TOTAL_VIEW_SEC = VIEWPORT_AHEAD_SEC + VIEWPORT_BEHIND_SEC;
const KEYBOARD_HEIGHT_RATIO = 0.2;

interface Props {
  song: Song;
  getCurrentTime: () => number;
  getState: () => string;
  visibleHands: Set<string>;
  loop: LoopRange | null;
  onSeek: (time: number) => void;
}

export function WaterfallCanvas({ song, getCurrentTime, getState, visibleHands, loop, onSeek }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartTimeRef = useRef(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const animate = () => {
      const currentTime = getCurrentTime();

      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      const virtualCanvas = {
        width: logicalWidth,
        height: logicalHeight,
      } as HTMLCanvasElement;

      render(ctx, virtualCanvas, song, currentTime, visibleHands, loop);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [song, getCurrentTime, getState, visibleHands, loop]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const waterfallHeight = rect.height * (1 - KEYBOARD_HEIGHT_RATIO);

    if (clickY >= waterfallHeight) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const currentTime = getCurrentTime();
    const timeAtClick = currentTime + VIEWPORT_AHEAD_SEC - (clickY / waterfallHeight) * TOTAL_VIEW_SEC;
    const seekTime = Math.max(0, Math.min(song.durationSec, timeAtClick));

    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartTimeRef.current = seekTime;

    canvas.style.cursor = "grabbing";
    onSeek(seekTime);
  }, [getCurrentTime, song.durationSec, onSeek]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const waterfallHeight = rect.height * (1 - KEYBOARD_HEIGHT_RATIO);

    const deltaY = e.clientY - dragStartYRef.current;
    const newTime = dragStartTimeRef.current - (deltaY * TOTAL_VIEW_SEC / waterfallHeight);
    const seekTime = Math.max(0, Math.min(song.durationSec, newTime));

    onSeek(seekTime);
  }, [song.durationSec, onSeek]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = "grab";
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ background: "#141922", cursor: "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
