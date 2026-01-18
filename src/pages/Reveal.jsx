import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import totodileHappy from "../assets/pokemon-totodile.gif";
import politoedSad from "../assets/sad-politoed.png";
import bichon1 from "../assets/Cute-bichon.png";
import maltese1 from "../assets/Bibble.png";
import lovingToto from "../assets/Loving-totodile.png";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Optional helper: clamp so the "No" button doesn't fly too far off on small screens
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Reveal() {
  const [accepted, setAccepted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });

  // Keep a ref to the current timeout so it never stacks / leaks
  const confettiTimerRef = useRef(null);

  const triggerConfetti = () => {
    setShowConfetti(true);

    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 2200);
  };

  useEffect(() => {
    // Confetti on load
    triggerConfetti();

    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function moveNoButton() {
    // Softer range + clamped, so it feels playful without vanishing
    const x = clamp(rand(-110, 110), -140, 140);
    const y = clamp(rand(-55, 55), -90, 90);

    setNoPos({ x, y });
  }

  function onYes() {
    setAccepted(true);
    triggerConfetti();
  }

  const confettiPieces = useMemo(() => {
    if (!showConfetti) return [];

    const emojis = ["🎉", "💖", "✨", "💘", "🎊", "💕", "💝"];
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.2,
      size: 14 + Math.random() * 14,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      drift: (Math.random() - 0.5) * 120,
      rot: (Math.random() - 0.5) * 720,
    }));
  }, [showConfetti]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          {confettiPieces.map((p) => (
            <span
              key={p.id}
              className="absolute top-[-40px] animate-[confettiFall_linear_forwards] will-change-transform"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                fontSize: `${p.size}px`,
                transform: `translateX(0px) rotate(0deg)`,
                "--drift": `${p.drift}px`,
                "--rot": `${p.rot}deg`,
              }}
            >
              {p.emoji}
            </span>
          ))}

          <div className="absolute inset-0 bg-white/0 animate-[confettiFade_2.2s_ease-out_forwards]" />
        </div>
      )}

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:p-10">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-black/5">
            <span className="text-lg">💌</span>
          </div>

          <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {accepted
              ? "YIPPEEEE!!! I can’t wait for our date!"
              : "Will you be my Valentine?🤭"}
          </h1>

          <div className="mx-auto mt-7 h-1 w-40 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          {!accepted ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                {/* YES */}
                <button
                  onClick={onYes}
                  className="group relative flex items-center gap-3 rounded-2xl bg-rose-200 px-7 py-4 text-lg font-bold text-slate-800 shadow-md ring-1 ring-black/10 
                            transition hover:-translate-y-0.5 hover:bg-rose-300 active:translate-y-0"
                >
                  <img
                    src={lovingToto}
                    alt="Happy Totodile"
                    className="h-14 w-14 sm:h-24 sm:w-24 rounded-lg bg-white/30 p-1 ring-1 ring-white/40"
                    loading="eager"
                  />
                  <span>Yes❗❗</span>
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-rose-500/40 blur-xl opacity-0 transition group-hover:opacity-100" />
                </button>

                {/* NO — now smooth movement */}
                <button
                  onClick={moveNoButton}
                  style={{ transform: `translate3d(${noPos.x}px, ${noPos.y}px, 0)` }}
                  className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3 text-base font-bold text-slate-800 shadow-sm ring-1 ring-black/10
                             transition-transform duration-200 ease-out hover:bg-slate-200 active:scale-[0.99] will-change-transform"
                  title="Nice try 😌"
                >
                  <img
                    src={politoedSad}
                    alt="Sad Politoed"
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg bg-white/40 p-1 ring-1 ring-black/5"
                    loading="eager"
                  />
                  <span>No</span>
                  <span className="opacity-70">💔</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="mx-auto max-w-2xl rounded-3xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-black/5">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <img
                    src={totodileHappy}
                    alt="Happy Totodile"
                    className="h-44 w-auto rounded-2xl bg-white/60 p-2 ring-1 ring-black/5"
                  />
                  <div className="text-2xl font-extrabold text-slate-900">
                    I love you mi amorcito❤️
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                    <img
                      src={bichon1}
                      alt="Cute Bichon Frise"
                      className="h-56 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                    <img
                      src={maltese1}
                      alt="Cute Maltese"
                      className="h-56 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-4 text-sm">
            <Link to="/" className="font-semibold text-rose-700 hover:underline">
              ← Back to the quest
            </Link>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes confettiFall {
            0%   { transform: translateX(0px) translateY(0px) rotate(0deg); opacity: 1; }
            100% { transform: translateX(var(--drift)) translateY(115vh) rotate(var(--rot)); opacity: 1; }
          }

          @keyframes confettiFade {
            0%   { opacity: 0; }
            20%  { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
