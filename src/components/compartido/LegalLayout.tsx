import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/favicon.svg";

// ─── Layout compartido para páginas legales (Privacidad / Términos) ──────────

export default function LegalLayout({
  etiqueta,
  titulo,
  intro,
  ultimaActualizacion,
  children,
}: {
  etiqueta: string;
  titulo: ReactNode;
  intro: string;
  ultimaActualizacion: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0910] text-[#f0eefa] relative overflow-hidden">
      {/* Resplandor decorativo superior */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(148,110,217,0.14), transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-10 pb-20">
        {/* Cabecera */}
        <header className="mb-10 sm:mb-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors mb-8"
          >
            <ArrowLeft size={18} /> Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="ANILEZ" className="h-20 w-auto" />
          </div>

          <p className="text-[#946ed9] text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-6">
            {etiqueta}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4">
            {titulo}
          </h1>
          <p className="text-[#a89fc4] text-sm sm:text-base leading-relaxed mb-3">
            {intro}
          </p>
          <p className="text-[#6f6890] text-xs">
            Última actualización: {ultimaActualizacion}
          </p>
        </header>

        {/* Contenido del documento */}
        <div className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-[#c4bcd9]">
          {children}
        </div>
      </div>
    </main>
  );
}

// ─── Sección numerada ────────────────────────────────────────────────────────

export function Seccion({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-baseline gap-3 text-lg sm:text-xl font-bold text-[#f0eefa] mb-3">
        <span
          className="text-[#946ed9] text-xs sm:text-sm font-semibold tracking-wider shrink-0"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          {numero}
        </span>
        {titulo}
      </h2>
      <div className="pl-0 sm:pl-9 space-y-3">{children}</div>
    </section>
  );
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-semibold text-[#f0eefa] pt-1">{children}</h3>
  );
}

export function Parrafo({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function Lista({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-[#946ed9]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
