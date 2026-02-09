"use client";

import { useState } from "react";

export interface PileParams {
  canvasWidth: number;
  tightness: number;
  scatter: number;
  rotation: number;
  photoSize: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
  stagger: number;
}

export const defaultPileParams: PileParams = {
  canvasWidth: 80,
  tightness: 0,
  scatter: 15,
  rotation: 35,
  photoSize: 15,
  canvasHeight: 8,
  offsetX: 0,
  offsetY: 0,
  stagger: 30,
};

interface SliderDef {
  key: keyof PileParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const sliders: SliderDef[] = [
  { key: "canvasWidth", label: "Canvas width", min: 20, max: 100, step: 1 },
  { key: "tightness", label: "Tightness", min: 0, max: 100, step: 1 },
  { key: "scatter", label: "Scatter", min: 0, max: 50, step: 1 },
  { key: "rotation", label: "Rotation", min: 0, max: 45, step: 1 },
  { key: "photoSize", label: "Photo size", min: 8, max: 35, step: 1 },
  { key: "canvasHeight", label: "Canvas height", min: 3, max: 20, step: 1 },
  { key: "offsetX", label: "Offset X", min: -30, max: 30, step: 1 },
  { key: "offsetY", label: "Offset Y", min: -20, max: 20, step: 1 },
  { key: "stagger", label: "Stagger", min: 0, max: 100, step: 5 },
];

interface PileControlsProps {
  values: PileParams;
  onChange: (params: PileParams) => void;
  variant: "light" | "dark";
  onReshuffle?: () => void;
  onSaveConfig?: () => void;
}

export function PileControls({ values, onChange, variant, onReshuffle, onSaveConfig }: PileControlsProps) {
  const [open, setOpen] = useState(false);

  const isLight = variant === "light";
  const bg = isLight ? "rgba(242,236,227,0.95)" : "rgba(42,37,32,0.95)";
  const border = isLight ? "rgba(160,151,137,0.3)" : "rgba(138,126,114,0.3)";
  const text = isLight ? "#6b5e52" : "#c4b8a8";
  const textMuted = isLight ? "#a09789" : "#8a7e72";
  const accent = isLight ? "#8b5e5e" : "#d4c8b8";

  return (
    <div className="fixed top-4 right-4 z-[60]" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110"
          style={{ background: bg, border: `1px solid ${border}`, color: text }}
          aria-label="Open pile controls"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      )}

      {open && (
        <div
          className="rounded-lg backdrop-blur-sm p-4 w-[280px] shadow-lg"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: textMuted }}>
              Pile controls
            </span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
              style={{ color: textMuted }}
              aria-label="Close pile controls"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {sliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px]" style={{ color: text }}>
                    {s.label}
                  </label>
                  <span className="text-[11px] tabular-nums" style={{ color: accent }}>
                    {values[s.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={values[s.key]}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChange({ ...values, [s.key]: Math.round(val * 10) / 10 });
                  }}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${accent} ${((values[s.key] - s.min) / (s.max - s.min)) * 100}%, ${border} ${((values[s.key] - s.min) / (s.max - s.min)) * 100}%)`,
                    accentColor: accent,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {onReshuffle && (
              <button
                onClick={onReshuffle}
                className="flex-1 text-[11px] uppercase tracking-wider py-1.5 rounded transition-opacity hover:opacity-70"
                style={{ color: textMuted, border: `1px solid ${border}` }}
              >
                Reshuffle
              </button>
            )}
            {onSaveConfig && (
              <button
                onClick={onSaveConfig}
                className="flex-1 text-[11px] uppercase tracking-wider py-1.5 rounded transition-opacity hover:opacity-70"
                style={{ color: textMuted, border: `1px solid ${border}` }}
              >
                Save
              </button>
            )}
          </div>
          <button
            onClick={() => onChange({ ...defaultPileParams })}
            className="mt-2 w-full text-[11px] uppercase tracking-wider py-1.5 rounded transition-opacity hover:opacity-70"
            style={{ color: textMuted, border: `1px solid ${border}` }}
          >
            Reset defaults
          </button>
        </div>
      )}
    </div>
  );
}
