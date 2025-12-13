import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  current: number;
  goal: number;
};

export default function ProgressBar({ current, goal }: Props) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
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
          <div className="text-2xl md:text-3xl font-bold text-white">គោលដៅរបស់ពួកយើង</div>
          <div className="text-sm font-medium text-white/90">{display} / {goal} កាបូប</div>
        </div>
        <div className="text-sm font-medium text-white/90">{pct}%</div>
      </div>
      <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className={clsx("h-full rounded-full")}
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #78C320, #76bc21)",
            transition: "width 700ms ease",
          }}
        />
        <div className="absolute left-0 top-0 h-4 flex items-center justify-center w-full pointer-events-none">
          {/* subtle indicator */}
        </div>
      </div>
    </div>
  );
}
