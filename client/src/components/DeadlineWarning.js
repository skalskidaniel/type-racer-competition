export default function DeadlineWarning() {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-red-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2 border-white">
        <div className="flex flex-col">
          <span className="font-serif italic text-xl">
            5 SECONDS REMAINING!
          </span>
        </div>
      </div>
    </div>
  );
}
