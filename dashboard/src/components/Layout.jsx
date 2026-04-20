import Navbar from "./Navbar.jsx";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-3 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex justify-between gap-2 flex-wrap">
          <span>JSON & API Benchmark Dashboard</span>
          <span>Frontend Framework Comparison</span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
