"use client";

import { useState, useMemo, useCallback } from "react";
import { PileControls, defaultPileParams, type PileParams } from "@/app/components/PileControls";
import { PolaroidImage } from "@/app/components/PolaroidImage";
import type { Photo } from "@/app/lib/photos";

const themes = {
  light: {
    bg: "#f5f1eb",
    paper: "#e8e2d8",
    title: "#8b5e5e",
    muted: "#a09789",
    grainOpacity: "0.03",
    grainBlend: undefined as string | undefined,
    subtitle: "Scattered prints",
    heart: "#8b5e5e",
    heartMuted: "#8b5e5e",
    icon: "#a09789",
  },
  dark: {
    bg: "#2a2520",
    paper: "#3a3530",
    title: "#d4c8b8",
    muted: "#8a7e72",
    grainOpacity: "0.06",
    grainBlend: "soft-light" as string | undefined,
    subtitle: "Dark table",
    heart: "#d4c8b8",
    heartMuted: "#d4c8b8",
    icon: "#8a7e72",
  },
};

const aspects = ["4/5", "3/4", "1/1"] as const;

// R2 quasirandom sequence — low-discrepancy 2D points (no clusters, no gaps)
// Based on the plastic constant; gives perceptually uniform coverage
const R2_A1 = 0.7548776662466927; // 1/p where p = plastic constant
const R2_A2 = 0.5698402909980532; // 1/p^2

function frac(x: number) {
  return x - Math.floor(x);
}

// splitmix32 for random-looking values (rotation, scatter displacement, z-index)
function splitmix32(seed: number): number {
  seed = (seed + 0x9e3779b9) | 0;
  let t = seed ^ (seed >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ (t >>> 15);
  t = Math.imul(t, 0x735a2d97);
  t = t ^ (t >>> 15);
  return (t >>> 0) / 4294967296;
}

function photoHashes(index: number, themeOffset: number, seed: number) {
  const n = index + seed;
  // R2 for position — guarantees even 2D coverage
  const qx = frac(0.5 + n * R2_A1);
  const qy = frac(0.5 + n * R2_A2);
  // splitmix32 for everything else — should look random, not structured
  const base = index * 3 + themeOffset * 997 + seed * 7919;
  const h3 = splitmix32(base);     // rotation
  const h4 = splitmix32(base + 1); // scatter displacement x, z-index
  const h5 = splitmix32(base + 2); // scatter displacement y
  return { qx, qy, h3, h4, h5 };
}

interface ScatteredPileProps {
  photos: Photo[];
  theme: "light" | "dark";
}

export function ScatteredPile({ photos, theme }: ScatteredPileProps) {
  const [params, setParams] = useState<PileParams>({ ...defaultPileParams });
  const [seed, setSeed] = useState(0);
  const [dragZIndices, setDragZIndices] = useState<Record<number, number>>({});
  const t = themes[theme];
  const themeOffset = theme === "dark" ? 97 : 0;

  const handleReshuffle = () => {
    setSeed((s) => s + photos.length);
    setDragZIndices({});
  };

  const handleSaveConfig = () => {
    const config = JSON.stringify({ ...params, seed }, null, 2);
    console.log("Pile config:\n" + config);
    navigator.clipboard.writeText(config).catch(() => {});
  };

  const handleZIndexChange = useCallback((i: number, z: number) => {
    setDragZIndices((prev) => ({ ...prev, [i]: z }));
  }, []);

  const layouts = useMemo(() => {
    return photos.map((_, i) => {
      const { qx, qy, h3, h4, h5 } = photoHashes(i, themeOffset, seed);

      // R2 quasirandom base position within canvas band
      const xMargin = (100 - params.canvasWidth) / 2;
      const uniformX = xMargin + qx * params.canvasWidth;
      const uniformY = qy * 100;

      // Pull toward center by tightness factor
      const tf = params.tightness / 100;
      const tightenedX = uniformX + (50 - uniformX) * tf;
      const tightenedY = uniformY + (50 - uniformY) * tf;

      // Add scatter displacement + field offset
      const left = Math.max(-5, Math.min(90, tightenedX + (h4 - 0.5) * params.scatter * 2 + params.offsetX));
      const top = Math.max(0, Math.min(98, tightenedY + (h5 - 0.5) * params.scatter * 2 + params.offsetY));

      const rotation = (h3 - 0.5) * (params.rotation * 2);
      const z = Math.floor(h4 * 20) + 1;
      const aspect = aspects[i % 3];
      return { left, top, rotation, z, aspect };
    });
  }, [photos, themeOffset, seed, params]);

  const pileHeightVh = photos.length * params.canvasHeight;

  const mobileWidth = Math.min(50, params.photoSize * 2.6);
  const tabletWidth = Math.min(35, params.photoSize * 1.5);
  const desktopWidth = params.photoSize;

  return (
    <div
      className="min-h-screen overflow-x-hidden font-[family-name:var(--font-geist-pixel-circle)]"
      style={{ backgroundColor: t.bg }}
    >
      {/* Film grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          opacity: parseFloat(t.grainOpacity),
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          animation: "grain 8s steps(10) infinite",
          ...(t.grainBlend ? { mixBlendMode: t.grainBlend as "soft-light" } : {}),
        }}
      />

      {/* Pile controls */}
      <PileControls values={params} onChange={setParams} variant={theme} onReshuffle={handleReshuffle} onSaveConfig={handleSaveConfig} />

      {/* Header */}
      <header className="min-h-[85vh] flex items-center justify-center relative z-30 animate-fade-in px-6">
        <h1
          className="text-3xl md:text-5xl lg:text-6xl text-center lowercase leading-tight"
          style={{ color: t.muted }}
        >
          once it hits the internet,
          <br />
          it&apos;s there forever
        </h1>
      </header>

      {/* Scattered pile */}
      {photos.length === 0 ? (
        <div className="max-w-6xl mx-auto px-6 pb-24 text-center">
          <p className="italic" style={{ color: t.muted }}>
            No photos found. Add images to the public folder.
          </p>
        </div>
      ) : (
        <div key={params.stagger} className="relative w-full" style={{ height: `${pileHeightVh}vh` }}>
          <style>{`
            .pile-photo { width: ${mobileWidth}%; }
            @media (min-width: 640px) { .pile-photo { width: ${tabletWidth}%; } }
            @media (min-width: 1024px) { .pile-photo { width: ${desktopWidth}%; } }
          `}</style>
          {photos.map((photo, i) => {
            const l = layouts[i];
            return (
              <div
                key={photo.src}
                className="absolute animate-fade-in-up pile-photo"
                style={{
                  top: `${l.top}%`,
                  left: `${l.left}%`,
                  zIndex: dragZIndices[i] ?? l.z,
                  animationDelay: `${i * params.stagger}ms`,
                }}
              >
                <PolaroidImage
                  src={photo.src}
                  alt={photo.alt}
                  index={i}
                  rotation={l.rotation}
                  aspect={l.aspect}
                  theme={theme}
                  objectFit="contain"
                  paperColor={t.paper}
                  sizes={`(max-width: 640px) ${mobileWidth}vw, (max-width: 1024px) ${tabletWidth}vw, ${desktopWidth}vw`}
                  draggable
                  onZIndexChange={(z) => handleZIndexChange(i, z)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <footer className="pt-16 pb-24 text-center relative z-30">
        <p className="text-2xl" style={{ color: t.muted }}>
          I <span style={{ color: t.heart }}>&hearts;</span> u
        </p>
      </footer>
    </div>
  );
}
