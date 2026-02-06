import { useEffect, useMemo, useState } from "react";

const QUESTIONS = [
  {
    id: "q1",
    prompt: "When did we start dating?",
    choices: ["March 1st", "Feburary 14th", "March 3rd", "Roblox Fard"],
    answerIndex: 0,
  },
  {
    id: "q2",
    prompt: "What is my favorite pokemon?",
    choices: ["Baluk", "Deino", "Larvitar", "Totodile"],
    answerIndex: 3,
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ onComplete, isComplete }) {
  const [shuffleOnRestart, setShuffleOnRestart] = useState(false);

  const baseQuestions = useMemo(() => QUESTIONS, []);
  const [qs, setQs] = useState(() =>
    shuffleOnRestart ? shuffle(baseQuestions) : baseQuestions
  );

  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // true/false/null
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = qs.length;
  const current = qs[index];

  // ✅ Mark completion once when quiz is done
  useEffect(() => {
    if (!done) return;
    if (isComplete) return;

    const perfect = score === total;
    if (!perfect) return;

    onComplete?.();
  }, [done, score, total, isComplete, onComplete]);

  function restart() {
    const nextQ = shuffleOnRestart ? shuffle(baseQuestions) : baseQuestions;
    setQs(nextQ);
    setIndex(0);
    setSelectedIndex(null);
    setIsCorrect(null);
    setScore(0);
    setDone(false);
  }

  function choose(i) {
    if (done) return;
    if (selectedIndex !== null) return;

    setSelectedIndex(i);

    const correct = i === current.answerIndex;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  }

  function next() {
    if (done) return;

    const last = index === total - 1;
    if (last) {
      setDone(true);
      return;
    }

    setIndex((n) => n + 1);
    setSelectedIndex(null);
    setIsCorrect(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-100 to-rose-200 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white/70 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-black/5">
              <span className="text-lg">📝</span>
              <span>Quiz</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5">
                Score: <span className="font-extrabold">{score}</span> / {total}
              </div>

              <button
                onClick={restart}
                className="rounded-2xl bg-rose-200 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-rose-300 active:translate-y-0"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="mx-auto mt-6 h-1 w-44 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          {/* Content */}
          {!done ? (
            <>
              <div className="mt-6 text-center text-sm font-semibold text-slate-600">
                Question {index + 1} / {total}
              </div>

              <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900">
                {current.prompt}
              </h2>

              <div className="mt-8 grid gap-3">
                {current.choices.map((choice, i) => {
                  const picked = selectedIndex === i;
                  const correctChoice = i === current.answerIndex;

                  const showFeedback = selectedIndex !== null;
                  const good = showFeedback && correctChoice;
                  const bad = showFeedback && picked && !correctChoice;

                  return (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={selectedIndex !== null}
                      className={[
                        "rounded-2xl px-4 py-3 text-left text-sm font-semibold ring-1 ring-black/10 shadow-sm transition",
                        "active:scale-[0.99]",
                        picked ? "bg-white" : "bg-white/80 hover:bg-white",
                        good ? "ring-2 ring-emerald-400" : "",
                        bad ? "ring-2 ring-rose-400" : "",
                      ].join(" ")}
                      aria-label={`Answer ${i + 1}: ${choice}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-800">{choice}</span>

                        {selectedIndex !== null && (
                          <span className="text-lg">
                            {good ? "✅" : bad ? "❌" : ""}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              <div className="mt-6 flex flex-col items-center gap-3">
                {selectedIndex !== null && (
                  <div
                    className={[
                      "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 ring-black/5",
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700",
                    ].join(" ")}
                  >
                    {isCorrect ? "Correct!!!" : "No:/"}
                  </div>
                )}

                <button
                  onClick={next}
                  disabled={selectedIndex === null}
                  className={[
                    "rounded-2xl px-5 py-2 text-sm font-bold shadow-sm transition",
                    selectedIndex === null
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99]",
                  ].join(" ")}
                >
                  {index === total - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </>
          ) : (
            // Final screen
            <div className="mt-10 text-center">
              <div className="text-3xl font-extrabold text-slate-900">
                Quiz Complete! 🎉
              </div>
              <div className="mt-2 text-sm text-slate-700">
                You scored <span className="font-bold">{score}</span> out of{" "}
                <span className="font-bold">{total}</span>.
              </div>

              <button
                onClick={restart}
                className="mt-6 rounded-2xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-700 active:scale-[0.99]"
              >
                Play again
              </button>
              {score !== total && (
                <div className="mt-2 text-sm font-semibold text-rose-700">
                  Get all answers correct to complete this game ✅
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
