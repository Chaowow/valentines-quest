import { useEffect, useMemo, useReducer, useCallback } from "react";
import babby from "../assets/CuteBibble.jpg";
import bed from "../assets/Bed.jpg";

const MAZE_MAP = [
  ["S", 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, "G"],
];

const FOG_RADIUS = 1;
const PERSIST_EXPLORED = true;

function findCell(map, target) {
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[0].length; c++) {
      if (map[r][c] === target) return { r, c };
    }
  }
  return null;
}

function isWall(cell) {
  return cell === 1;
}

function keyOf(r, c) {
  return `${r},${c}`;
}

function isInRadius(pos, r, c, radius) {
  return Math.abs(pos.r - r) <= radius && Math.abs(pos.c - c) <= radius;
}

function createInitialState({ start }) {
  const visited = new Set([keyOf(start.r, start.c)]);
  return {
    pos: start,
    moves: 0,
    won: false,
    visited,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "RESET": {
      return createInitialState({ start: action.start });
    }

    case "MOVE": {
      const { dr, dc, map, rows, cols, goal } = action;

      if (state.won) return state;

      const nr = state.pos.r + dr;
      const nc = state.pos.c + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return state;

      const nextCell = map[nr][nc];
      if (isWall(nextCell)) return state;

      const nextPos = { r: nr, c: nc };
      const nextMoves = state.moves + 1;
      const nextWon = nr === goal.r && nc === goal.c;

      const nextVisited = PERSIST_EXPLORED ? new Set(state.visited) : state.visited;
      if (PERSIST_EXPLORED) nextVisited.add(keyOf(nr, nc));

      return {
        ...state,
        pos: nextPos,
        moves: nextMoves,
        won: nextWon,
        visited: nextVisited,
      };
    }

    default:
      return state;
  }
}

export default function Maze({ onComplete, isComplete }) {
  const map = useMemo(() => MAZE_MAP, []);
  const rows = map.length;
  const cols = map[0].length;

  const start = useMemo(() => findCell(map, "S") ?? { r: 0, c: 0 }, [map]);
  const goal = useMemo(
    () => findCell(map, "G") ?? { r: rows - 1, c: cols - 1 },
    [map, rows, cols]
  );

  const [state, dispatch] = useReducer(reducer, null, () =>
    createInitialState({ start })
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET", start });
  }, [start]);

  const tryMove = useCallback(
    (dr, dc) => {
      dispatch({
        type: "MOVE",
        dr,
        dc,
        map,
        rows,
        cols,
        goal,
      });
    },
    [map, rows, cols, goal]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
      }

      if (key === "arrowup" || key === "w") tryMove(-1, 0);
      else if (key === "arrowdown" || key === "s") tryMove(1, 0);
      else if (key === "arrowleft" || key === "a") tryMove(0, -1);
      else if (key === "arrowright" || key === "d") tryMove(0, 1);
      else if (key === "r") reset();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tryMove, reset]);

  const { pos, moves, won, visited } = state;

  // ✅ Mark completion once when the player wins
  useEffect(() => {
    if (!won) return;
    if (isComplete) return; // already counted in Home/localStorage
    onComplete?.();
  }, [won, isComplete, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-black/5">
              <span className="text-lg">🧩</span>
              <span>Maze</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Moves: <span className="font-extrabold">{moves}</span>
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
            Use <span className="font-semibold">Arrow Keys</span> or{" "}
            <span className="font-semibold">WASD</span> to reach the goal.
          </p>

          {/* Maze */}
          <div className="mt-8 flex flex-col items-center gap-6">
            <div
              className="grid gap-1 rounded-3xl bg-white/60 p-3 ring-1 ring-black/5 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                width: "min(92vw, 520px)",
              }}
              aria-label="Maze grid"
            >
              {map.map((row, r) =>
                row.map((cell, c) => {
                  const wall = isWall(cell);
                  const isStart = cell === "S";
                  const isGoal = cell === "G";
                  const isPlayer = pos.r === r && pos.c === c;

                  const inRadius = isInRadius(pos, r, c, FOG_RADIUS);
                  const explored = visited.has(keyOf(r, c));
                  const visible = inRadius || (PERSIST_EXPLORED && explored);

                  const fogged = !visible;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={[
                        "aspect-square rounded-lg ring-1 ring-black/5 relative overflow-hidden",
                        fogged
                          ? "bg-slate-900/80"
                          : wall
                            ? "bg-slate-800/80"
                            : "bg-white/90",
                        !fogged && isStart && !wall ? "bg-emerald-100" : "",
                        !fogged && isGoal && !wall ? "bg-amber-100" : "",
                      ].join(" ")}
                    >
                      {!fogged && isStart && (
                        <div className="absolute left-1 top-1 text-[10px] font-bold text-emerald-700">
                          S
                        </div>
                      )}

                      {isGoal && (
                        <div className="absolute inset-0 grid place-items-center">
                          <img
                            src={bed}
                            alt="Goal"
                            className={`h-6 w-6 sm:h-7 sm:w-7 ${fogged ? "opacity-40" : "opacity-100"
                              }`}
                            draggable={false}
                          />
                        </div>
                      )}

                      {isPlayer && (
                        <div className="grid h-full w-full place-items-center">
                          <img
                            src={babby}
                            alt="Player"
                            className="h-8 w-8 sm:h-7 sm:w-7 drop-shadow-sm"
                            draggable={false}
                          />
                        </div>
                      )}

                      {!fogged && !inRadius && PERSIST_EXPLORED && (
                        <div className="absolute inset-0 bg-slate-900/10" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile controls */}
            <div className="w-full max-w-sm rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
              <div className="text-center text-xs font-semibold text-slate-600">
                Mobile controls
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div />
                <button
                  onClick={() => tryMove(-1, 0)}
                  className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-slate-800 ring-1 ring-black/10 shadow-sm active:scale-[0.99]"
                >
                  ↑
                </button>
                <div />

                <button
                  onClick={() => tryMove(0, -1)}
                  className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-slate-800 ring-1 ring-black/10 shadow-sm active:scale-[0.99]"
                >
                  ←
                </button>
                <button
                  onClick={() => tryMove(1, 0)}
                  className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-slate-800 ring-1 ring-black/10 shadow-sm active:scale-[0.99]"
                >
                  ↓
                </button>
                <button
                  onClick={() => tryMove(0, 1)}
                  className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-slate-800 ring-1 ring-black/10 shadow-sm active:scale-[0.99]"
                >
                  →
                </button>
              </div>
            </div>

            {/* Win */}
            {won && (
              <div className="w-full max-w-xl rounded-3xl bg-white/80 p-5 text-center ring-1 ring-black/5">
                <div className="text-2xl font-extrabold text-slate-900">
                  Maze cleared! 🎉
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Moves: <span className="font-bold">{moves}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
