import { Outlet } from "react-router-dom";
import Navbar from "./components/compartido/Navbar";
import Footer from "./components/compartido/Footer";
import { BibliotecaProvider } from "./store/biblioteca";

// ─── Layout principal de ANILEZ ──────────────────────────────────────────────
// Envuelve todas las páginas con la barra de navegación y el pie de página.
// El contenido de cada ruta se renderiza a través de <Outlet />.

export default function App() {
  return (
    <BibliotecaProvider>
      <div
        className="min-h-screen bg-[#0a0910] text-[#f0eefa] overflow-x-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Barra de navegación superior (sticky) */}
        <Navbar />

        {/* Contenido de la ruta activa */}
        <Outlet />

        {/* Pie de página */}
        <Footer />
      </div>
    </BibliotecaProvider>
  );
}
