import React from 'react'

export default function Tabs({ games, activeKey, setActiveKey, completed }) {
  return (
    <div className="flex flex-wrap gap-2">
      {games.map(g => {
        const isActive = g.key === activeKey;
        const isDone = completed[g.key];

        return (
          <button
            key={g.key}
            onClick={() => setActiveKey(g.key)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-black/5 transition",
              isActive ? "bg-white shadow-sm" : "bg-white/60 hover:bg-white",
            ].join(" ")}
          >
            <span>{g.label}</span>
            {isDone && <span className="ml-2">✅</span>}
          </button>
        );
      })}
    </div>
  );
}
