import { useEffect, useMemo, useState } from "react";
import puzzleImg from "../assets/Cute-bichon.png";

const SIZE = 3;

function countInversions(arr) {
  const nums = arr.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inv++;
    }
  }
  return inv;
}

function findEmptyIndex(board) {
  return board.indexOf(0);
}

function rowFromIndex(index, size) {
  return Math.floor(index / size);
}

function colFromIndex(index, size) {
  return index % size;
}

function isSolvable(board, size) {
  const inv = countInversions(board);
  const emptyIndex = findEmptyIndex(board);
  const emptyRowFromTop = rowFromIndex(emptyIndex, size);
  const emptyRowFromBottom = size - emptyRowFromTop; // 1-based

  if (size % 2 === 1) {
    return inv % 2 === 0;
  }

  const blankEvenFromBottom = emptyRowFromBottom % 2 === 0;
  const invEven = inv % 2 === 0;

  return blankEvenFromBottom ? !invEven : invEven;
}

function isSolved(board) {
  const n = board.length;
  for (let i = 0; i < n - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[n - 1] === 0;
}

function makeSolvedBoard(size) {
  const total = size * size;
  const arr = [];
  for (let i = 1; i < total; i++) arr.push(i);
  arr.push(0);
  return arr;
}

function shuffleSolvable(size) {
  const solved = makeSolvedBoard(size);
  for (; ;) {
    const a = [...solved];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (isSolvable(a, size) && !isSolved(a)) return a;
  }
}

function canMove(tileIndex, emptyIndex, size) {
  const tr = rowFromIndex(tileIndex, size);
  const tc = colFromIndex(tileIndex, size);
  const er = rowFromIndex(emptyIndex, size);
  const ec = colFromIndex(emptyIndex, size);

  const manhattan = Math.abs(tr - er) + Math.abs(tc - ec);
  return manhattan === 1;
}

export default function Slider({ onComplete, isComplete }) {
  const size = SIZE;

  const [board, setBoard] = useState(() => shuffleSolvable(size));
  const [moves, setMoves] = useState(0);
  const [showNumbers, setShowNumbers] = useState(false);

  const won = useMemo(() => isSolved(board), [board]);

  function reset() {
    setBoard(shuffleSolvable(size));
    setMoves(0);
  }

  function handleTileClick(tileIndex) {
    if (won) return;

    const emptyIndex = findEmptyIndex(board);
    if (!canMove(tileIndex, emptyIndex, size)) return;

    setBoard((prev) => {
      const next = [...prev];
      [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
      return next;
    });
    setMoves((m) => m + 1);
  }

  // ✅ Mark completion once when puzzle is solved
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
              <span>Sliding Puzzle</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Moves: <span className="font-extrabold">{moves}</span>
              </div>

              <button
                onClick={reset}
                className="rounded-2xl bg-rose-200 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-rose-300 active:translate-y-0"
              >
                Shuffle
              </button>

              <button
                onClick={() => setShowNumbers((v) => !v)}
                className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-black/10 hover:bg-white"
                title="Helpful while testing"
              >
                {showNumbers ? "Hide #" : "Show #"}
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 h-1 w-44 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          <p className="mt-6 text-center text-sm text-slate-700">
            Slide the pieces back into place.
          </p>

          {/* Puzzle board */}
          <div className="mt-8 flex flex-col items-center gap-6">
            <div
              className="grid gap-1 rounded-3xl bg-white/70 p-3 ring-1 ring-black/5 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                width: "min(92vw, 520px)",
              }}
              aria-label="Sliding puzzle board"
            >
              {board.map((tile, index) => {
                const isEmpty = tile === 0;

                const correctIndex = tile - 1;
                const cr = rowFromIndex(correctIndex, size);
                const cc = colFromIndex(correctIndex, size);

                return (
                  <button
                    key={`${tile}-${index}`}
                    onClick={() => handleTileClick(index)}
                    disabled={isEmpty || won}
                    className={[
                      "relative aspect-square rounded-2xl ring-1 ring-black/5 overflow-hidden",
                      "shadow-sm transition-transform active:scale-[0.99]",
                      isEmpty
                        ? "bg-slate-200/60"
                        : "bg-white hover:brightness-[1.02]",
                      won && !isEmpty ? "opacity-95" : "",
                    ].join(" ")}
                    aria-label={isEmpty ? "Empty space" : `Tile ${tile}`}
                  >
                    {!isEmpty && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${puzzleImg})`,
                          backgroundSize: `${size * 100}% ${size * 100}%`,
                          backgroundPosition: `${(cc / (size - 1)) * 100}% ${(cr / (size - 1)) * 100
                            }%`,
                        }}
                      />
                    )}

                    {showNumbers && !isEmpty && (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="rounded-xl bg-white/70 px-2 py-1 text-xs font-extrabold text-slate-900 ring-1 ring-black/5">
                          {tile}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {won && (
              <div className="w-full max-w-xl rounded-3xl bg-white/80 p-5 text-center ring-1 ring-black/5">
                <div className="text-2xl font-extrabold text-slate-900">
                  Perfect! 🎉
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Total moves: <span className="font-bold">{moves}</span>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.99]"
                >
                  Play again
                </button>
              </div>
            )}

            <details className="w-full max-w-xl rounded-3xl bg-white/60 p-4 ring-1 ring-black/5">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                Show reference image
              </summary>
              <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-black/5">
                <img
                  src={puzzleImg}
                  alt="Reference"
                  className="h-auto w-full object-cover"
                  draggable={false}
                />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
