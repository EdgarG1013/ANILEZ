import { useState, useEffect } from "react";
import { Star, Play } from "lucide-react";
import { obtenerHero, type HeroItem } from "../../api/catalogoService";

// ─── Hero — Carrusel principal ────────────────────────────────────────────────

export default function HeroSection() {
  const [hero, setHero] = useState<HeroItem[]>([]);
  const [slideActual, setSlideActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    obtenerHero()
      .then(h => vivo && setHero(h))
      .catch(() => vivo && setHero([]))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, []);

  // Avanza el carrusel automáticamente cada 6 segundos
  useEffect(() => {
    if (hero.length === 0) return;
    const intervalo = setInterval(() => {
      setSlideActual(s => (s + 1) % hero.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, [hero.length]);

  if (cargando || hero.length === 0) {
    return (
      <section className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] overflow-hidden bg-[#0a0910]" aria-label="Anime destacado">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#946ed9] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const heroActual = hero[slideActual];

  return (
    <section
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] overflow-hidden bg-[#0a0910]"
      aria-label="Anime destacado"
    >
      {/* Imagen de fondo con degradados para legibilidad del texto */}
      <div className="absolute inset-0">
        <img
          key={heroActual.id}
          src={heroActual.img}
          alt={heroActual.title}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ objectPosition: "50% 20%" }}
        />
        {/* Degradado lateral (izquierda opaca, derecha transparente) */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(10,9,16,0.94) 0%, rgba(10,9,16,0.65) 45%, rgba(10,9,16,0.15) 100%)" }}
        />
        {/* Degradado inferior para integrar con el fondo de la página */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, #0a0910 0%, rgba(10,9,16,0) 40%)" }}
        />
      </div>

      {/* Contenido del hero */}
      <div className="relative h-full flex items-center max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="max-w-sm sm:max-w-md lg:max-w-xl">

          {/* Badges de puntuación y tipo */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="flex items-center gap-1.5 text-white text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
            >
              <Star className="w-3 h-3 fill-white" />
              {heroActual.score}
            </span>
            <span className="text-white text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {heroActual.type} · {heroActual.year}
            </span>
          </div>

          {/* Título principal */}
          <h1
            className="font-extrabold text-white leading-none tracking-tight mb-2 text-3xl sm:text-5xl lg:text-[3.5rem]"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            {heroActual.title}
          </h1>
          <p className="text-white/55 mb-3 text-sm">{heroActual.altTitle}</p>

          {/* Metadatos del anime */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm font-semibold">{heroActual.score}</span>
            </div>
            <span className="text-white/30">•</span>
            <span className="text-white/70 text-sm">{heroActual.studio}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/70 text-sm">{heroActual.eps} eps.</span>
          </div>

          {/* Géneros */}
          <div className="flex flex-wrap gap-2 mb-4">
            {heroActual.genres.map(g => (
              <span
                key={g}
                className="text-white/90 text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Sinopsis recortada a 3 líneas */}
          <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-3">
            {heroActual.synopsis}
          </p>

          {/* Botón de acción */}
          <a
            href={`/anime/${heroActual.id}`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
          >
            <Play className="w-4 h-4 fill-white" />
            Ver detalles
          </a>
        </div>
      </div>

      {/* Indicadores de posición del carrusel */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {hero.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlideActual(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === slideActual
                ? "w-5 h-2.5 bg-[#946ed9]"
                : "w-2.5 h-2.5 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
