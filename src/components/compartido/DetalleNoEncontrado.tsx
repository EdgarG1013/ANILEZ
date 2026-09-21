import { Home } from "lucide-react";
import ilustracionAnime from "../../assets/ani-error-anime-no-found.png";
import ilustracionManga from "../../assets/ani-error-manga-no-found.png";

const MICROCOPIA_ANIME = [
  "¡Oops! La bibliotecaria buscó tanto este anime que terminó transportada a un isekai.",
  "¡Error 404! La TV retro se puso triste y se negó a reproducir este anime.",
  "¡AYYY! Los registros de este anime se cayeron del estante. Dame un segundo para recogerlos.",
  "Parece que este anime está en 'filler' o aún no ha sido adaptado. ¡No lo encontramos!",
  "¡La bibliotecaria usó su jutsu de búsqueda, pero este anime sigue desaparecido!",
];

const MICROCOPIA_MANGA = [
  "¡Ayuda! ¡Una avalancha de tomos acaba de sepultar a la bibliotecaria!",
  "¡Los datos del manga se evaporaron! La bibliotecaria tropezó con el cable del servidor por llevar demasiados volúmenes.",
  "¡Maldición! Este capítulo entró en hiatus y no encontramos la ficha.",
  "¡Ups! Se nos cayeron todos los mangas del estante y este título quedó sepultado.",
  "¡Error! Un espíritu del manga desordenó el archivo y traspapeló esta obra.",
];

function microcopaAleatoria(medio: "anime" | "manga"): string {
  const lista = medio === "anime" ? MICROCOPIA_ANIME : MICROCOPIA_MANGA;
  return lista[Math.floor(Math.random() * lista.length)];
}

export default function DetalleNoEncontrado({
  medio,
  onVolver,
}: {
  medio: "anime" | "manga";
  onVolver: () => void;
}) {
  const texto = microcopaAleatoria(medio);
  const ilustracion = medio === "anime" ? ilustracionAnime : ilustracionManga;
  const titulo = medio === "anime" ? "anime" : "manga";
  const altText = medio === "anime"
    ? "Bibliotecaria anime confundida con televisor apagado"
    : "Bibliotecaria manga asustada con libros volando";

  return (
    <main className="min-h-screen bg-[#0a0910] text-[#f0eefa] flex items-center justify-center px-5 py-14 sm:py-20 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 20%, rgba(148,110,217,0.18), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-14 lg:gap-20 text-center md:text-left mt-[-32px]">
        {/* Ilustración + bocadillo */}
        <div className="order-1 md:order-2 flex flex-col items-center justify-center">
          <div className="relative mb-0 max-w-sm sm:max-w-md md:max-w-lg">
            <div
              className="relative z-10 rounded-2xl border-2 border-[#2a2140] bg-[#171327] p-5 sm:p-6 md:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              style={{ background: "linear-gradient(180deg, #1e1a30, #171327)" }}
            >
              <p className="text-[#f0eefa] text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                {texto}
              </p>
              <span
                className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                style={{
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "14px solid #171327",
                }}
              />
              <span
                className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                style={{
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderTop: "16px solid #2a2140",
                }}
              />
            </div>
          </div>

          <img
            src={ilustracion}
            alt={altText}
            className="w-64 xs:w-72 sm:w-80 md:w-96 lg:w-108 h-auto object-contain drop-shadow-[0_16px_32px_rgba(148,110,217,0.22)]"
            loading="eager"
          />
        </div>

        {/* Texto */}
        <div className="order-2 md:order-1">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            ¡No encontramos tu{" "}
            <span className="text-[#946ed9]">{titulo}</span>!
          </h1>
          <p className="text-[#a89fc4] text-sm sm:text-base md:text-lg mb-8 max-w-lg">
            No tenemos datos para el {titulo} que buscas. La bibliotecaria ya está
            revisando los estantes. Prueba con otro título o vuelve más tarde.
          </p>

          <button
            onClick={onVolver}
            className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-6 sm:px-8 rounded-xl text-white text-sm sm:text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
          >
            <Home size={18} /> Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}
