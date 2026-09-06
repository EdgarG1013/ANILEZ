import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, TrendingUp } from "lucide-react";
import type { PopularItem } from "../../api/catalogoService";

interface MostPopularCarouselProps {
  items: PopularItem[];
  /** Título de la sección (Anime / Manga) */
  title: string;
  /** Etiqueta del enlace "Ver todo" */
  viewAllLabel?: string;
  /** Ruta base para los enlaces de detalle */
  basePath: string;
  /** Si es true, invierte el orden de las columnas en desktop: poster → sinopsis → título */
  reverse?: boolean;
}

function truncateSynopsis(text: string | null, maxWords: number = 100): string {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function MostPopularCarousel({ items, title, viewAllLabel = "Ver todo", basePath, reverse = false }: MostPopularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeState, setFadeState] = useState<"visible" | "fading-out" | "fading-in">("visible");

  const carouselItems = items.slice(0, 5);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setFadeState("fading-out");
      setCurrentIndex(index);
    },
    [isTransitioning],
  );

  // Cuando termina el fade-out, se cambia el contenido y se hace fade-in
  useEffect(() => {
    if (fadeState === "fading-out") {
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex);
        setFadeState("fading-in");
      }, 250);
      return () => clearTimeout(timer);
    }

    if (fadeState === "fading-in") {
      const timer = setTimeout(() => {
        setFadeState("visible");
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fadeState, currentIndex]);

  const goPrev = useCallback(() => {
    goTo(currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1);
  }, [currentIndex, carouselItems.length, goTo]);

  const goNext = useCallback(() => {
    goTo(currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, carouselItems.length, goTo]);

  if (carouselItems.length === 0) return null;

  // displayIndex solo cambia a mitad de la transición
  const item = carouselItems[displayIndex];

  const contentStyle: React.CSSProperties = {
    transition: "opacity 0.25s ease, transform 0.3s ease",
    opacity: fadeState === "fading-out" ? 0 : 1,
    transform: fadeState === "fading-out" ? "translateX(-12px)" : "translateX(0)",
  };

  const navButtons = (
    <>
      <button
        onClick={goPrev}
        disabled={isTransitioning}
        aria-label="Anterior"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8] hover:border-[#946ed9]/50 hover:bg-[#16141e] hover:text-[#f0eefa] transition-colors disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={goNext}
        disabled={isTransitioning}
        aria-label="Siguiente"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8] hover:border-[#946ed9]/50 hover:bg-[#16141e] hover:text-[#f0eefa] transition-colors disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </>
  );

  return (
    <section className="mb-12">
      {/* Encabezado de la sección */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#946ed9]/15">
            <TrendingUp size={14} className="text-[#946ed9]" />
          </div>
          <h2 className="text-[#f0eefa] text-[1.5rem] font-semibold" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            {title}
          </h2>
        </div>
        <Link
          to={basePath}
          className="flex items-center gap-1 text-sm text-[#946ed9] transition-all hover:gap-2 hover:text-[#b08ee8]"
        >
          {viewAllLabel} <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Desktop: grid de 3 columnas (visible ≥1024px) ── */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: reverse ? "300px 1fr 360px" : "360px 1fr 300px",
          gap: "32px",
        }}
      >
        {/* Columna Título + Meta / Flechas de navegación */}
        <div
          className="flex flex-col justify-between"
          style={{ minHeight: "460px", order: reverse ? 3 : 1 }}
        >
          <div style={contentStyle}>
            <Link to={`${item.medio}/${item.id}`}>
              <h3
                className="text-[#f0eefa] uppercase cursor-pointer transition-colors hover:text-[#946ed9]"
                style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: "clamp(3rem, 3vw, 2.6rem)",
                  lineHeight: "0.8",
                  letterSpacing: "-0.01em",
                  margin: "0 0 14px 0",
                }}
              >
                {item.title}
              </h3>
            </Link>

            <div
              className="text-[#8b82a8] flex items-center gap-2.5"
              style={{ fontSize: "0.875rem" }}
            >
              {item.year && <span>{item.year}</span>}
              {item.year && item.count && (
                <span className="w-px h-3.5 bg-[#8b82a8] opacity-40 inline-block" />
              )}
              {item.count && (
                <span>
                  {item.count} {item.countLabel}
                  {item.count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Flechas — fuera de contentStyle para que no parpadeen */}
          <div className="flex gap-2.5">{navButtons}</div>
        </div>

        {/* Columna Sinopsis + Géneros / Ranking */}
        <div
          className="flex flex-col justify-between"
          style={{ minHeight: "460px", order: 2 }}
        >
          <div style={contentStyle}>
            <p
              className="text-[#8b82a8] mb-6"
              style={{ fontSize: "0.85rem", lineHeight: "1.8" }}
            >
              {truncateSynopsis(item.synopsis)}
            </p>

            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.genres.slice(0, 6).map(genre => (
                  <span
                    key={genre}
                    className="text-[#f0eefa] whitespace-nowrap"
                    style={{
                      padding: "5px 16px",
                      borderRadius: "20px",
                      border: "1px solid #2a2140",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ranking */}
          <div
            className="text-[#946ed9] self-end"
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: "3rem",
              lineHeight: 1,
              letterSpacing: "0.02em",
              ...contentStyle,
            }}
          >
            #{displayIndex + 1}
          </div>
        </div>

        {/* Columna Poster */}
        <div style={{ height: "100%", order: reverse ? 1 : 3, ...contentStyle }}>
          <Link
            to={`${item.medio}/${item.id}`}
            className="block h-full overflow-hidden rounded-2xl"
            style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)" }}
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full"
              loading="eager"
            />
          </Link>
        </div>
      </div>

      {/* ── Mobile / Tablet (visible <1024px) ── */}
      <div className="lg:hidden bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-0">
          {/* Poster */}
          <div style={contentStyle}>
            <Link
              to={`${basePath}/${item.id}`}
              className="block relative sm:h-full aspect-[2/3] sm:aspect-auto overflow-hidden"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </Link>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between p-5 min-h-[200px]">
            <div style={contentStyle}>
              <Link to={`${item.medio}/${item.id}`}>
                <h3
                  className="text-[#f0eefa] uppercase tracking-tight leading-none mb-3 cursor-pointer transition-colors hover:text-[#946ed9]"
                  style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "1.75rem", lineHeight: 0.95 }}
                >
                  {item.title}
                </h3>
              </Link>

              <div className="flex items-center gap-2 text-[#8b82a8] text-sm mb-3">
                {item.year && <span>{item.year}</span>}
                {item.year && item.count && <span className="w-px h-3.5 bg-[#8b82a8] opacity-40" />}
                {item.count && (
                  <span>
                    {item.count} {item.countLabel}
                    {item.count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <p className="text-[#8b82a8] text-sm leading-relaxed mb-4">
                {truncateSynopsis(item.synopsis, 50)}
              </p>

              {item.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.genres.slice(0, 5).map(genre => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full border border-[#2a2140] text-[#c4bbd8] text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ranking + navegación */}
            <div className="flex items-center justify-between mt-5">
              <span
                className="font-extrabold text-[#946ed9]"
                style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "1.5rem", lineHeight: 1, ...contentStyle }}
              >
                #{displayIndex + 1}
              </span>
              <div className="flex gap-2">{navButtons}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(MostPopularCarousel);