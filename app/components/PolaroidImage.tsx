"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useClickOutside } from "@/app/lib/useClickOutside";
import { useScrollLock } from "@/app/lib/useScrollLock";

let globalDragCounter = 100;

interface PolaroidImageProps {
  src: string;
  alt: string;
  index: number;
  rotation?: number;
  aspect?: string;
  sizes?: string;
  theme?: "light" | "dark";
  objectFit?: "cover" | "contain";
  paperColor?: string;
  draggable?: boolean;
  onZIndexChange?: (z: number) => void;
}

interface FlipState {
  zoomStyle: {
    top: number;
    left: number;
    width: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
  };
  enter: { x: number; y: number; scale: number; rotate: number };
  exit: { x: number; y: number; scale: number; rotate: number };
}

export function PolaroidImage({
  src,
  alt,
  index,
  rotation = 0,
  aspect = "4/5",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  theme = "light",
  objectFit = "cover",
  paperColor,
  draggable = false,
  onZIndexChange,
}: PolaroidImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const zoomedRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<FlipState | null>(null);
  const [mounted, setMounted] = useState(false);

  // Drag state
  const isDraggingRef = useRef(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragZIndex, setDragZIndex] = useState<number | undefined>(undefined);
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Disable drag on touch devices
    if (draggable) {
      const isTouch =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setCanDrag(!isTouch);
    }
  }, [draggable]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  useClickOutside(zoomedRef, handleClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  useScrollLock(isLocked);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    setIsDragActive(true);
    const z = ++globalDragCounter;
    setDragZIndex(z);
    onZIndexChange?.(z);
  };

  const handleDragEnd = () => {
    // Reset isDraggingRef after a rAF delay so the click event fires first
    requestAnimationFrame(() => {
      isDraggingRef.current = false;
    });
    // Keep --dragging class for 150ms after drop to prevent hover "pop"
    setTimeout(() => {
      setIsDragActive(false);
    }, 150);
  };

  const handleClick = () => {
    // If we just finished dragging, consume the click
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    if (isOpen) return;
    const el = thumbRef.current;
    if (!el) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 768;
    const [aw, ah] = aspect.split("/").map(Number);

    const thumbPad = isDesktop
      ? { top: 8, lr: 8, bot: 36 }
      : { top: 6, lr: 6, bot: 30 };

    const hoveredRect = el.getBoundingClientRect();

    // Reverse CSS hover transforms: scale(1.05) translate(0, -6px)
    // When dragging, hover is suppressed so element is at natural size
    const hoverScale = isDragActive ? 1 : 1.05;
    const natW = hoveredRect.width / hoverScale;
    const natCX = hoveredRect.left + hoveredRect.width / 2;
    const natCY = hoveredRect.top + hoveredRect.height / 2;

    // Proportional zoom: padding scales with size so transform: scale() is pixel-perfect
    const thumbImgW = natW - thumbPad.lr * 2;
    const thumbImgH = thumbImgW * (ah / aw);
    const thumbTotalH = thumbPad.top + thumbImgH + thumbPad.bot;

    const maxFromImg = (480 * natW) / thumbImgW;
    const maxFromVW = vw * 0.85;
    const maxFromVH = (vh * 0.85 * natW) / thumbTotalH;
    const zoomW = Math.min(maxFromImg, maxFromVW, maxFromVH);
    const ratio = zoomW / natW;

    const zoomH = thumbTotalH * ratio;
    const zoomCX = vw / 2;
    const zoomCY = vh / 2;

    const hovCX = hoveredRect.left + hoveredRect.width / 2;
    const hovCY = hoveredRect.top + hoveredRect.height / 2;

    flipRef.current = {
      zoomStyle: {
        top: (vh - zoomH) / 2,
        left: (vw - zoomW) / 2,
        width: zoomW,
        paddingTop: thumbPad.top * ratio,
        paddingRight: thumbPad.lr * ratio,
        paddingBottom: thumbPad.bot * ratio,
        paddingLeft: thumbPad.lr * ratio,
      },
      enter: {
        x: hovCX - zoomCX,
        y: hovCY - zoomCY,
        scale: hoveredRect.width / zoomW,
        rotate: rotation,
      },
      exit: {
        x: natCX - zoomCX,
        y: natCY - zoomCY,
        scale: natW / zoomW,
        rotate: rotation,
      },
    };

    setIsOpen(true);
    setIsLocked(true);
  };

  const flip = flipRef.current;

  const isDark = theme === "dark";
  const darkCls = isDark ? " polaroid-dark" : "";
  const fitCls = objectFit === "contain" ? "object-contain" : "object-cover";
  const imageAreaStyle: React.CSSProperties = {
    aspectRatio: aspect,
    ...(paperColor ? { backgroundColor: paperColor } : {}),
  };
  const backdropColor = isDark
    ? "rgba(10, 8, 6, 0.92)"
    : "rgba(18, 16, 14, 0.88)";

  const frozenCls = isLocked ? " polaroid-frame--frozen" : "";
  const draggingCls = isDragActive ? " polaroid-frame--dragging" : "";

  const thumbnail = (
    <div
      ref={thumbRef}
      onClick={handleClick}
      className={`polaroid-frame${darkCls}${frozenCls}${draggingCls} cursor-pointer`}
      style={
        {
          "--rotation": `${rotation}deg`,
          opacity: isOpen ? 0 : 1,
          ...(canDrag ? { pointerEvents: "auto" as const, cursor: isDragActive ? "grabbing" : "grab" } : {}),
        } as React.CSSProperties
      }
    >
      <div
        className="polaroid-image-area relative w-full overflow-hidden"
        style={imageAreaStyle}
      >
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          className={fitCls}
          sizes={sizes}
        />
      </div>
      <p
        className="mt-2 text-right text-[10px] text-[#a09789] font-[family-name:var(--font-dm-sans)]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        No. {String(index + 1).padStart(3, "0")}
      </p>
    </div>
  );

  return (
    <>
      {/* Thumbnail — wrapped in motion.div when draggable */}
      {canDrag ? (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{
            scale: 1.05,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          style={{
            position: "relative",
            zIndex: dragZIndex,
            pointerEvents: "none",
          }}
        >
          {thumbnail}
        </motion.div>
      ) : (
        thumbnail
      )}

      {/* Zoomed overlay */}
      {mounted &&
        createPortal(
          <AnimatePresence onExitComplete={() => setIsLocked(false)}>
            {isOpen && flip && (
              <>
                {/* Backdrop */}
                <motion.div
                  key={`pb-${index}`}
                  className="fixed inset-0 z-[9998]"
                  style={{
                    backgroundColor: backdropColor,
                    willChange: "opacity",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "tween",
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={handleClose}
                />

                {/* Zoomed polaroid */}
                <motion.div
                  key={`pz-${index}`}
                  ref={zoomedRef}
                  className={`fixed z-[9999] polaroid-frame--zoomed${darkCls}`}
                  style={{
                    top: flip.zoomStyle.top,
                    left: flip.zoomStyle.left,
                    width: flip.zoomStyle.width,
                    paddingTop: flip.zoomStyle.paddingTop,
                    paddingRight: flip.zoomStyle.paddingRight,
                    paddingBottom: flip.zoomStyle.paddingBottom,
                    paddingLeft: flip.zoomStyle.paddingLeft,
                    willChange: "transform",
                  }}
                  initial={flip.enter}
                  animate={{ x: 0, y: 0, scale: 1, rotate: 0 }}
                  exit={flip.exit}
                  transition={{
                    type: "tween",
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="polaroid-image-area relative w-full overflow-hidden"
                    style={imageAreaStyle}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className={fitCls}
                      sizes="90vw"
                    />
                    <div className="polaroid-glare" />
                  </div>
                  <p
                    className="mt-2 text-right text-[10px] text-[#a09789] font-[family-name:var(--font-dm-sans)]"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    No. {String(index + 1).padStart(3, "0")}
                  </p>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
