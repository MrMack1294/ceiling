import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWebviewWindowScale, windowScaleFactor } from "./useWebviewWindowScale";

const setZoom = vi.fn().mockResolvedValue(undefined);

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  getCurrentWebviewWindow: () => ({ setZoom }),
}));

function Probe({ percent }: { percent: number }) {
  useWebviewWindowScale(percent);
  return null;
}

describe("windowScaleFactor", () => {
  it("keeps the stored 100–250 percent range", () => {
    expect(windowScaleFactor(100)).toBe(1);
    expect(windowScaleFactor(175)).toBe(1.75);
    expect(windowScaleFactor(250)).toBe(2.5);
    expect(windowScaleFactor(50)).toBe(1);
    expect(windowScaleFactor(300)).toBe(2.5);
    expect(windowScaleFactor(Number.NaN)).toBe(1);
  });
});

describe("useWebviewWindowScale", () => {
  it("applies native webview zoom and resets it on unmount", async () => {
    setZoom.mockClear();
    const view = render(<Probe percent={175} />);

    await waitFor(() => {
      expect(setZoom).toHaveBeenCalledWith(1.75);
    });

    view.unmount();
    expect(setZoom).toHaveBeenCalledWith(1);
  });

  it("still zooms a stored value above the 200 percent slider", async () => {
    setZoom.mockClear();
    render(<Probe percent={250} />);

    await waitFor(() => {
      expect(setZoom).toHaveBeenCalledWith(2.5);
    });
  });
});
