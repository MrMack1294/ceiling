import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../hooks/useLocale", () => ({
  useLocale: () => ({ t: (key: string) => key, language: "english" }),
}));
// The FloatBar section pulls in its own bridge dependencies; it is irrelevant
// to these display-preference tests.
vi.mock("../../../floatbar", () => ({
  FloatBarSettingsSection: () => null,
}));

import DisplayTab from "./DisplayTab";
import type { SettingsSnapshot } from "../../../types/bridge";

const baseSettings = {
  switcherShowsIcons: false,
  menuBarShowsHighestUsage: false,
  menuBarShowsPercent: false,
  menuBarDisplayMode: "detailed",
  windowScalePercent: 100,
  taskbarTextScalePercent: 100,
  showAsUsed: false,
  showAllTokenAccountsInMenu: false,
  resetTimeRelative: false,
  showResetWhenExhausted: false,
} as unknown as SettingsSnapshot;

function renderTab(
  set: (patch: Record<string, unknown>) => void,
  settings: SettingsSnapshot = baseSettings,
) {
  return render(
    <DisplayTab settings={settings} set={set as never} saving={false} />,
  );
}

describe("DisplayTab", () => {
  it("does not expose the unused token-account display setting", () => {
    renderTab(vi.fn());
    expect(screen.queryByText("ShowAllTokenAccountsLabel")).not.toBeInTheDocument();
  });

  it("restores a 100–200 percent window scale slider", () => {
    const set = vi.fn();
    renderTab(set);

    const slider = screen.getByRole("slider", { name: "WindowScaleAriaLabel" });
    expect(slider).toHaveAttribute("min", "100");
    expect(slider).toHaveAttribute("max", "200");
    expect(slider).toHaveValue("100");
    expect(screen.getByText("WindowScaleLabel")).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "150" } });
    fireEvent.pointerUp(slider);

    expect(set).toHaveBeenCalledWith({ windowScalePercent: 150 });
  });

  it("keeps taskbar text scale independent of the window scale slider", () => {
    const set = vi.fn();
    renderTab(set);

    const slider = screen.getByRole("slider", { name: "TaskbarTextScaleAriaLabel" });
    expect(slider).toHaveAttribute("min", "100");
    expect(slider).toHaveAttribute("max", "200");
    expect(slider).toHaveValue("100");

    fireEvent.change(slider, { target: { value: "175" } });
    fireEvent.pointerUp(slider);

    expect(set).toHaveBeenCalledWith({ taskbarTextScalePercent: 175 });
    expect(set).not.toHaveBeenCalledWith(
      expect.objectContaining({ windowScalePercent: expect.any(Number) }),
    );
  });

  it("leaves a stored window scale above 200 percent until the slider moves", () => {
    const set = vi.fn();
    renderTab(set, { ...baseSettings, windowScalePercent: 250 });

    const slider = screen.getByRole("slider", { name: "WindowScaleAriaLabel" });
    expect(slider).toHaveValue("200");
    fireEvent.pointerUp(slider);
    expect(set).not.toHaveBeenCalled();

    fireEvent.change(slider, { target: { value: "180" } });
    fireEvent.pointerUp(slider);
    expect(set).toHaveBeenCalledWith({ windowScalePercent: 180 });
  });

  it("updates the exhausted reset display preference", () => {
    const set = vi.fn();
    renderTab(set);

    fireEvent.click(screen.getByRole("checkbox", { name: "ShowResetWhenExhausted" }));

    expect(set).toHaveBeenCalledWith({ showResetWhenExhausted: true });
  });
});
