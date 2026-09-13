import { createBrowserRouter } from "react-router-dom";
import App from "./App";
// ─── Paginas del home ───────────────────────────────────────────────
import HomePage from "./pages/landing/HomePage";
import BrowsePage from "./pages/landing/BrowsePage";
import AnimeDetalladoHomePage from "./pages/landing/AnimeDetalladoHomePage";
import MangaDetalladoHomePage from "./pages/landing/MangaDetalladoHomePage";
import PrivacidadPage from "./pages/landing/PrivacidadPage";
import TerminosPage from "./pages/landing/TerminosPage";
// ─── Paginas de autenticación ───────────────────────────────────────
import IniciarSesionPage from "./pages/autenticacion/IniciarSesionPage";
import RegistroPage from "./pages/autenticacion/RegistroPage";
import RecuperacionPasswordPage from "./pages/autenticacion/RecuperacionPasswordPage";
import RestablecerPasswordPage from "./pages/autenticacion/RestablecerPasswordPage";
import VerificarEmailPage from "./pages/autenticacion/VerificarEmailPage";
import AuthCallbackPage from "./pages/autenticacion/AuthCallbackPage";
// ─── Protección de rutas ────────────────────────────────────────────
import ProtectedRoute from "./components/ProtectedRoute";
// ─── Paginas del panel de usuario ─────────────────────────────────
import AnimeDetalladoPage from "./pages/anime/AnimeDetalladoPage";
import MangaDetalladoPage from "./pages/manga/MangaDetalladoPage";
import PanelLayout from "./components/panel/PanelLayout";
import { BibliotecaProvider } from "./store/biblioteca";
import InicioPage from "./pages/panel/InicioPage";
import CatalogoAnimePage from "./pages/panel/CatalogoAnimePage";
import CatalogoMangaPage from "./pages/panel/CatalogoMangaPage";
import ListasAnimePage from "./pages/panel/ListasAnimePage";
import ListasMangaPage from "./pages/panel/ListasMangaPage";
import GruposPage from "./pages/panel/GruposPage";
import GrupoDetalladoPage from "./pages/panel/GrupoDetallePage";
import ConfiguracionPage from "./pages/panel/ConfiguracionPage";
import EstadoPage from "./pages/panel/EstadoPage";
// ─── Pagina de error 404 ─────────────────────────────────────────────
import NotFoundPage from "./pages/error/NoEncontradoPage";

// ─── Definición centralizada de rutas ─────────────────────────────────────────
// Agrega aquí las rutas futuras del proyecto (detalle de anime/manga, etc.)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "explorar", element: <BrowsePage /> },
      { path: "anime/:id", element: <AnimeDetalladoHomePage /> },
      { path: "manga/:id", element: <MangaDetalladoHomePage /> },
      { path: "privacidad", element: <PrivacidadPage /> },
      { path: "terminos", element: <TerminosPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  // Páginas de autenticación — a pantalla completa, sin Navbar/Footer
  { path: "/iniciar-sesion", element: <IniciarSesionPage /> },
  { path: "/registro", element: <RegistroPage /> },
  { path: "/recuperar-password", element: <RecuperacionPasswordPage /> },
  { path: "/restablecer-password", element: <RestablecerPasswordPage /> },
  { path: "/verificar-email", element: <VerificarEmailPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },

  // paginas del panel de usuario (protegidas)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/panel",
        element: <BibliotecaProvider><PanelLayout /></BibliotecaProvider>,
        children: [
          { index: true, element: <InicioPage /> },
          { path: "catalogo-anime", element: <CatalogoAnimePage /> },
          { path: "catalogo-manga", element: <CatalogoMangaPage /> },
          { path: "listas-anime", element: <ListasAnimePage /> },
          { path: "listas-manga", element: <ListasMangaPage /> },
          { path: "grupos", element: <GruposPage /> },
          { path: "grupos/:id", element: <GrupoDetalladoPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
          { path: "anime/:id", element: <AnimeDetalladoPage /> },
          { path: "manga/:id", element: <MangaDetalladoPage /> },
          { path: "estado/:medio/:id", element: <EstadoPage /> },
          { path: "*", element: <NotFoundPage /> }
        ],
      },
    ],
  },

]);