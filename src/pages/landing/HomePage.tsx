import HeroSection from "../../components/landing/HeroSection";
import SeasonSection from "../../components/landing/SeasonSection";
import ProximosSection from "../../components/landing/ProximosSection";
import MostPopularSection from "../../components/landing/MostPopularSection";
import SEOHead from "../../components/compartido/SEOHead";

// ─── Página de inicio — Landing page ─────────────────────────────────────────
// Compone las secciones de la landing. Cada sección vive en /components/landing.

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ANILEZ",
  url: "https://anilez.site",
  description: "Catálogo de anime y manga. Organiza tu biblioteca y descubre nuevos títulos.",
  inLanguage: "es",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://anilez.site/explorar?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <div>
      <SEOHead
        titulo="ANILEZ — Catálogo de Anime y Manga"
        descripcion="Explora el catálogo completo de anime y manga. Organiza tu biblioteca, sigue tu progreso y descubre nuevos títulos."
        url="https://anilez.site/"
        jsonLd={JSON_LD}
      />

      {/* HERO — Carrusel principal */}
      <HeroSection />

      {/* Contenido principal */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* En Temporada */}
        <SeasonSection />

        {/* Más Populares — anime y manga */}
        <MostPopularSection />

        {/* Próximos estrenos */}
        <ProximosSection />
        
      </main>
    </div>
  );
}