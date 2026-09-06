import { RefreshCw } from "lucide-react";
import ilustracionError from "../../assets/ani-error-catalogo-no-found.png";

const MICROCOPAS = [
  "¡Los datos se nos escaparon! Parece que la bibliotecaria tropeó con el cable del servidor.",
  "¡Ups! Algo se rompió por aquí. No te preocupes, la bibliotecaria ya está revisando los estantes.",
  "¡AYYY! Los registros se cayeron del estante. Dame un segundo para recogerlos todos.",
  "¡Error inesperado! La bibliotecaria está buscando los libros debajo del escritorio.",
  "¡Los catálogos se desordenaron! Parece que un gato virtual se metió en el servidor.",
];

function microcopaAleatoria(): string {
  const idx = Math.floor(Math.random() * MICROCOPAS.length);
  return MICROCOPAS[idx];
}

export default function CatalogoError({ onReintentar }: { onReintentar: () => void }) {
  const texto = microcopaAleatoria();

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-14 lg:gap-20 py-10 px-4 text-center md:text-left">
      {/* Ilustración + bocadillo */}
      <div className="order-1 flex flex-col items-center justify-center">
        <div className="relative mb-4 max-w-sm sm:max-w-md md:max-w-lg">
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
          src={ilustracionError}
          alt="Bibliotecaria anime frustrada con libros volando"
          className="w-48 xs:w-56 sm:w-64 md:w-72 lg:w-80 h-auto object-contain drop-shadow-[0_16px_32px_rgba(148,110,217,0.22)]"
          loading="eager"
        />
      </div>

      {/* Texto */}
      <div className="order-2">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#f0eefa] leading-tight mb-4"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          ¡No pudimos cargar el{" "}
          <span className="text-[#946ed9]">catálogo</span>!
        </h2>
        <p className="text-[#a89fc4] text-sm sm:text-base md:text-lg mb-8 max-w-lg">
          Tranquilo, es solo un problemilla técnico. La bibliotecaria ya está
          intentando arreglarlo. Puedes intentar de nuevo o volver más tarde.
        </p>

        <button
          onClick={onReintentar}
          className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-6 sm:px-8 rounded-xl text-white text-sm sm:text-base font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
        >
          <RefreshCw size={18} /> Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
