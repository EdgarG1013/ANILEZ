import { useEffect, useRef, useState } from "react";
import { Upload, Download, User, KeyRound, FileJson, FileText, ShieldAlert, Camera, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useBiblioteca, type Entrada, type Grupo } from "../../store/biblioteca";
import { useAuth } from "../../store/auth";
import api from "../../api/axios";
import {
  actualizarPerfil as actualizarPerfilApi,
  solicitarCambioCorreo,
  cambiarContrasena,
  establecerContrasena,
  obtenerPerfil,
} from "../../api/authService";

// ─── Configuración de cuenta, importación y exportación ──────────────────────

type NestError = {
  response?: {
    data?: {
      mensaje?: string;
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };
  };
};

function extraerMensajeError(err: unknown, fallback: string): string {
  const e = err as NestError;
  const data = e?.response?.data;
  if (!data) return fallback;
  if (data.mensaje) return data.mensaje;
  if (data.message) {
    const msg = Array.isArray(data.message) ? data.message.join(". ") : data.message;
    return msg || fallback;
  }
  return fallback;
}

export default function ConfiguracionPage() {
  const { perfil, setPerfil, entradas, grupos, reemplazarTodo, preferencias, setPreferencias } = useBiblioteca();
  const { actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState(perfil.nombre);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // ─── Estado: cambio de correo ─────────────────────────────────────
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [correoPassword, setCorreoPassword] = useState("");
  const [solicitandoCambioCorreo, setSolicitandoCambioCorreo] = useState(false);
  const [errorCambioCorreo, setErrorCambioCorreo] = useState<string | null>(null);

  // ─── Estado: cambio de contraseña ─────────────────────────────────
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConf, setPassConf] = useState("");
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [errorCambiarPass, setErrorCambiarPass] = useState<string | null>(null);

  // ─── Estado: establecer contraseña (OAuth) ────────────────────────
  const [nuevaPassOAuth, setNuevaPassOAuth] = useState("");
  const [confPassOAuth, setConfPassOAuth] = useState("");
  const [estableciendoPass, setEstableciendoPass] = useState(false);
  const [errorEstablecerPass, setErrorEstablecerPass] = useState<string | null>(null);

  // ─── Estado: OAuth ────────────────────────────────────────────────
  const [esOAuth, setEsOAuth] = useState(false);

  useEffect(() => {
    obtenerPerfil()
      .then(res => {
        setEsOAuth(!res.data.hasPassword);
      })
      .catch(() => setEsOAuth(false));
  }, []);

  function mostrarMensaje(texto: string, tipo: "exito" | "error" = "exito") {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  }

  function descargar(contenido: string, nombreArchivo: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  const exportarJson = () =>
    descargar(JSON.stringify({ entradas, grupos }, null, 2), "ANILEZ-biblioteca.json", "application/json");

  const exportarTxt = () => {
    const lineas = [
      "ANILEZ — Biblioteca personal",
      "",
      ...entradas.map(e => `[${e.medio}] ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"} — agregado ${new Date(e.agregado).toLocaleDateString("es")}`),
      "",
      "Grupos:",
      ...grupos.map(g => `- ${g.titulo} (${g.etiquetas.join(", ")}): ${g.listas.map(l => `${l.nombre} [${l.items.length}]`).join(" | ")}`),
    ];
    descargar(lineas.join("\n"), "ANILEZ-biblioteca.txt", "text/plain");
  };

  async function importar(file: File) {
    const texto = await file.text();
    try {
      if (file.name.endsWith(".json")) {
        const datos = JSON.parse(texto) as { entradas?: Record<string, unknown>[]; grupos?: Grupo[] };
        const entradasMigradas: Entrada[] = (datos.entradas ?? []).map(e => ({
          listaId: (e.listaId as string) ?? null,
          id: (e.id as number) ?? 0,
          medio: (e.medio as Entrada["medio"]) ?? "anime",
          titulo: (e.titulo as string) ?? "",
          img: (e.img as string) ?? "",
          tipo: (e.tipo as string) ?? "",
          estado: (e.estado as Entrada["estado"]) ?? "por-ver",
          progreso: (e.progreso as number) ?? 0,
          total: (e.total as number) ?? null,
          favorito: (e.favorito as boolean) ?? false,
          puntuacion: (e.puntuacion as number) ?? 0,
          notas: (e.notas as string) ?? "",
          fechaInicio: (e.fechaInicio as string) ?? "",
          fechaFin: (e.fechaFin as string) ?? "",
          agregado: (e.agregado as string) ?? new Date().toISOString(),
          orden: (e.orden as number) ?? 0,
          etiquetas: (e.etiquetas as string[]) ?? [],
          urlRespaldo: (e.urlRespaldo as string) ?? null,
        }));
        reemplazarTodo({ entradas: entradasMigradas, grupos: datos.grupos });
        mostrarMensaje(`Se importaron ${entradasMigradas.length} títulos desde JSON.`);
      } else {
        const nuevas: Entrada[] = texto.split("\n").flatMap((linea, i) => {
          const m = linea.match(/^\[(anime|manga)\]\s*(.+?)\s*—\s*([\w-]+)/i);
          if (!m) return [];
          return [{
            listaId: null,
            id: Date.now() + i,
            medio: m[1].toLowerCase() as Entrada["medio"],
            titulo: m[2].trim(),
            img: "",
            tipo: m[1].toLowerCase() === "anime" ? "TV" : "Manga",
            estado: m[3] as Entrada["estado"],
            progreso: 0,
            total: null,
            favorito: false,
            puntuacion: 0,
            notas: "",
            fechaInicio: "",
            fechaFin: "",
            agregado: new Date().toISOString(),
            orden: i,
            etiquetas: [],
            urlRespaldo: null,
          }];
        });
        reemplazarTodo({ entradas: nuevas });
        mostrarMensaje(`Se importaron ${nuevas.length} títulos desde TXT.`);
      }
    } catch {
      mostrarMensaje("No pudimos leer el archivo. Verifica el formato.", "error");
    }
  }

  // ─── Handlers ─────────────────────────────────────────────────────

  async function guardarNombre() {
    if (!nombre.trim() || nombre === perfil.nombre) return;
    try {
      const res = await actualizarPerfilApi(nombre.trim());
      if (res.ok) {
        setPerfil({ nombre: res.data.nombre });
        actualizarUsuario({ nombre: res.data.nombre });
        mostrarMensaje("Nombre actualizado exitosamente.");
      }
    } catch (err: unknown) {
      mostrarMensaje(extraerMensajeError(err, "Error al actualizar el nombre."), "error");
    }
  }

  async function handlerSolicitarCambioCorreo() {
    setErrorCambioCorreo(null);
    if (!nuevoCorreo.trim() || !correoPassword.trim()) {
      setErrorCambioCorreo("Ingresa el nuevo correo y tu contraseña actual.");
      return;
    }
    if (nuevoCorreo === perfil.correo) {
      setErrorCambioCorreo("El nuevo correo es igual al actual.");
      return;
    }
    setSolicitandoCambioCorreo(true);
    try {
      const res = await solicitarCambioCorreo(nuevoCorreo.trim(), correoPassword);
      if (res.ok) {
        mostrarMensaje(res.mensaje);
        setNuevoCorreo("");
        setCorreoPassword("");
        setErrorCambioCorreo(null);
      }
    } catch (err: unknown) {
      setErrorCambioCorreo(extraerMensajeError(err, "Error al solicitar cambio de correo."));
    }
    setSolicitandoCambioCorreo(false);
  }

  async function handlerCambiarContrasena(e: React.FormEvent) {
    e.preventDefault();
    setErrorCambiarPass(null);
    if (!passActual || !passNueva || !passConf) {
      setErrorCambiarPass("Completa todos los campos.");
      return;
    }
    if (passNueva !== passConf) {
      setErrorCambiarPass("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passNueva.length < 8) {
      setErrorCambiarPass("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setCambiandoPass(true);
    try {
      const res = await cambiarContrasena(passActual, passNueva);
      if (res.ok) {
        mostrarMensaje("Contraseña actualizada exitosamente.");
        setPassActual("");
        setPassNueva("");
        setPassConf("");
        setErrorCambiarPass(null);
      }
    } catch (err: unknown) {
      setErrorCambiarPass(extraerMensajeError(err, "Error al cambiar la contraseña."));
    }
    setCambiandoPass(false);
  }

  async function handlerEstablecerContrasena(e: React.FormEvent) {
    e.preventDefault();
    setErrorEstablecerPass(null);
    if (!nuevaPassOAuth || !confPassOAuth) {
      setErrorEstablecerPass("Completa todos los campos.");
      return;
    }
    if (nuevaPassOAuth !== confPassOAuth) {
      setErrorEstablecerPass("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaPassOAuth.length < 8) {
      setErrorEstablecerPass("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setEstableciendoPass(true);
    try {
      const res = await establecerContrasena(nuevaPassOAuth);
      if (res.ok) {
        mostrarMensaje("Contraseña creada exitosamente. Ahora puedes iniciar sesión con tu correo y contraseña.");
        setNuevaPassOAuth("");
        setConfPassOAuth("");
        setErrorEstablecerPass(null);
      }
    } catch (err: unknown) {
      setErrorEstablecerPass(extraerMensajeError(err, "Error al establecer la contraseña."));
    }
    setEstableciendoPass(false);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Configuración
      </h1>

      {/* Perfil */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <User className="w-4 h-4 text-[#946ed9]" /> Perfil
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="w-16 h-16 rounded-full overflow-hidden bg-[#1c1928] border border-[#2a2140] flex items-center justify-center shrink-0">
            {perfil.avatar
              ? <img src={perfil.avatar} alt="Foto de perfil actual" className="w-full h-full object-cover" />
              : <User className="w-6 h-6 text-[#8b82a8]" />}
          </span>
          <div>
            <label className="block text-xs text-[#8b82a8] mb-1">Foto de perfil</label>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setSubiendoAvatar(true);
                try {
                  const formData = new FormData();
                  formData.append("archivo", f);
                  const res = await api.patch<{ ok: boolean; avatar: string }>("/auth/avatar", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setPerfil({ avatar: res.data.avatar });
                  actualizarUsuario({ avatar: res.data.avatar });
                  mostrarMensaje("Foto de perfil actualizada.");
                } catch {
                  mostrarMensaje("Error al subir la foto de perfil.", "error");
                }
                setSubiendoAvatar(false);
                if (avatarRef.current) avatarRef.current.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={subiendoAvatar}
              className="h-9 px-3 rounded-xl text-xs font-semibold border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              {subiendoAvatar ? "Subiendo…" : "Cambiar foto"}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="nombre" className="block text-xs text-[#8b82a8] mb-1">Nombre de usuario</label>
            <input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <div>
            <label htmlFor="correo" className="block text-xs text-[#8b82a8] mb-1">Correo electrónico</label>
            <div className="flex gap-2">
              <input id="correo" type="email" value={perfil.correo} readOnly
                className="flex-1 h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm text-[#8b82a8] cursor-not-allowed" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={guardarNombre}
            disabled={nombre === perfil.nombre || !nombre.trim()}
            className="h-10 px-4 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
          >
            Guardar nombre
          </button>
        </div>
      </section>

      {/* Cambio de correo */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <Mail className="w-4 h-4 text-[#946ed9]" /> Cambiar correo electrónico
        </h2>
        <p className="text-sm text-[#8b82a8] mb-4">
          Se enviará un correo de verificación a la nueva dirección. Tu correo actual seguirá activo hasta que confirmes.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="nuevo-correo" className="block text-xs text-[#8b82a8] mb-1">Nuevo correo</label>
            <input id="nuevo-correo" type="email" value={nuevoCorreo} onChange={e => { setNuevoCorreo(e.target.value); setErrorCambioCorreo(null); }}
              placeholder="nuevo@correo.com"
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
          <div>
            <label htmlFor="correo-pass" className="block text-xs text-[#8b82a8] mb-1">Contraseña actual (para confirmar)</label>
            <input id="correo-pass" type="password" value={correoPassword} onChange={e => { setCorreoPassword(e.target.value); setErrorCambioCorreo(null); }}
              placeholder="Tu contraseña actual"
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
          </div>
        </div>
        <button
          onClick={handlerSolicitarCambioCorreo}
          disabled={solicitandoCambioCorreo || !nuevoCorreo.trim() || !correoPassword.trim()}
          className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 disabled:opacity-40 flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          {solicitandoCambioCorreo ? "Enviando…" : "Enviar correo de verificación"}
        </button>
        {errorCambioCorreo && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errorCambioCorreo}
          </p>
        )}
      </section>

      {/* Contenido */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <ShieldAlert className="w-4 h-4 text-[#946ed9]" /> Filtro de contenido
        </h2>
        <p className="text-sm text-[#8b82a8] mb-4">
          Controla qué títulos aparecen en los buscadores de anime y manga del catálogo.
        </p>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!preferencias.sfw}
            onChange={async e => {
              const nuevoSfw = !e.target.checked;
              setPreferencias({ sfw: nuevoSfw });
              try {
                await api.patch("/auth/preferencias", { sfw: nuevoSfw });
              } catch {
                mostrarMensaje("Error al guardar preferencias.", "error");
              }
            }}
            className="mt-1 w-4 h-4 accent-[#946ed9]"
          />
          <span>
            <span className="block text-sm font-medium text-[#f0eefa]">Mostrar títulos para adultos</span>
            <span className="block text-xs text-[#8b82a8] mt-0.5">
              Al activarlo se elimina el filtro SFW de los buscadores y se muestran todos los títulos.
            </span>
          </span>
        </label>
      </section>

      {/* Contraseña — Cambiar (usuarios con password) o Establecer (OAuth) */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <KeyRound className="w-4 h-4 text-[#946ed9]" />
          {esOAuth ? "Establecer contraseña" : "Cambiar contraseña"}
        </h2>

        {esOAuth ? (
          <>
            <p className="text-sm text-[#8b82a8] mb-4">
              Tu cuenta fue creada con un proveedor externo (Google/Discord). Establece una contraseña para poder iniciar sesión también con tu correo y contraseña.
            </p>
            <form onSubmit={handlerEstablecerContrasena} className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pass-nueva-oauth" className="block text-xs text-[#8b82a8] mb-1">Nueva contraseña</label>
                <input id="pass-nueva-oauth" type="password" required minLength={8} value={nuevaPassOAuth} onChange={e => { setNuevaPassOAuth(e.target.value); setErrorEstablecerPass(null); }}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <div>
                <label htmlFor="pass-conf-oauth" className="block text-xs text-[#8b82a8] mb-1">Confirmar contraseña</label>
                <input id="pass-conf-oauth" type="password" required minLength={8} value={confPassOAuth} onChange={e => { setConfPassOAuth(e.target.value); setErrorEstablecerPass(null); }}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <button type="submit" disabled={estableciendoPass}
                className="h-10 px-4 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}>
                {estableciendoPass ? "Guardando…" : "Establecer contraseña"}
              </button>
            </form>
            {errorEstablecerPass && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorEstablecerPass}
              </p>
            )}
          </>
        ) : (
          <>
            <form onSubmit={handlerCambiarContrasena} className="grid sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="pass-actual" className="block text-xs text-[#8b82a8] mb-1">Actual</label>
                <input id="pass-actual" type="password" required minLength={8} value={passActual} onChange={e => { setPassActual(e.target.value); setErrorCambiarPass(null); }}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <div>
                <label htmlFor="pass-nueva" className="block text-xs text-[#8b82a8] mb-1">Nueva</label>
                <input id="pass-nueva" type="password" required minLength={8} value={passNueva} onChange={e => { setPassNueva(e.target.value); setErrorCambiarPass(null); }}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <div>
                <label htmlFor="pass-conf" className="block text-xs text-[#8b82a8] mb-1">Confirmar</label>
                <input id="pass-conf" type="password" required minLength={8} value={passConf} onChange={e => { setPassConf(e.target.value); setErrorCambiarPass(null); }}
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <button type="submit" disabled={cambiandoPass}
                className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 disabled:opacity-40">
                {cambiandoPass ? "Actualizando…" : "Actualizar contraseña"}
              </button>
            </form>
            {errorCambiarPass && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorCambiarPass}
              </p>
            )}
          </>
        )}
      </section>

      {/* Importar / exportar */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <FileJson className="w-4 h-4 text-[#946ed9]" /> Importar y exportar listas
        </h2>
        <p className="text-sm text-[#8b82a8] mb-4">
          Descarga una copia de tu biblioteca y tus grupos, o restaura desde un archivo JSON o TXT.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportarJson} className="h-10 px-4 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}>
            <Download className="w-4 h-4" /> Exportar JSON
          </button>
          <button onClick={exportarTxt} className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Exportar TXT
          </button>
          <button onClick={() => archivoRef.current?.click()} className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importar archivo
          </button>
          <input
            ref={archivoRef}
            type="file"
            accept=".json,.txt"
            className="sr-only"
            aria-label="Importar biblioteca desde archivo"
            onChange={e => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }}
          />
        </div>
      </section>

      {/* Mensaje global */}
      {mensaje && (
        <p aria-live="polite" className={`mt-4 text-sm flex items-center gap-2 min-h-5 ${mensaje.tipo === "error" ? "text-red-400" : "text-[#b08ee8]"}`}>
          {mensaje.tipo === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
