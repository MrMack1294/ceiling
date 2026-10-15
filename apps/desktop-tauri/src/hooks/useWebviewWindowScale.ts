import { useEffect, useMemo } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

/** Inclusive bounds of the stored `window_scale_percent` preference. */
export const WINDOW_SCALE_MIN_PERCENT = 100;
export const WINDOW_SCALE_MAX_PERCENT = 250;

/**
 * Webview zoom factor for a stored window-scale percent.
 *
 * The Display slider only offers 100–200. Values already saved up to 250
 * still apply, and anything outside the stored range pins to that range.
 */
export function windowScaleFactor(percent: number): number {
  const scalePercent = Number(percent);
  const clamped = Math.min(
    WINDOW_SCALE_MAX_PERCENT,
    Math.max(
      WINDOW_SCALE_MIN_PERCENT,
      Number.isFinite(scalePercent) ? scalePercent : WINDOW_SCALE_MIN_PERCENT,
    ),
  );
  return clamped / 100;
}

/**
 * Scale this webview with the native zoom control.
 *
 * Zoom reflows layout at the real window width. CSS `zoom` was rejected
 * because it overflows the dashboard instead of reflowing it. Reset to 1 on
 * unmount so a shared window (the tray surface, for example) is not left
 * enlarged.
 */
export function useWebviewWindowScale(percent: number): void {
  const windowScale = useMemo(() => windowScaleFactor(percent), [percent]);

  useEffect(() => {
    const webview = getCurrentWebviewWindow();
    void webview.setZoom(windowScale).catch(() => {});
    return () => {
      void webview.setZoom(1).catch(() => {});
    };
  }, [windowScale]);
}
