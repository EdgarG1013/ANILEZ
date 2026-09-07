import React from "react";
import { Bookmark, Star, TrendingUp } from "lucide-react";
import logo from "../../assets/logo.svg";
import bgAuth from "../../assets/bg-auth.webp";

// ─── Layout compartido para las páginas de autenticación ─────────────────────
// Divide la pantalla en dos paneles:
//  - Izquierda: collage de fondo + marca ANILEZ + texto descriptivo + features (oculto en móvil)
//  - Derecha: contenedor del formulario
// Es responsivo: en móvil la parte de marca no se muestra.

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: Bookmark,
    title: "Organiza",
    description: "Tus animes y mangas en un solo lugar.",
  },
  {
    icon: Star,
    title: "Califica y reseña",
    description: "Comparte tu opinión y descubre nuevas joyas.",
  },
  {
    icon: TrendingUp,
    title: "Estadísticas",
    description: "Visualiza tu progreso y hábitos de visualización.",
  },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#0a0910] text-[#f0eefa]">
      {/* ── Panel de marca — oculto en móvil ── */}
      <div
        className="hidden lg:flex flex-col justify-center flex-1 px-12 xl:px-20 border-r border-[#2a2140] relative"
        style={{
          backgroundImage:
            `linear-gradient(rgba(10, 9, 16, 0.7), rgba(10, 9, 16, 0.7)), url(${bgAuth})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <img src={logo} alt="ANILEZ" className="h-20 w-auto mb-15 self-start" />

        {/* Título */}
        <h1
          className="text-4xl font-extrabold mb-4 leading-tight"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          Tu universo anime,
          <br />
          <span className="text-[#946ed9]">organizado.</span>
        </h1>

        {/* Descripción */}
        <p className="text-[#8b82a8] max-w-md leading-relaxed mb-12">
          Descubre, guarda y disfruta tus animes y mangas favoritos. Lleva tu
          seguimiento al siguiente nivel con reseñas, calificaciones y mucho
          más.
        </p>

        {/* Features */}
        <div className="flex gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-4 max-w-[160px]">
              <Icon className="h-6 w-6 text-[#946ed9]" strokeWidth={2} />
              <span className="font-bold text-xl text-[#f0eefa]"
                style={{ fontFamily: "'Oxanium', sans-serif" }}>
                {title}
              </span>
              <span className="text-sm text-[#8b82a8] leading-snug">
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel del formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}