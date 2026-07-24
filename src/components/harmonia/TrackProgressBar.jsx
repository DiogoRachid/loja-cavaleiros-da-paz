import { useState, useRef } from "react";

function formatMs(ms) {
  const totalSec = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Barra de progresso arrastável (mouse e touch) para a faixa em reprodução.
// Enquanto arrasta, mostra a posição alvo; o seek só é enviado ao soltar.
export default function TrackProgressBar({ position, duration, onSeek }) {
  const barRef = useRef(null);
  const [dragRatio, setDragRatio] = useState(null); // null = não está arrastando

  const total = duration || 0;
  const ratio = dragRatio !== null
    ? dragRatio
    : total ? Math.min(1, (position || 0) / total) : 0;

  const ratioFromEvent = (clientX) => {
    const rect = barRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e) => {
    if (!total) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragRatio(ratioFromEvent(e.clientX));
  };

  const handlePointerMove = (e) => {
    if (dragRatio === null) return;
    setDragRatio(ratioFromEvent(e.clientX));
  };

  const handlePointerUp = (e) => {
    if (dragRatio === null) return;
    const r = ratioFromEvent(e.clientX);
    setDragRatio(null);
    onSeek(r * total);
  };

  const shownMs = dragRatio !== null ? dragRatio * total : position || 0;

  return (
    <div className="w-full select-none">
      {/* Área de toque generosa (py) em volta da barra fina */}
      <div
        ref={barRef}
        className="relative py-2 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragRatio(null)}
      >
        <div className="h-1.5 w-full rounded-full bg-white/25">
          <div
            className="h-1.5 rounded-full bg-[#D6B45E]"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        {/* Bolinha de arrasto */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#D6B45E] border-2 border-[#253251] shadow transition-transform ${
            dragRatio !== null ? "w-5 h-5" : "w-3.5 h-3.5"
          }`}
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-sm font-medium tabular-nums text-white -mt-0.5">
        <span>{formatMs(shownMs)}</span>
        <span>{formatMs(total)}</span>
      </div>
    </div>
  );
}