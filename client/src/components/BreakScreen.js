export default function BreakScreen({ room }) {
  return (
    <div className="h-[50vh] flex flex-col justify-center items-center text-center space-y-12">
      <h2 className="text-display-xl tracking-tighter italic font-serif text-black">
        TAKE A BREATH
      </h2>
      <div className="space-y-4">
        <p className="mono-label">Next sequence initialization in</p>
        <div className="text-5xl font-light text-black">
          {room.timer} SECONDS
        </div>
      </div>
      <div className="w-64 h-[2px] bg-black/10 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-1000"
          style={{
            width: `${(room.timer / room.config.breakTime) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
