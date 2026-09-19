import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, ArrowRight, Zap } from "lucide-react";
import logo from "../../assets/logo.svg";
import bgAuth from "../../assets/bg-auth.webp";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(6,5,14,0.75)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-[720px] rounded-3xl overflow-hidden border border-[#2a2140] shadow-2xl flex flex-col md:flex-row"
        style={{ backgroundColor: "#110f1a", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Lado izquierdo — imagen + logo */}
        <div className="relative h-52 md:h-auto md:w-[320px] shrink-0">
          <img
            src={bgAuth}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(148,110,217,0.25) 0%, rgba(10,9,16,0.7) 100%)" }}
          />
          <div className="absolute inset-0 flex items-end p-6 md:p-8">
            <img src={logo} alt="ANILEZ" className="h-7 md:h-8 w-auto drop-shadow-lg" />
          </div>
        </div>

        {/* Lado derecho — CTA */}
        <div className="flex-1 p-7 md:p-10 flex flex-col justify-center">
          <div className="w-11 h-11 rounded-full bg-[#946ed9]/15 flex items-center justify-center mb-5">
            <Lock size={20} className="text-[#946ed9]" />
          </div>

          <h2
            className="text-[#f0eefa] text-2xl font-bold leading-snug mb-3"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            Guarda tus favoritos{" "}
            <span className="text-[#946ed9]">y sigue tu progreso</span>
          </h2>

          <p className="text-[#8b82a8] text-sm leading-relaxed mb-7">
            Inicia sesión o crea una cuenta para agregar animes a tus listas, calificar, escribir reseñas y mucho más.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate("/iniciar-sesion"); }}
              className="w-full h-12 flex items-center justify-center gap-2 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
            >
              Iniciar sesión
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => { onClose(); navigate("/registro"); }}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border border-[#2a2140] text-[#f0eefa] hover:bg-[#1c1928] transition-colors"
            >
              Crear cuenta
            </button>
          </div>

          <div className="flex items-center gap-2 mt-5 text-[#8b82a8] text-xs">
            <Zap size={13} className="text-[#946ed9]" />
            Es rápido, gratis y seguro.
          </div>
        </div>
      </div>
    </div>
  );
}