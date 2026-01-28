import { useEffect, useMemo, useState } from "react";

const CARD_BACK = "❓";

// Phrase-completion pairs:
// Each pair becomes TWO different cards that match by `pairKey`:
// - left = prompt/start of phrase
// - right = finish of phrase
const PAIRS = [
  { key: "a", left: "Baluk in the...", right: "pani🐻🌊" },
  { key: "b", left: "Full, satisfied…", right: "babby😋" },
  { key: "c", left: "Serafina and…", right: "Ivan🐱🐶" },
  { key: "d", left: "Man what's Miffy...", right: "up to?🐰" },
  { key: "e", left: "Mi amor and…", right: "amar jaan❤️" },
  { key: "f", left: "Flying...", right: "Lulu that dog that I hate😡 jk" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(pairs) {
  // Build two DIFFERENT cards per pair
  const cards = pairs.flatMap((p) => [
    {
      pairKey: p.key,
      label: `Start: ${p.left}`,
      front: p.left,
      side: "left",
    },
    {
      pairKey: p.key,
      label: `Finish: ${p.right}`,
      front: p.right,
      side: "right",
    },
  ]);

  // Give each card a unique instance id, then shuffle
  return shuffle(
    cards.map((c, idx) => ({
      ...c,
      id: `${c.pairKey}-${c.side}-${idx}-${Math.random()
        .toString(16)
        .slice(2)}`,
      matched: false,
    }))
  );
}

export default function Memory() {
  const pairs = useMemo(() => PAIRS, []);

  const [deck, setDeck] = useState(() => buildDeck(pairs));
  const [flippedIds, setFlippedIds] = useState([]); // up to 2
  const [moves, setMoves] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  const allMatched = deck.length > 0 && deck.every((c) => c.matched);
  const isFaceUp = (card) => card.matched || flippedIds.includes(card.id);

  function resetGame() {
    setDeck(buildDeck(pairs));
    setFlippedIds([]);
    setMoves(0);
    setLockBoard(false);
  }

  function onCardClick(card) {
    if (lockBoard) return;
    if (card.matched) return;
    if (flippedIds.includes(card.id)) return;
    if (flippedIds.length === 2) return;

    const nextFlipped = [...flippedIds, card.id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);

      const [id1, id2] = nextFlipped;

      const first = deck.find((c) => c.id === id1);
      const second = deck.find((c) => c.id === id2);
      if (!first || !second) return;

      const isMatch = first.pairKey === second.pairKey;

      if (isMatch) {
        setDeck((prev) =>
          prev.map((c) =>
            c.id === id1 || c.id === id2 ? { ...c, matched: true } : c
          )
        );
        setTimeout(() => setFlippedIds([]), 250);
      } else {
        setLockBoard(true);
        setTimeout(() => {
          setFlippedIds([]);
          setLockBoard(false);
        }, 750);
      }
    }
  }

  // Handy while editing content; keeps things consistent on mount
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:p-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-black/5">
              <span className="text-lg">🧠</span>
              <span>Memory Match</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Moves: <span className="font-extrabold">{moves}</span>
              </div>

              <button
                onClick={resetGame}
                className="rounded-2xl bg-rose-200 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-rose-300 active:translate-y-0"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 h-1 w-44 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          <p className="mt-6 text-center text-sm text-slate-700">
            Flip two cards. Match the phrase starter with its ending.
          </p>

          {/* Grid (phrases need more space than emojis) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {deck.map((card) => {
              const faceUp = isFaceUp(card);

              return (
                <button
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  disabled={lockBoard}
                  className={[
                    "relative aspect-square w-full rounded-2xl ring-1 ring-black/5",
                    "shadow-sm transition-transform active:scale-[0.99]",
                    faceUp ? "bg-white" : "bg-rose-200 hover:bg-rose-300",
                    card.matched ? "opacity-70" : "opacity-100",
                  ].join(" ")}
                  aria-label={faceUp ? `Card: ${card.label}` : "Hidden card"}
                >
                  {/* Optional small tag so it feels like "start/finish" */}
                  {faceUp && (
                    <div className="absolute left-2 top-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-black/5">
                      {card.side === "left" ? "START" : "FINISH"}
                    </div>
                  )}

                  <div className="grid h-full w-full place-items-center px-3">
                    {faceUp ? (
                      <span className="text-center text-sm font-semibold text-slate-800 sm:text-base break-words">
                        {card.front}
                      </span>
                    ) : (
                      <span className="text-2xl opacity-80">{CARD_BACK}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {allMatched && (
            <div className="mt-8 rounded-3xl bg-white/80 p-5 text-center ring-1 ring-black/5">
              <div className="text-2xl font-extrabold text-slate-900">
                You did it! 🎉
              </div>
              <div className="mt-1 text-sm text-slate-700">
                Total moves: <span className="font-bold">{moves}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
