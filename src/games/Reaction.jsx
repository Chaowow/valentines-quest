import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

const GAME_W = 420;
const GAME_H = 520;

const BASKET_W = 90;
const BASKET_H = 18;

const HEART_SIZE = 26;

const SPAWN_MS = 650;

const FALL_SPEED_MIN = 120; // px/sec
const FALL_SPEED_MAX = 220;

const TARGET_SCORE = 10;
const MAX_MISSES = 7;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function initialState() {
  return {
    basketX: (GAME_W - BASKET_W) / 2,
    hearts: [],
    score: 0,
    misses: 0,
    running: true,
    won: false,
    lost: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return initialState();

    case "SET_BASKET":
      return { ...state, basketX: action.x };

    case "TOGGLE_RUNNING":
      if (state.won || state.lost) return state;
      return { ...state, running: !state.running };

    case "SPAWN_HEART":
      if (!state.running || state.won || state.lost) return state;
      return {
        ...state,
        hearts: [
          ...state.hearts,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            x: rand(0, GAME_W - HEART_SIZE),
            y: -HEART_SIZE,
            vy: rand(FALL_SPEED_MIN, FALL_SPEED_MAX),
          },
        ],
      };

    case "TICK": {
      if (!state.running || state.won || state.lost) return state;

      const dt = action.dt;

      const basketTopY = GAME_H - 52;
      const basketLeft = state.basketX;
      const basketRight = state.basketX + BASKET_W;

      let caught = 0;
      let dropped = 0;

      const nextHearts = [];

      for (const h of state.hearts) {
        const ny = h.y + h.vy * dt;

        const hxCenter = h.x + HEART_SIZE / 2;
        const hyBottom = ny + HEART_SIZE;

        const withinBasketX = hxCenter >= basketLeft && hxCenter <= basketRight;
        const hitsBasketY =
          hyBottom >= basketTopY && hyBottom <= basketTopY + BASKET_H + 8;

        if (withinBasketX && hitsBasketY) {
          caught += 1;
          continue;
        }

        if (ny > GAME_H) {
          dropped += 1;
          continue;
        }

        nextHearts.push({ ...h, y: ny });
      }

      const nextScore = state.score + caught;
      const nextMisses = state.misses + dropped;

      const nextWon = nextScore >= TARGET_SCORE;
      const nextLost = nextMisses >= MAX_MISSES;

      const nextRunning = nextWon || nextLost ? false : state.running;

      return {
        ...state,
        hearts: nextHearts,
        score: nextScore,
        misses: nextMisses,
        won: nextWon,
        lost: nextLost,
        running: nextRunning,
      };
    }

    default:
      return state;
  }
}

