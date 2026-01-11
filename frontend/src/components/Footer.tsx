
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg">uniZ</span>
              <span className="text-slate-500 text-sm">© {year}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}