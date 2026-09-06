import { Link } from "react-router-dom";
import { TipoBadge, PuntuacionBadge } from "./badges";

export interface AnimeCardData {
  id: number;
  title: string;
  img: string;
  type: string;
  year: number | null;
  score: number | null;
}

// ─── Tarjeta de anime/manga reutilizable (grillas y navegador) ───────────────

interface Props {
  anime: AnimeCardData;
  medio?: "anime" | "manga";
}

export default function AnimeCard({ anime, medio = "anime" }: Props) {
  return (
    <Link to={`/${medio}/${anime.id}`} className="block group">
      <div className="bg-[#110f1a] rounded-2xl overflow-hidden border border-[#2a2140] group-hover:border-[#946ed9]/40 transition-all duration-200 group-hover:-translate-y-0.5 shadow-lg">
        <div className="relative aspect-[2/3] bg-[#1c1928]">
          <img
            src={anime.img}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <TipoBadge tipo={anime.type} />
          </div>
          {anime.score != null && anime.score > 0 && (
            <div className="absolute top-2 left-2">
              <PuntuacionBadge score={anime.score} />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3
            className="font-semibold truncate text-[13px] mb-1 uppercase tracking-wide"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            {anime.title}
          </h3>
          <p className="text-[#8b82a8] text-xs">{anime.year || "Sin confirmar"}</p>
        </div>
      </div>
    </Link>
  );
}