export default function Reaction({ onComplete, isComplete }) {
  const [state, dispatch] = useReducer(reducer, null, initialState);

  const lastTimeRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const rafRef = useRef(null);

  const gameStatus = useMemo(() => {
    if (state.won) return "won";
    if (state.lost) return "lost";
    if (!state.running) return "paused";
    return "running";
  }, [state.won, state.lost, state.running]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    lastTimeRef.current = null;
  }, []);

  // ✅ Mark completion once when won
  useEffect(() => {
    if (!state.won) return;
    if (isComplete) return;
    onComplete?.();
  }, [state.won, isComplete, onComplete]);

  // Spawn hearts
  useEffect(() => {
    if (!state.running || state.won || state.lost) return;

    spawnTimerRef.current = setInterval(() => {
      dispatch({ type: "SPAWN_HEART" });
    }, SPAWN_MS);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [state.running, state.won, state.lost]);

  // Main loop
  useEffect(() => {
    if (!state.running || state.won || state.lost) return;

    const loop = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      dispatch({ type: "TICK", dt });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [state.running, state.won, state.lost]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === " " || key === "p") {
        dispatch({ type: "TOGGLE_RUNNING" });
        return;
      }
      if (key === "r") {
        reset();
        return;
      }

      if (state.won || state.lost) return;

      const step = 18;
      if (key === "arrowleft" || key === "a") {
        dispatch({
          type: "SET_BASKET",
          x: clamp(state.basketX - step, 0, GAME_W - BASKET_W),
        });
      }
      if (key === "arrowright" || key === "d") {
        dispatch({
          type: "SET_BASKET",
          x: clamp(state.basketX + step, 0, GAME_W - BASKET_W),
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.basketX, state.won, state.lost, reset]);

  // Slider input
  const onSlider = (e) => {
    const v = Number(e.target.value); // 0..100
    const x = (v / 100) * (GAME_W - BASKET_W);
    dispatch({ type: "SET_BASKET", x });
  };

  const basketTopY = GAME_H - 52;

  const handlePrimaryOverlayAction = () => {
    if (state.won || state.lost) {
      reset();
      return;
    }
    dispatch({ type: "TOGGLE_RUNNING" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:p-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-black/5">
              <span className="text-lg">💘</span>
              <span>Catch Hearts</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Score: <span className="font-extrabold">{state.score}</span> /{" "}
                {TARGET_SCORE}
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Misses: <span className="font-extrabold">{state.misses}</span> /{" "}
                {MAX_MISSES}
              </div>

              <button
                onClick={reset}
                className="rounded-2xl bg-rose-200 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-rose-300 active:translate-y-0"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 h-1 w-44 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          <p className="mt-6 text-center text-sm text-slate-700">
            Move the slider to catch hearts.{" "}
            <span className="font-semibold">Space/P</span> to pause.
          </p>

          <div className="mt-8 flex flex-col items-center gap-5">
            <div
              className="relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm"
              style={{
                width: "min(92vw, 520px)",
                aspectRatio: `${GAME_W} / ${GAME_H}`,
              }}
              aria-label="Catch hearts game"
            >
              {state.hearts.map((h) => (
                <div
                  key={h.id}
                  className="absolute select-none"
                  style={{
                    left: `${(h.x / GAME_W) * 100}%`,
                    top: `${(h.y / GAME_H) * 100}%`,
                    width: `${(HEART_SIZE / GAME_W) * 100}%`,
                    height: `${(HEART_SIZE / GAME_W) * 100}%`,
                  }}
                >
                  <div className="grid h-full w-full place-items-center text-2xl">
                    ❤️
                  </div>
                </div>
              ))}

              <div
                className="absolute"
                style={{
                  left: `${(state.basketX / GAME_W) * 100}%`,
                  top: `${(basketTopY / GAME_H) * 100}%`,
                  width: `${(BASKET_W / GAME_W) * 100}%`,
                  height: `${(BASKET_H / GAME_H) * 100}%`,
                }}
              >
                <div className="h-full w-full rounded-xl bg-rose-600/90 ring-2 ring-white/70 shadow-sm" />
              </div>

              {(state.won || state.lost || !state.running) && (
                <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm">
                  <div className="rounded-3xl bg-white/90 p-6 text-center ring-1 ring-black/5 shadow-sm">
                    {state.won && (
                      <>
                        <div className="text-2xl font-extrabold text-slate-900">
                          You caught enough hearts! 💖
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          Final score:{" "}
                          <span className="font-bold">{state.score}</span>
                        </div>
                      </>
                    )}

                    {state.lost && (
                      <>
                        <div className="text-2xl font-extrabold text-slate-900">
                          Oops! Too many missed 💔
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          Score:{" "}
                          <span className="font-bold">{state.score}</span>
                        </div>
                      </>
                    )}

                    {!state.won && !state.lost && !state.running && (
                      <>
                        <div className="text-2xl font-extrabold text-slate-900">
                          Paused
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          Press <span className="font-bold">Space</span> to
                          resume.
                        </div>
                      </>
                    )}

                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={handlePrimaryOverlayAction}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.99]"
                      >
                        {state.won || state.lost ? "Play again" : "Resume"}
                      </button>
                      <button
                        onClick={reset}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/10 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-xl rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Left</span>
                <span>Move basket</span>
                <span>Right</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={(state.basketX / (GAME_W - BASKET_W)) * 100}
                onChange={onSlider}
                className="mt-3 w-full"
                aria-label="Basket position slider"
              />

              <div className="mt-2 text-center text-[11px] text-slate-500">
                Tip: Arrow keys / A-D also work on desktop.
              </div>
            </div>

            <div className="text-center text-xs text-slate-500">
              Status: <span className="font-semibold">{gameStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
