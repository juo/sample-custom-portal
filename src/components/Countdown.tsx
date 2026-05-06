import { useState, useEffect } from "react";

export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Countdown({ endDate, className }: { endDate: Date; className?: string }) {
  const now = useNow();
  const remainingMs = Math.max(0, endDate.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (remainingMs <= 0) return null;

  return (
    <div className={className ?? "flex items-center gap-[6px] text-white"}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M7.99992 3.9987V7.9987L10.6666 9.33203M14.6666 7.9987C14.6666 11.6806 11.6818 14.6654 7.99992 14.6654C4.31802 14.6654 1.33325 11.6806 1.33325 7.9987C1.33325 4.3168 4.31802 1.33203 7.99992 1.33203C11.6818 1.33203 14.6666 4.3168 14.6666 7.9987Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex gap-[3px] text-[12px] font-semibold leading-[17px] tracking-[-0.12px]">
        {days > 0 && <span>{days}d</span>}
        <span>{String(hours).padStart(2, "0")}h</span>
        <span>{String(minutes).padStart(2, "0")}m</span>
        <span className="min-w-[28px]">{String(seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
