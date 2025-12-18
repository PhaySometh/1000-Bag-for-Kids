import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const IMAGES = Array.from(
  { length: 24 },
  (_, i) => `/images/activity${i + 1}.png`
);

export default function ActivitySlider() {
  const { t } = useLanguage();
  const N = IMAGES.length;
  const base = N; // start index of the middle copy
  const RENDER_IMAGES = Array.from({ length: N * 3 }, (_, i) => IMAGES[i % N]);
  const RENDER_LEN = RENDER_IMAGES.length;

  const [index, setIndex] = useState(base);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ down: false, startX: 0, startScrollLeft: 0 });
  const scrollDebounce = useRef<number | null>(null);
  const [suppressSnap, setSuppressSnap] = useState(false);
  const centerTimeoutRef = useRef<number | null>(null);
  const skipCenterRef = useRef(false);

  // autoplay removed by user request

  useEffect(() => {
    // skip if this index change is due to our internal reset (we already positioned)
    if (skipCenterRef.current) {
      skipCenterRef.current = false;
      return;
    }
    // center after element transitions complete so we avoid overshoot
    centerIndex(index);
    const t = setTimeout(() => centerIndex(index), 520);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // center on mount to the middle copy
  useEffect(() => {
    const t = setTimeout(() => centerIndex(index), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => centerIndex(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    return () => {
      if (scrollDebounce.current) window.clearTimeout(scrollDebounce.current);
      if (centerTimeoutRef.current)
        window.clearTimeout(centerTimeoutRef.current);
    };
  }, []);

  function prev() {
    goByDelta(-1);
  }

  function next() {
    goByDelta(1);
  }

  function toMiddleIndex(logical: number) {
    return base + (((logical % N) + N) % N);
  }

  function getLogical(i: number) {
    return (((i - base) % N) + N) % N;
  }

  function goByDelta(delta: number) {
    const currentLogical = getLogical(index);
    const targetLogical = (((currentLogical + delta) % N) + N) % N;
    goToLogicalIndex(targetLogical);
  }

  function goToLogicalIndex(targetLogical: number) {
    const trackEl = trackRef.current;
    const containerEl = containerRef.current;
    if (!trackEl || !containerEl) return;

    const candidates = [
      targetLogical,
      base + targetLogical,
      base * 2 + targetLogical,
    ];
    const currentI = index;
    let best = candidates[0];
    let bestDist = Math.abs(best - currentI);
    for (const c of candidates) {
      const d = Math.abs(c - currentI);
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }
    const items = Array.from(trackEl.children) as HTMLElement[];
    const targetItem = items[best];
    if (!targetItem) return;

    const containerW = containerEl.clientWidth;
    const targetCenter = Math.max(
      0,
      targetItem.offsetLeft + targetItem.offsetWidth / 2 - containerW / 2
    );
    // set visual center to the candidate so it receives the scale class
    skipCenterRef.current = true;
    setIndex(best);
    setSuppressSnap(true);
    // animate to candidate center after visual state updates
    // animate to targetCandidate center after layout updated by setIndex(best)
    try {
      requestAnimationFrame(() => {
        // recompute after DOM/layout changes caused by setIndex
        const updatedItems = Array.from(trackEl.children) as HTMLElement[];
        const updatedTarget = updatedItems[best];
        const updatedTargetCenter = Math.max(
          0,
          updatedTarget.offsetLeft +
          updatedTarget.offsetWidth / 2 -
          containerW / 2
        );
        try {
          containerEl.scrollTo({
            left: updatedTargetCenter,
            behavior: "smooth",
          });
        } catch (e) {
          containerEl.scrollLeft = updatedTargetCenter;
        }
      });
    } catch (err) {
      containerEl.scrollLeft = targetCenter;
    }

    // after animation, reset to middle copy index
    if (centerTimeoutRef.current) window.clearTimeout(centerTimeoutRef.current);
    centerTimeoutRef.current = window.setTimeout(() => {
      const middleIdx = toMiddleIndex(targetLogical);
      const midItem = items[middleIdx];
      if (midItem) {
        const midCenter = Math.max(
          0,
          midItem.offsetLeft + midItem.offsetWidth / 2 - containerW / 2
        );
        // instant reposition to middle copy
        containerEl.scrollLeft = Math.min(
          Math.max(0, trackEl.scrollWidth - containerW),
          midCenter
        );
        skipCenterRef.current = true;
        setIndex(middleIdx);
      }
      setSuppressSnap(false);
      centerTimeoutRef.current = null;
    }, 520);
  }

  function centerIndex(i: number) {
    const trackEl = trackRef.current;
    const containerEl = containerRef.current;
    if (!trackEl || !containerEl) return;
    const items = Array.from(trackEl.children) as HTMLElement[];
    const current = items[i];
    if (!current) return;
    const containerW = containerEl.clientWidth;
    const targetLeft = Math.max(
      0,
      current.offsetLeft + current.offsetWidth / 2 - containerW / 2
    );
    const maxLeft = Math.max(0, trackEl.scrollWidth - containerW);
    const finalLeft = Math.min(maxLeft, targetLeft);

    // disable snap while centering to avoid immediate snapping effects
    setSuppressSnap(true);
    if (centerTimeoutRef.current) {
      window.clearTimeout(centerTimeoutRef.current);
    }

    try {
      requestAnimationFrame(() => {
        try {
          containerEl.scrollTo({ left: finalLeft, behavior: "smooth" });
        } catch (e) {
          containerEl.scrollLeft = finalLeft;
        }
      });
    } catch (err) {
      containerEl.scrollLeft = finalLeft;
    }

    // Re-enable snap after the centering animation
    centerTimeoutRef.current = window.setTimeout(() => {
      setSuppressSnap(false);
      centerTimeoutRef.current = null;
    }, 560);
  }

  function findClosestIndex(): number {
    const trackEl = trackRef.current;
    const containerEl = containerRef.current;
    if (!trackEl || !containerEl) return 0;
    const containerCenter =
      containerEl.scrollLeft + containerEl.clientWidth / 2;
    const items = Array.from(trackEl.children) as HTMLElement[];
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, idx) => {
      const itCenter = it.offsetLeft + it.offsetWidth / 2;
      const d = Math.abs(itCenter - containerCenter);
      if (d < bestDist) {
        bestDist = d;
        best = idx;
      }
    });
    return best;
  }

  function onPointerDown(e: React.PointerEvent) {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    // ignore if clicking on a control button
    const tgt = e.target as HTMLElement;
    if (tgt.closest("button")) return;
    dragRef.current.down = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startScrollLeft = containerEl.scrollLeft;
    try {
      containerEl.setPointerCapture(e.pointerId);
    } catch (_) { }
    setIsDragging(true);
    // disable snap while dragging so we don't get a snap jump
    setSuppressSnap(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.down) return;
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const dx = e.clientX - dragRef.current.startX;
    containerEl.scrollLeft = dragRef.current.startScrollLeft - dx;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current.down) return;
    const containerEl = containerRef.current;
    if (!containerEl) return;
    dragRef.current.down = false;
    try {
      containerEl.releasePointerCapture(e.pointerId);
    } catch (_) { }
    setIsDragging(false);
    const ci = findClosestIndex();
    const logical = getLogical(ci);
    goToLogicalIndex(logical);
    // center will be triggered by useEffect after transition
    // re-enable snap shortly after to restore normal scroll behavior
    // goToLogicalIndex will handle re-enabling snap and reset
  }

  function onScroll() {
    if (scrollDebounce.current) window.clearTimeout(scrollDebounce.current);
    scrollDebounce.current = window.setTimeout(() => {
      if (!dragRef.current.down && containerRef.current) {
        const ci = findClosestIndex();
        const logical = getLogical(ci);
        goToLogicalIndex(logical);
      }
    }, 120);
  }

  return (
    <div
      role="region"
      aria-label={t("activities")}
      className="w-full mt-6 p-4 animate-fadeUp"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white text-center">
        {t("activities")}
      </h2>

      <div className="relative">
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onScroll={onScroll}
          className={`overflow-x-auto overflow-y-hidden w-full mx-auto ${isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          style={{
            maxWidth: "100%",
            scrollSnapType: (suppressSnap ? "none" : "x mandatory") as any,
            scrollBehavior: "smooth",
          }}
        >
          <div
            ref={trackRef}
            className="flex items-center gap-4"
            style={{ padding: "32px 8px" }}
          >
            {RENDER_IMAGES.map((src, i) => {
              const isCenter = i === index;
              return (
                <div
                  key={`${src}-${i}`}
                  className={`flex-shrink-0 rounded-xl overflow-hidden bg-white/5 transition-all duration-500 shadow-sm`}
                  style={{
                    width: isCenter ? "min(72vw, 360px)" : "min(44vw, 240px)",
                    transform: `scale(${isCenter ? 1.08 : 0.86})`,
                    transitionProperty: "transform, width",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <img
                    src={src}
                    alt={`activity-${(i % N) + 1}`}
                    className={`w-full h-full object-contain bg-white/2 ${isCenter ? "shadow-2xl" : ""
                      }`}
                    loading="lazy"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-y-1/2 -translate-y-1/2 left-2 flex items-center gap-2">
          <button
            onClick={prev}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-darkBlue/40 hover:bg-darkBlue/60 text-white"
            aria-label="មុន"
          >
            ◀
          </button>
        </div>
        <div className="absolute inset-y-1/2 -translate-y-1/2 right-2 flex items-center gap-2">
          <button
            onClick={next}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-darkBlue/40 hover:bg-darkBlue/60 text-white"
            aria-label="បន្ទាប់"
          >
            ▶
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: N }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToLogicalIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full ${i === (index - base + N) % N ? "bg-white" : "bg-white/20"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
