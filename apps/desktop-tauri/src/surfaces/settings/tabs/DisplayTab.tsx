import { useEffect, useRef, useState } from "react";
import { useLocale } from "../../../hooks/useLocale";
import { Field, Toggle } from "../../../components/FormControls";
import { formatLocale } from "../../../lib/formatLocale";
import type { TabProps } from "../../Settings";
import { FloatBarSettingsSection } from "../../../floatbar";

/** User-facing slider range. Stored window scale still accepts 100–250. */
const SCALE_SLIDER_MIN = 100;
const SCALE_SLIDER_MAX = 200;
const SCALE_SLIDER_STEP = 5;

function clampSliderPercent(value: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return SCALE_SLIDER_MIN;
  return Math.min(SCALE_SLIDER_MAX, Math.max(SCALE_SLIDER_MIN, Math.round(numeric)));
}

function ScaleSlider({
  labelKey,
  helperKey,
  ariaKey,
  value,
  disabled,
  onCommit,
}: {
  labelKey: "WindowScaleLabel" | "TaskbarTextScaleLabel";
  helperKey: "WindowScaleHelper" | "TaskbarTextScaleHelper";
  ariaKey: "WindowScaleAriaLabel" | "TaskbarTextScaleAriaLabel";
  value: number;
  disabled: boolean;
  onCommit: (next: number) => void;
}) {
  const { t } = useLocale();
  const [draft, setDraft] = useState(() => clampSliderPercent(value));
  const draftRef = useRef(draft);
  const changedRef = useRef(false);
  draftRef.current = draft;

  useEffect(() => {
    setDraft(clampSliderPercent(value));
    changedRef.current = false;
  }, [value]);

  const commit = () => {
    if (!changedRef.current) return;
    const next = clampSliderPercent(draftRef.current);
    if (next === value) return;
    onCommit(next);
  };

  return (
    <Field
      label={formatLocale(t(labelKey), String(draft))}
      description={t(helperKey)}
    >
      <input
        type="range"
        min={SCALE_SLIDER_MIN}
        max={SCALE_SLIDER_MAX}
        step={SCALE_SLIDER_STEP}
        value={draft}
        disabled={disabled}
        aria-label={t(ariaKey)}
        onChange={(event) => {
          changedRef.current = true;
          setDraft(clampSliderPercent(Number(event.target.value)));
        }}
        onPointerUp={commit}
        onTouchEnd={commit}
        onBlur={commit}
        onKeyUp={commit}
      />
    </Field>
  );
}

export default function DisplayTab({
  mode = "menu",
  settings,
  set,
  saving,
}: TabProps & { mode?: "menu" }) {
  const { t } = useLocale();
  return (
    <>
      {/* ── Menu content ─────────────────────────────────────────── */}
      {mode === "menu" && <section className="settings-section">
        <h3 className="settings-section__title">{t("TabMenu")}</h3>
        <div className="settings-section__group">
          <ScaleSlider
            labelKey="WindowScaleLabel"
            helperKey="WindowScaleHelper"
            ariaKey="WindowScaleAriaLabel"
            value={settings.windowScalePercent}
            disabled={saving}
            onCommit={(windowScalePercent) => set({ windowScalePercent })}
          />
          <ScaleSlider
            labelKey="TaskbarTextScaleLabel"
            helperKey="TaskbarTextScaleHelper"
            ariaKey="TaskbarTextScaleAriaLabel"
            value={settings.taskbarTextScalePercent ?? 100}
            disabled={saving}
            onCommit={(taskbarTextScalePercent) => set({ taskbarTextScalePercent })}
          />
          <Field
            label={t("ShowAsUsedLabel")}
            description={t("ShowAsUsedHelper")}
            leading
          >
            <Toggle
              checked={settings.showAsUsed}
              disabled={saving}
              onChange={(v) => set({ showAsUsed: v })}
            />
          </Field>
          <Field
            label={t("ResetTimeRelative")}
            description={t("ResetTimeRelativeHelper")}
            leading
          >
            <Toggle
              checked={settings.resetTimeRelative}
              disabled={saving}
              onChange={(v) => set({ resetTimeRelative: v })}
            />
          </Field>
          <Field
            label={t("ShowResetWhenExhausted")}
            description={t("ShowResetWhenExhaustedHelper")}
            leading
          >
            <Toggle
              checked={settings.showResetWhenExhausted}
              ariaLabel={t("ShowResetWhenExhausted")}
              disabled={saving}
              onChange={(v) => set({ showResetWhenExhausted: v })}
            />
          </Field>
        </div>
      </section>}

      {mode === "menu" && (
        <FloatBarSettingsSection settings={settings} saving={saving} set={set} />
      )}
    </>
  );
}
