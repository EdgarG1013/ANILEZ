import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { obtenerDetalleManga, type MangaDetalle } from "../../api/catalogoService";
import MangaHeroBanner from "../../components/anime/MangaHeroBanner";
import AnimeSynopsis from "../../components/anime/AnimeSynopsis";
import AnimeCharacters from "../../components/anime/AnimeCharacters";
import AnimeOfficialSite from "../../components/anime/AnimeOfficialSite";
import AnimeHorizontalCarousel from "../../components/anime/AnimeHorizontalCarousel";
import DetalleSkeleton from "../../components/compartido/DetalleSkeleton";
import DetalleNoEncontrado from "../../components/compartido/DetalleNoEncontrado";

function InfoFila({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <dt className="text-muted-foreground text-xs shrink-0">{label}</dt>
      <dd className="text-muted-foreground text-xs text-right font-medium">{value}</dd>
    </div>
  );
}

export default function MangaDetalladoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manga, setManga] = useState<MangaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    obtenerDetalleManga(Number(id))
      .then(d => vivo && setManga(d))
      .catch(() => vivo && setManga(null))
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

  if (!manga) {
    return <DetalleNoEncontrado medio="manga" onVolver={handleVolver} />;
  }

  const handleSeleccionar = (nuevoId: number) => navigate(`/panel/manga/${nuevoId}`);

  return (
    <div className="min-h-screen bg-background">
      <MangaHeroBanner manga={manga} onVolver={handleVolver} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <AnimeSynopsis sinopsis={manga.sinopsis} />
            <AnimeCharacters personajes={manga.personajes} />

            {manga.similares.length > 0 && (
              <AnimeHorizontalCarousel
                titulo="Recomendados"
                icono={<Star size={16} className="text-muted-foreground" />}
                items={manga.similares}
                onSeleccionar={handleSeleccionar}
              />
            )}
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
              <h3 className="text-foreground mb-4 text-sm font-semibold">Información</h3>
              <dl className="space-y-3">
                <InfoFila label="Puntuación" value={manga.score ? `${manga.score} / 10` : "—"} />
                <InfoFila label="Votos" value={manga.votos ? String(manga.votos) : "—"} />
                <InfoFila label="Ranking" value={manga.rank ? `#${manga.rank}` : "—"} />
                <InfoFila label="Popularidad" value={manga.popularidad ? `#${manga.popularidad}` : "—"} />
                <InfoFila label="Tipo" value={manga.tipo || "—"} />
                <InfoFila label="Año" value={manga.year ? String(manga.year) : "—"} />
                <InfoFila label="Capítulos" value={manga.capitulos ? String(manga.capitulos) : "—"} />
                <InfoFila label="Volúmenes" value={manga.volumenes ? String(manga.volumenes) : "—"} />
                <InfoFila label="Estado" value={manga.estado || "—"} />
                {manga.autores[0] && <InfoFila label="Autor" value={manga.autores.join(", ")} />}
              </dl>
            </div>
            <AnimeOfficialSite externales={manga.externales} />
          </div>
        </div>
      </main>
    </div>
  );
}