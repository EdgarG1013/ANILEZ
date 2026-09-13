import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmacion: string;
  textoBoton?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  titulo,
  mensaje,
  textoConfirmacion,
  textoBoton = "Eliminar",
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const coincide = input === textoConfirmacion;

  useEffect(() => {
    if (open) {
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#16141e] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b82a8] hover:text-[#f0eefa] transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono */}
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        {/* Título */}
        <h2
          className="text-lg font-bold text-[#f0eefa] mb-2"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          {titulo}
        </h2>

        {/* Mensaje */}
        <p className="text-sm text-[#8b82a8] mb-5">{mensaje}</p>

        {/* Input de confirmación */}
        <div className="mb-5">
          <label htmlFor="confirm-delete" className="block text-xs text-[#8b82a8] mb-3">
            Escribe <span className="font-semibold text-[#f0eefa]">{textoConfirmacion}</span> para confirmar:
          </label>
          <input
            ref={inputRef}
            id="confirm-delete"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={textoConfirmacion}
            className={[
              "w-full h-10 bg-[#0d0b16] border rounded-xl px-3 text-sm text-[#f0eefa]",
              "placeholder:text-[#4a4360] focus:outline-none transition-colors",
              input.length > 0 && !coincide
                ? "border-red-500/60 focus:border-red-500"
                : coincide
                  ? "border-emerald-500/60 focus:border-emerald-500"
                  : "border-[#2a2140] focus:border-[#946ed9]",
            ].join(" ")}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 disabled:opacity-40 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!coincide || loading}
            className="h-10 px-4 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
          >
            {loading ? "Eliminando…" : textoBoton}
          </button>
        </div>
      </div>
    </div>
  );
}
