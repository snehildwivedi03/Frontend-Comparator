import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
      : "text-slate-600 hover:text-blue-600";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold tracking-wide">
            JSAP
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-semibold text-slate-900">
              JSON & API Benchmark Lab
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500">
              React · Angular · Vue · Svelte
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className={`${isActive("/")} px-2 py-1 transition`}>
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`${isActive("/dashboard")} px-2 py-1 transition`}
          >
            Dashboard
          </Link>

          <Link
            to="/summary"
            className={`${isActive("/summary")} px-2 py-1 transition`}
          >
            Summary
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
