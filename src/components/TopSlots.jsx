import React from 'react'

export default function TopSlots({ completedCount, total, allDone, onReveal }) {
  return (
    <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-700">Progress</div>
          <div className="text-xs text-slate-500">
            {completedCount}/{total} completed
          </div>
        </div>

        {allDone ? (
          <button
            onClick={onReveal}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.99]"
          >
            Unlock Surprise ✨
          </button>
        ) : (
          <div className="text-xs text-slate-500">Complete all tabs to unlock</div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < completedCount;
          return (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-black/5"
              aria-label={filled ? "Completed" : "Not completed"}
            >
              {filled ? "✅" : "___"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
