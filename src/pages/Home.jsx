import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopSlots from '../components/TopSlots';
import Tabs from '../components/Tabs';

import Memory from '../games/Memory';
import Maze from '../games/Maze';
import Reaction from '../games/Reaction';
import Slider from '../games/Slider';
import Quiz from '../games/Quiz';

const STORAGE_KEY = 'valentines_progress_v1';

const GAMES = [
  { key: 'memory', label: 'Memory Match', component: Memory },
  { key: 'maze', label: 'Maze', component: Maze },
  { key: 'reaction', label: 'Catch Hearts', component: Reaction },
  { key: 'slider', label: 'Slider', component: Slider },
  { key: 'quiz', label: 'Quiz', component: Quiz },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(GAMES[0].key);

  const [completed, setCompleted] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : Object.fromEntries(GAMES.map(g => [g.key, false]));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const allDone = useMemo(
    () => GAMES.every(g => completed[g.key]),
    [completed]
  );

  function markDone(key) {
    setCompleted(prev => ({ ...prev, [key]: true }));
  }

  const ActiveGame = GAMES.find(g => g.key === activeKey)?.component ?? Memory;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-rose-300 text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          For Farina 💌
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Finish all 5 games to unlock the surprise🤭
        </p>

        <div className="mt-5">
          <TopSlots
            completedCount={GAMES.filter(g => completed[g.key]).length}
            total={GAMES.length}
            allDone={allDone}
            onReveal={() => navigate("/reveal")}
          />
        </div>

        <div className="mt-6">
          <Tabs
            games={GAMES}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            completed={completed}
          />
        </div>

        <div className="mt-6 rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 p-4 sm:p-6">
          <ActiveGame
            isComplete={completed[activeKey]}
            onComplete={() => markDone(activeKey)}
          />
        </div>
      </div>
    </div>
  );
};