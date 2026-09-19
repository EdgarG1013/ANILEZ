import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Tv } from "lucide-react";
import { obtenerDetalleAnime, type AnimeDetalle } from "../../api/catalogoService";
import AnimeHeroBanner from "../../components/anime/AnimeHeroBanner";
import AnimeSynopsis from "../../components/anime/AnimeSynopsis";
import AnimeTrailer from "../../components/anime/AnimeTrailer";
import AnimeCharacters from "../../components/anime/AnimeCharacters";
import AnimeEpisodes from "../../components/anime/AnimeEpisodes";
import AnimeInfoSidebar from "../../components/anime/AnimeInfoSidebar";
import AnimeStreaming from "../../components/anime/AnimeStreaming";
import AnimeOfficialSite from "../../components/anime/AnimeOfficialSite";
import AnimeHorizontalCarousel from "../../components/anime/AnimeHorizontalCarousel";
import DetalleSkeleton from "../../components/compartido/DetalleSkeleton";
import DetalleNoEncontrado from "../../components/compartido/DetalleNoEncontrado";

export default function AnimeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anime, setAnime] = useState<AnimeDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    obtenerDetalleAnime(Number(id))
      .then(d => vivo && setAnime(d))
      .catch(() => vivo && setAnime(null))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [id]);

  const handleVolver = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (cargando) {
    return <DetalleSkeleton />;
  }

  // Anime no encontrado (id inválido o sin datos)
  if (!anime) {
    return <DetalleNoEncontrado medio="anime" onVolver={handleVolver} />;
  }

  const handleSeleccionar = (nuevoId: number) => navigate(`/panel/anime/${nuevoId}`);

  return (
    <div className="min-h-screen bg-background">
      <AnimeHeroBanner anime={anime} onVolver={handleVolver} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-10">
            <AnimeSynopsis sinopsis={anime.sinopsis} />
            <AnimeTrailer trailerYtId={anime.trailerYtId} />
            <AnimeCharacters personajes={anime.personajes} />
            <AnimeEpisodes episodios={anime.episodios} />

            {anime.relacionados.length > 0 && (
              <AnimeHorizontalCarousel
                titulo="Relacionados"
                icono={<Tv size={16} className="text-muted-foreground" />}
                items={anime.relacionados}
                onSeleccionar={handleSeleccionar}
              />
            )}

            {anime.similares.length > 0 && (
              <AnimeHorizontalCarousel
                titulo="Similares"
                icono={<Star size={16} className="text-muted-foreground" />}
                items={anime.similares}
                onSeleccionar={handleSeleccionar}
              />
            )}
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <AnimeInfoSidebar anime={anime} />
            <AnimeStreaming streaming={anime.streaming} />
            <AnimeOfficialSite externales={anime.externales} />
          </div>
        </div>
      </main>
    </div>
  );
}