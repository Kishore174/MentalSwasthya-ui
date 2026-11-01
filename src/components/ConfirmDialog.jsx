import React, { useEffect, useRef } from "react";
import { FiAlertTriangle, FiPause, FiTrash2 } from "react-icons/fi";

const ICONS = { warning: FiAlertTriangle, pause: FiPause, danger: FiTrash2 };

const TONES = {
  warning: { icon: "bg-amber-100 text-amber-600", button: "bg-[#1e382b] hover:bg-[#14281e]" },
  pause: { icon: "bg-[#e3efdb] text-[#4f6b3c]", button: "bg-[#1e382b] hover:bg-[#14281e]" },
  danger: { icon: "bg-red-100 text-red-600", button: "bg-red-600 hover:bg-red-700" },
};

// In-app replacement for window.confirm: a centred card on a blurred backdrop (bottom sheet on phones).
// Esc or a tap outside cancels; focus starts on the safe (cancel) action.
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (cancelRef.current) cancelRef.current.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const Icon = ICONS[tone] || FiAlertTriangle;
  const colors = TONES[tone] || TONES.warning;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-sm"
      style={{ animation: "cdFade .2s ease" }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <style>{`
        @keyframes cdFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cdPop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .cd-card { animation: none !important; } }
      `}</style>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        aria-describedby="cd-message"
        className="cd-card w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-[0_24px_70px_rgba(10,24,16,0.45)]"
        style={{ animation: "cdPop .3s cubic-bezier(.22,1,.36,1)" }}
      >
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${colors.icon}`}>
          <Icon size={26} aria-hidden="true" />
        </div>
        <h2 id="cd-title" className="mt-4 text-lg font-black text-[#22331b]">{title}</h2>
        <p id="cd-message" className="mt-1.5 text-sm leading-6 text-gray-500">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-[48px] rounded-2xl border border-[#dbe7d3] bg-white text-sm font-bold text-[#3a4d31] transition hover:bg-[#f3f8ef] cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[48px] rounded-2xl text-sm font-bold text-white shadow-lg transition cursor-pointer ${colors.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
