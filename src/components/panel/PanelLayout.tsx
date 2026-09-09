import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell, LogOut, Menu, X, LayoutDashboard, Clapperboard, BookOpen,
  ListVideo, ListChecks, FolderKanban, Settings,
} from "lucide-react";
import logo from "../../assets/logo.svg";
import { useBiblioteca } from "../../store/biblioteca";
import { useAuth } from "../../store/auth";

// ─── Enlaces del menú lateral ────────────────────────────────────────────────

const ENLACES = [
  { a: "/panel", etiqueta: "Inicio", Icono: LayoutDashboard, exacto: true },
  { a: "/panel/catalogo-anime", etiqueta: "Catálogo de anime", Icono: Clapperboard },
  { a: "/panel/catalogo-manga", etiqueta: "Catálogo de manga", Icono: BookOpen },
  { a: "/panel/listas-anime", etiqueta: "Listas de anime", Icono: ListVideo },
  { a: "/panel/listas-manga", etiqueta: "Listas de manga", Icono: ListChecks },
  { a: "/panel/grupos", etiqueta: "Grupos", Icono: FolderKanban },
  { a: "/panel/configuracion", etiqueta: "Configuración", Icono: Settings },
] as const;

const NOTIFICACIONES = [
  "Nuevo episodio de Frieren disponible",
  "3 mangas de tu lista actualizaron capítulo",
  "Tu grupo «Clásicos» tiene 2 títulos sin ordenar",
];

// ─── Barra superior del panel ────────────────────────────────────────────────

function PanelNavbar({ onToggleMenu }: { onToggleMenu: () => void }) {
  const { usuario, cerrarSesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 sm:px-6 bg-[#0a0910]/95 backdrop-blur-md border-b border-[#2a2140]">
      <button
        onClick={onToggleMenu}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8]"
        aria-label="Abrir menú lateral"
      >
        <Menu className="w-4 h-4" />
      </button>

      <Link to="/" className="flex items-center shrink-0" aria-label="ANILEZ — Ir al inicio">
        <img src={logo} alt="ANILEZ" className="h-6 w-auto" />
      </Link>

      <div className="flex-1" />

      {/* Notificaciones */}
      <div className="relative">
        <button
          onClick={() => setAbierto(o => !o)}
          aria-label={`Notificaciones (${NOTIFICACIONES.length} sin leer)`}
          aria-expanded={abierto}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] hover:border-[#946ed9]/50 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#946ed9] text-white text-[10px] font-semibold flex items-center justify-center">
            {NOTIFICACIONES.length}
          </span>
        </button>
        {abierto && (
          <div className="absolute right-0 mt-2 w-72 bg-[#110f1a] border border-[#2a2140] rounded-2xl shadow-xl p-2">
            <p className="px-3 py-2 text-xs uppercase tracking-wider text-[#8b82a8]">Alertas</p>
            <ul className="space-y-1">
              {NOTIFICACIONES.map(n => (
                <li key={n} className="px-3 py-2 text-sm text-[#f0eefa] rounded-xl hover:bg-[#1c1928]">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-2 pl-1 sm:pl-3 sm:border-l border-[#2a2140]">
        <span className="w-9 h-9 rounded-full bg-[#1c1928] border border-[#2a2140] overflow-hidden flex items-center justify-center shrink-0">
          {usuario?.avatar
            ? <img src={usuario.avatar} alt="" className="w-full h-full object-cover" />
            : <span className="text-xs font-bold text-[#946ed9]">{(usuario?.nombre ?? "?")[0].toUpperCase()}</span>}
        </span>
        <span className="hidden sm:block text-sm font-semibold" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          {usuario?.nombre ?? ""}
        </span>
      </div>

      <button
        onClick={() => { cerrarSesion(); navigate("/"); }}
        className="h-10 px-3 sm:px-4 flex items-center gap-2 text-sm font-semibold rounded-xl border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 hover:bg-[#16141e] transition-colors"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </button>
    </header>
  );
}

// ─── Menú lateral ────────────────────────────────────────────────────────────

function PanelSidebar({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const { entradas } = useBiblioteca();
  const conteo = (medio: "anime" | "manga") => entradas.filter(e => e.medio === medio).length;

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={cerrar} aria-hidden="true" />
      )}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-0 h-dvh lg:h-[calc(100dvh-4rem)] w-64 shrink-0 bg-[#110f1a] border-r border-[#2a2140] p-3 overflow-y-auto transition-transform duration-200 ${
          abierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Navegación del panel"
      >
        <div className="flex items-center justify-between lg:hidden mb-3 px-1 mt-2">
          <img src={logo} alt="ANILEZ" className="h-5 w-auto" />
          <button onClick={cerrar} aria-label="Cerrar menú" className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2140] text-[#8b82a8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1 mt-8">
          {ENLACES.map(({ a, etiqueta, Icono, ...rest }) => (
            <NavLink
              key={a}
              to={a}
              end={"exacto" in rest ? rest.exacto : false}
              onClick={cerrar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-[#946ed9]/15 text-[#f0eefa] border border-[#946ed9]/40"
                    : "text-[#8b82a8] hover:text-[#f0eefa] hover:bg-[#1c1928] border border-transparent"
                }`
              }
            >
              <Icono className="w-4 h-4 shrink-0" />
              <span className="truncate">{etiqueta}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 p-3 rounded-2xl bg-[#16141e] border border-[#2a2140]">
          <p className="text-xs uppercase tracking-wider text-[#8b82a8] mb-2">Mi biblioteca</p>
          <p className="text-sm text-[#f0eefa]">{conteo("anime")} animes guardados</p>
          <p className="text-sm text-[#f0eefa]">{conteo("manga")} mangas guardados</p>
        </div>
      </aside>
    </>
  );
}

// ─── Layout del panel ────────────────────────────────────────────────────────

export default function PanelLayout() {
  const [menu, setMenu] = useState(false);
  const { usuario } = useAuth();
  const { sincronizarConAuth, sincronizarConBackend } = useBiblioteca();

  useEffect(() => {
    if (usuario) {
      sincronizarConAuth(usuario);
      sincronizarConBackend();
    }
  }, [usuario, sincronizarConAuth, sincronizarConBackend]);

  return (
      <div
        className="min-h-dvh bg-[#0a0910] text-[#f0eefa]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <PanelNavbar onToggleMenu={() => setMenu(o => !o)} />
        <div className="flex">
          <PanelSidebar abierto={menu} cerrar={() => setMenu(false)} />
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
  );
}
