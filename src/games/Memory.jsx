export default function Memory({ isComplete, onComplete }) {
  return (
    <div>
      <h3 className="text-xl font-bold">Memory Match (Pairs)</h3>
      <p className="mt-2 text-slate-600">
        We’ll turn inside jokes into card pairs next.
      </p>

      <button
        onClick={onComplete}
        disabled={isComplete}
        className={[
          "mt-4 rounded-xl px-4 py-2 text-sm font-semibold",
          isComplete
            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-rose-600 text-white hover:bg-rose-700",
        ].join(" ")}
      >
        {isComplete ? "Completed ✅" : "Mark complete (temporary)"}
      </button>
    </div>
  );
}
