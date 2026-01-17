import { Link } from "react-router-dom";

export default function Reveal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-pink-200 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-3xl bg-white/80 p-8 text-center shadow-sm ring-1 ring-black/5">
        <div className="text-4xl">❤️</div>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
          Will you be my Valentine?🤭
        </h2>

        <div className="mt-6 flex justify-center gap-3">
          <button className="rounded-2xl bg-rose-600 px-5 py-3 text-white font-semibold hover:bg-rose-700">
            Yes!
          </button>
          <button className="rounded-2xl bg-slate-200 px-5 py-3 text-slate-800 font-semibold hover:bg-slate-300">
            No😡
          </button>
        </div>

        <div className="mt-6 text-sm">
          <Link to="/" className="text-rose-700 font-semibold hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
