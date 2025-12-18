import clsx from "clsx";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type Props = {
  current: number;
  goal: number;
  milestone?: number;
};

export default function ProgressBar({ current, goal, milestone }: Props) {
  const { t } = useLanguage();
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const [display, setDisplay] = useState<number>(current);
  useEffect(() => {
    let raf: number | null = null;
    const start = display;
    const diff = current - start;
    const duration = 600;
    const startTime = performance.now();
    function step(t: number) {
      const progress = Math.min(1, (t - startTime) / duration);
      const val = Math.round(start + diff * progress);
      setDisplay(val);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [current]);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 items-end">
        <div className="flex items-baseline gap-3">
          <div className="text-2xl md:text-3xl font-bold text-white">
            {t('hero.goal')}
          </div>
          <div className="text-sm font-medium text-white/90">
            {display} / {goal} {t('hero.bags')}
          </div>
        </div>
        <div className="text-sm font-medium text-white/90">{pct}%</div>
      </div>
      <div className="w-full h-4 bg-white/10 rounded-full relative">
        <div className="overflow-hidden rounded-full h-full">
          <div
            className={clsx("h-full rounded-full")}
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #78C320, #76bc21)",
              transition: "width 700ms ease",
            }}
          />
        </div>
        {typeof milestone === "number" && goal > 0
          ? (() => {
            const pct = Math.min(
              100,
              Math.max(0, Math.round((milestone / goal) * 100))
            );
            // tooltip state handled per marker
            return <MilestoneMarker percent={pct} value={milestone} />;
          })()
          : null}
        <div className="absolute left-0 top-0 h-4 flex items-center justify-center w-full pointer-events-none">
          {/* subtle indicator */}
        </div>
      </div>
    </div>
  );
}

function MilestoneMarker({
  percent,
  value,
}: {
  percent: number;
  value: number;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  function toggle() {
    setOpen((s) => !s);
  }
  return (
    <div
      role="button"
      aria-label={`Milestone ${value}`}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggle();
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="absolute top-0 h-full flex items-center justify-center pointer-events-auto z-20"
      style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
    >
      <div className="w-8 h-full flex items-center justify-center">
        <div className="w-[2px] h-full bg-white/40" />
      </div>
      <div
        className={clsx(
          "absolute -top-11 bg-black/80 text-white text-xs rounded px-2 py-1 z-30 transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        គោលដៅទី១៖ {value} កាបូប
      </div>
    </div>
  );
}
