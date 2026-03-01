export default function TypingArea({
  room,
  socket,
  typedText,
  handleTyping,
  inputRef,
}) {
  return (
    <div className="lg:col-span-8 hairline-l pl-12 space-y-16 font-serif border-black/10">
      <div className="mono-label pb-4 hairline-b border-black/10">
        Input Buffer
      </div>
      <div className="relative text-3xl md:text-5xl font-light leading-[1.4] tracking-tight min-h-[12rem] text-black">
        {(() => {
          const targetText = room?.text || "";
          let firstMistakeIndex = -1;
          for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] !== targetText[i]) {
              firstMistakeIndex = i;
              break;
            }
          }

          const isError = firstMistakeIndex !== -1;
          const correctPart = isError
            ? targetText.slice(0, firstMistakeIndex)
            : targetText.slice(0, typedText.length);
          const incorrectPart = isError
            ? targetText.slice(firstMistakeIndex, typedText.length)
            : "";
          const remainingPart = targetText.slice(typedText.length);

          return (
            <>
              <span className="underline decoration-1 underline-offset-[12px] decoration-zinc-200">
                {correctPart}
              </span>
              <span className="underline decoration-1 underline-offset-[12px] decoration-red-200 text-red-500">
                {incorrectPart}
              </span>
              <span className="text-zinc-300">{remainingPart}</span>
            </>
          );
        })()}
      </div>

      <div className="pt-8 hairline-t border-black/10">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={typedText}
          onChange={handleTyping}
          className="w-full bg-transparent py-4 text-2xl font-light focus:outline-none placeholder:text-zinc-200 transition-all font-sans text-black"
          placeholder="Start typing to begin..."
          disabled={room?.players[socket.id]?.isFinished}
        />
      </div>

      {room?.players[socket.id]?.isFinished && (
        <div className="pt-8 flex items-center gap-4">
          <div className="w-2 h-2 bg-black animate-pulse"></div>
          <div className="mono-label text-black">
            Buffer finalized. Stand by for next iteration.
          </div>
        </div>
      )}
    </div>
  );
}
