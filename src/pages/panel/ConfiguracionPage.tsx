import { useEffect, useRef, useState, useMemo } from "react";
import { Upload, Download, User, KeyRound, FileJson, FileText, ShieldAlert, Camera, Mail, CheckCircle, AlertCircle, Lock, Trash2, X } from "lucide-react";
import { useBiblioteca } from "../../store/biblioteca";
import { useAuth } from "../../store/auth";
import api from "../../api/axios";
import {
  actualizarPerfil as actualizarPerfilApi,
  solicitarCambioCorreo,
  cambiarContrasena,
  establecerContrasena,
  obtenerPerfil,
  eliminarCuenta,
} from "../../api/authService";
import { PasswordField } from "../../components/ui/FormFields";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteAccountModal";
import { exportarJSON, exportarTXT, parsearArchivo, ImportManager, type ImportResultado } from "../../store/importExport";

// ─── Utilidades ──────────────────────────────────────────────────────────────

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

function evaluarFortaleza(pw: string): { largo: boolean; mayuscula: boolean; minuscula: boolean; digito: boolean } {
  return {
    largo: pw.length >= 8,
    mayuscula: /[A-Z]/.test(pw),
    minuscula: /[a-z]/.test(pw),
    digito: /\d/.test(pw),
  };
}

// ─── Componente auxiliar: requisito de contraseña ────────────────────────────

function Requisito({ texto, ok }: { texto: string; ok: boolean }) {
  return (
    <span className={`text-[11px] flex items-center gap-1 mt-6 transition-colors ${ok ? "text-emerald-400" : "text-[#5a5272]"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-[#5a5272]"}`} />
      {texto}
    </span>
  );
}

// ─── Componente auxiliar: mensaje de sección ─────────────────────────────────

function MensajeSeccion({ msg }: { msg: { texto: string; tipo: "exito" | "error" } | null }) {
  if (!msg) return null;
  return (
    <p className="text-xs flex items-center gap-1.5 mt-8" role="status" aria-live="polite"
      style={{ color: msg.tipo === "error" ? "#f87171" : "#b08ee8" }}>
      {msg.tipo === "error" ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
      {msg.texto}
    </p>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const { perfil, setPerfil, entradas, grupos, reemplazarTodo, preferencias, setPreferencias } = useBiblioteca();
  const { actualizarUsuario, logout } = useAuth();
  const [nombre, setNombre] = useState(perfil.nombre);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // ─── Estado de importación ──────────────────────────────────────
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState({ procesados: 0, total: 0 });
  const [mensajesImport, setMensajesImport] = useState<{ texto: string; tipo: "info" | "exito" | "error" }[]>([]);
  const [resultadoImport, setResultadoImport] = useState<ImportResultado | null>(null);
  const importManagerRef = useRef<ImportManager | null>(null);

  // ─── Mensajes por sección ─────────────────────────────────────────
  const [msgPerfil, setMsgPerfil] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const [msgAvatar, setMsgAvatar] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const [msgCambioCorreo, setMsgCambioCorreo] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const [msgPreferencias, setMsgPreferencias] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);
  const [msgImportar, setMsgImportar] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  function mostrar(seccion: "perfil" | "avatar" | "cambioCorreo" | "preferencias" | "importar", texto: string, tipo: "exito" | "error" = "exito") {
    const set = { perfil: setMsgPerfil, avatar: setMsgAvatar, cambioCorreo: setMsgCambioCorreo, preferencias: setMsgPreferencias, importar: setMsgImportar }[seccion];
    set({ texto, tipo });
    setTimeout(() => set(null), 5000);
  }

  // ─── Estado: cambio de correo ─────────────────────────────────────
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [correoPassword, setCorreoPassword] = useState("");
  const [solicitandoCambioCorreo, setSolicitandoCambioCorreo] = useState(false);

  // ─── Estado: cambio de contraseña ─────────────────────────────────
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConf, setPassConf] = useState("");
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [msgCambiarPass, setMsgCambiarPass] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  // ─── Estado: establecer contraseña (OAuth) ────────────────────────
  const [nuevaPassOAuth, setNuevaPassOAuth] = useState("");
  const [confPassOAuth, setConfPassOAuth] = useState("");
  const [estableciendoPass, setEstableciendoPass] = useState(false);
  const [msgEstablecerPass, setMsgEstablecerPass] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  // ─── Estado: OAuth ────────────────────────────────────────────────
  const [esOAuth, setEsOAuth] = useState(false);
  const [cargandoOAuth, setCargandoOAuth] = useState(true);

  useEffect(() => {
    obtenerPerfil()
      .then(res => {
        setEsOAuth(!res.data.hasPassword);
      })
      .catch(() => setEsOAuth(false))
      .finally(() => setCargandoOAuth(false));
  }, []);

  // ─── Estado: eliminar cuenta ──────────────────────────────────────
  const [modalEliminar, setModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [msgEliminar, setMsgEliminar] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  async function handleEliminarCuenta() {
    setEliminando(true);
    setMsgEliminar(null);
    try {
      const res = await eliminarCuenta(perfil.nombre);
      if (res.ok) {
        setModalEliminar(false);
        await logout();
      }
    } catch (err: unknown) {
      setMsgEliminar({ texto: extraerMensajeError(err, "Error al eliminar la cuenta."), tipo: "error" });
      setEliminando(false);
    }
  }

  // ─── Validación en tiempo real: contraseña OAuth ──────────────────
  const fortalezaOAuth = useMemo(() => evaluarFortaleza(nuevaPassOAuth), [nuevaPassOAuth]);
  const coincideOAuth = nuevaPassOAuth.length > 0 && nuevaPassOAuth === confPassOAuth;
  const todoOkOAuth = fortalezaOAuth.largo && fortalezaOAuth.mayuscula && fortalezaOAuth.minuscula && fortalezaOAuth.digito && coincideOAuth;

  // ─── Validación en tiempo real: cambiar contraseña ────────────────
  const fortalezaCambiar = useMemo(() => evaluarFortaleza(passNueva), [passNueva]);
  const coincideCambiar = passNueva.length > 0 && passNueva === passConf;
  const todoOkCambiar = fortalezaCambiar.largo && fortalezaCambiar.mayuscula && fortalezaCambiar.minuscula && fortalezaCambiar.digito && coincideCambiar;

  // ─── Helpers ──────────────────────────────────────────────────────

  const exportarJson = () => exportarJSON(entradas, grupos);
  const exportarTxt = () => exportarTXT(entradas, grupos);

  // ─── Protección beforeunload durante importación ─────────────────
  useEffect(() => {
    if (!importando) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [importando]);

  // ─── Importación con ImportManager ───────────────────────────────
  async function importar(file: File) {
    let datos;
    try {
      datos = await parsearArchivo(file);
    } catch {
      mostrar("importar", "No pudimos leer el archivo. Verifica el formato.", "error");
      return;
    }

    const manager = new ImportManager();
    importManagerRef.current = manager;
    setImportando(true);
    setMensajesImport([]);
    setResultadoImport(null);
    setProgreso({ procesados: 0, total: 0 });

    manager.onProgress = (p, t) => setProgreso({ procesados: p, total: t });
    manager.onMensaje = (msg, tipo) => setMensajesImport(prev => [...prev, { texto: msg, tipo }]);
    manager.onCompletado = (resultado) => {
      setResultadoImport(resultado);
      setImportando(false);
      importManagerRef.current = null;
    };

    await manager.iniciar(datos, reemplazarTodo);
  }

  function cancelarImport() {
    importManagerRef.current?.cancelar();
  }

  // ─── Handlers ─────────────────────────────────────────────────────

  async function guardarNombre() {
    if (!nombre.trim() || nombre === perfil.nombre) return;
    try {
      const res = await actualizarPerfilApi(nombre.trim());
      if (res.ok) {
        setPerfil({ nombre: res.data.nombre });
        actualizarUsuario({ nombre: res.data.nombre });
        mostrar("perfil", "Nombre actualizado exitosamente.");
      }
    } catch (err: unknown) {
      mostrar("perfil", extraerMensajeError(err, "Error al actualizar el nombre."), "error");
    }
  }

  async function handlerSolicitarCambioCorreo() {
    setMsgCambioCorreo(null);
    if (!nuevoCorreo.trim() || !correoPassword.trim()) {
      setMsgCambioCorreo({ texto: "Ingresa el nuevo correo y tu contraseña actual.", tipo: "error" });
      return;
    }
    if (nuevoCorreo === perfil.correo) {
      setMsgCambioCorreo({ texto: "El nuevo correo es igual al actual.", tipo: "error" });
      return;
    }
    setSolicitandoCambioCorreo(true);
    try {
      const res = await solicitarCambioCorreo(nuevoCorreo.trim(), correoPassword);
      if (res.ok) {
        setMsgCambioCorreo({ texto: res.mensaje, tipo: "exito" });
        setNuevoCorreo("");
        setCorreoPassword("");
      }
    } catch (err: unknown) {
      setMsgCambioCorreo({ texto: extraerMensajeError(err, "Error al solicitar cambio de correo."), tipo: "error" });
    }
    setSolicitandoCambioCorreo(false);
  }

  async function handlerCambiarContrasena(e: React.FormEvent) {
    e.preventDefault();
    setMsgCambiarPass(null);
    if (!passActual || !passNueva || !passConf) {
      setMsgCambiarPass({ texto: "Completa todos los campos.", tipo: "error" });
      return;
    }
    if (!todoOkCambiar) {
      const errores: string[] = [];
      if (!fortalezaCambiar.largo) errores.push("al menos 8 caracteres");
      if (!fortalezaCambiar.mayuscula) errores.push("una letra mayúscula");
      if (!fortalezaCambiar.minuscula) errores.push("una letra minúscula");
      if (!fortalezaCambiar.digito) errores.push("un número");
      if (!coincideCambiar) errores.push("las contraseñas deben coincidir");
      setMsgCambiarPass({ texto: `La contraseña debe tener: ${errores.join(", ")}.`, tipo: "error" });
      return;
    }
    setCambiandoPass(true);
    try {
      const res = await cambiarContrasena(passActual, passNueva);
      if (res.ok) {
        setMsgCambiarPass({ texto: "Contraseña actualizada exitosamente.", tipo: "exito" });
        setPassActual("");
        setPassNueva("");
        setPassConf("");
      }
    } catch (err: unknown) {
      setMsgCambiarPass({ texto: extraerMensajeError(err, "Error al cambiar la contraseña."), tipo: "error" });
    }
    setCambiandoPass(false);
  }

  async function handlerEstablecerContrasena(e: React.FormEvent) {
    e.preventDefault();
    setMsgEstablecerPass(null);
    if (!nuevaPassOAuth || !confPassOAuth) {
      setMsgEstablecerPass({ texto: "Completa todos los campos.", tipo: "error" });
      return;
    }
    if (!todoOkOAuth) {
      const errores: string[] = [];
      if (!fortalezaOAuth.largo) errores.push("al menos 8 caracteres");
      if (!fortalezaOAuth.mayuscula) errores.push("una letra mayúscula");
      if (!fortalezaOAuth.minuscula) errores.push("una letra minúscula");
      if (!fortalezaOAuth.digito) errores.push("un número");
      if (!coincideOAuth) errores.push("las contraseñas deben coincidir");
      setMsgEstablecerPass({ texto: `La contraseña debe tener: ${errores.join(", ")}.`, tipo: "error" });
      return;
    }
    setEstableciendoPass(true);
    try {
      const res = await establecerContrasena(nuevaPassOAuth);
      if (res.ok) {
        setMsgEstablecerPass({ texto: "Contraseña creada exitosamente. Ahora puedes iniciar sesión con tu correo y contraseña.", tipo: "exito" });
        setNuevaPassOAuth("");
        setConfPassOAuth("");
        setEsOAuth(false);
      }
    } catch (err: unknown) {
      setMsgEstablecerPass({ texto: extraerMensajeError(err, "Error al establecer la contraseña."), tipo: "error" });
    }
    setEstableciendoPass(false);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Configuración
      </h1>

      {/* ─── Perfil ──────────────────────────────────────────────── */}
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
                setMsgAvatar(null);
                try {
                  const formData = new FormData();
                  formData.append("archivo", f);
                  const res = await api.patch<{ ok: boolean; avatar: string }>("/auth/avatar", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setPerfil({ avatar: res.data.avatar });
                  actualizarUsuario({ avatar: res.data.avatar });
                  mostrar("avatar", "Foto de perfil actualizada.");
                } catch {
                  mostrar("avatar", "Error al subir la foto de perfil.", "error");
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
            <MensajeSeccion msg={msgAvatar} />
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
            <input id="correo" type="email" value={perfil.correo} readOnly
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm text-[#8b82a8] cursor-not-allowed" />
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
        <MensajeSeccion msg={msgPerfil} />
      </section>

      {/* ─── Cambio de correo ────────────────────────────────────── */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <Mail className="w-4 h-4 text-[#946ed9]" /> Cambiar correo electrónico
        </h2>
        <p className="text-sm text-[#8b82a8] mb-6">
          Se enviará un correo de verificación a la nueva dirección. Tu correo actual seguirá activo hasta que confirmes.
        </p>

        {esOAuth && !cargandoOAuth ? (
          <div className="flex items-start gap-3 bg-[#16141e] border border-[#2a2140] rounded-xl p-4">
            <Lock className="w-5 h-5 text-[#8b82a8] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#f0eefa] font-medium">Necesitas crear una contraseña primero</p>
              <p className="text-xs text-[#8b82a8] mt-1">
                Tu cuenta fue creada con un proveedor externo (Google/Discord). Para cambiar tu correo electrónico, primero establece una contraseña en la sección de abajo.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="nuevo-correo" className="block text-xs text-[#8b82a8] mb-1">Nuevo correo</label>
                <input id="nuevo-correo" type="email" value={nuevoCorreo}
                  onChange={e => { setNuevoCorreo(e.target.value); setMsgCambioCorreo(null); }}
                  placeholder="nuevo@correo.com"
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
              <div>
                <label htmlFor="correo-pass" className="block text-xs text-[#8b82a8] mb-1">Contraseña actual (para confirmar)</label>
                <input id="correo-pass" type="password" value={correoPassword}
                  onChange={e => { setCorreoPassword(e.target.value); setMsgCambioCorreo(null); }}
                  placeholder="Tu contraseña actual"
                  className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]" />
              </div>
            </div>
            <button
              onClick={handlerSolicitarCambioCorreo}
              disabled={solicitandoCambioCorreo || !nuevoCorreo.trim() || !correoPassword.trim()}
              className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 disabled:opacity-40 flex items-center gap-2 mt-4"
            >
              <Mail className="w-4 h-4" />
              {solicitandoCambioCorreo ? "Enviando…" : "Enviar correo de verificación"}
            </button>
          </>
        )}
        <MensajeSeccion msg={msgCambioCorreo} />
      </section>

      {/* ─── Filtro de contenido ─────────────────────────────────── */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <ShieldAlert className="w-4 h-4 text-[#946ed9]" /> Filtro de contenido
        </h2>
        <p className="text-sm text-[#8b82a8] mb-6">
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
                mostrar("preferencias", "Preferencias actualizadas.");
              } catch {
                mostrar("preferencias", "Error al guardar las preferencias.", "error");
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
        <MensajeSeccion msg={msgPreferencias} />
      </section>

      {/* ─── Contraseña ──────────────────────────────────────────── */}
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
              <PasswordField
                label="Nueva contraseña"
                id="pass-nueva-oauth"
                placeholder="Mínimo 8 caracteres"
                value={nuevaPassOAuth}
                onChange={v => { setNuevaPassOAuth(v); setMsgEstablecerPass(null); }}
              />
              <PasswordField
                label="Confirmar contraseña"
                id="pass-conf-oauth"
                placeholder="Repite la contraseña"
                value={confPassOAuth}
                onChange={v => { setConfPassOAuth(v); setMsgEstablecerPass(null); }}
              />
              <div className="sm:col-span-2">
                <button type="submit" disabled={estableciendoPass || !todoOkOAuth}
                  className="h-10 px-4 rounded-xl text-sm font-semibold text-white disabled:opacity-40 mt-2"
                  style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}>
                  {estableciendoPass ? "Guardando…" : "Establecer contraseña"}
                </button>
              </div>
            </form>
            {/* Requisitos en tiempo real */}
            {nuevaPassOAuth.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <Requisito texto="8+ caracteres" ok={fortalezaOAuth.largo} />
                <Requisito texto="Mayúscula" ok={fortalezaOAuth.mayuscula} />
                <Requisito texto="Minúscula" ok={fortalezaOAuth.minuscula} />
                <Requisito texto="Número" ok={fortalezaOAuth.digito} />
                <Requisito texto="Coincide" ok={coincideOAuth} />
              </div>
            )}
            <MensajeSeccion msg={msgEstablecerPass} />
          </>
        ) : (
          <>
            <form onSubmit={handlerCambiarContrasena} className="grid sm:grid-cols-3 gap-3">
              <PasswordField
                label="Contraseña actual"
                id="pass-actual"
                placeholder="Tu contraseña actual"
                value={passActual}
                onChange={v => { setPassActual(v); setMsgCambiarPass(null); }}
              />
              <PasswordField
                label="Nueva contraseña"
                id="pass-nueva"
                placeholder="Mínimo 8 caracteres"
                value={passNueva}
                onChange={v => { setPassNueva(v); setMsgCambiarPass(null); }}
              />
              <PasswordField
                label="Confirmar nueva"
                id="pass-conf"
                placeholder="Repite la contraseña"
                value={passConf}
                onChange={v => { setPassConf(v); setMsgCambiarPass(null); }}
              />
              <div className="sm:col-span-3">
                <button type="submit" disabled={cambiandoPass}
                  className="h-10 px-4 rounded-xl text-sm font-semibold border border-[#2a2140] hover:border-[#946ed9]/60 disabled:opacity-40 mt-2">
                  {cambiandoPass ? "Actualizando…" : "Actualizar contraseña"}
                </button>
              </div>
            </form>
            {/* Requisitos en tiempo real */}
            {passNueva.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <Requisito texto="8+ caracteres" ok={fortalezaCambiar.largo} />
                <Requisito texto="Mayúscula" ok={fortalezaCambiar.mayuscula} />
                <Requisito texto="Minúscula" ok={fortalezaCambiar.minuscula} />
                <Requisito texto="Número" ok={fortalezaCambiar.digito} />
                <Requisito texto="Coincide" ok={coincideCambiar} />
              </div>
            )}
            <MensajeSeccion msg={msgCambiarPass} />
          </>
        )}
      </section>

      {/* ─── Importar / exportar ─────────────────────────────────── */}
      <section className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <FileJson className="w-4 h-4 text-[#946ed9]" /> Importar y exportar listas
        </h2>
        <p className="text-sm text-[#8b82a8] mb-6">
          Descarga una copia de tu biblioteca y tus grupos, o restaura desde un archivo JSON o TXT.
        </p>
        {importando ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[#8b82a8] mb-1.5">
                <span>Importando tu biblioteca...</span>
                <span>{progreso.total > 0 ? `${Math.round((progreso.procesados / progreso.total) * 100)}%` : "0%"}</span>
              </div>
              <div className="h-2 bg-[#16141e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{
                  width: `${progreso.total > 0 ? (progreso.procesados / progreso.total) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #946ed9, #7c4dca)",
                }} />
              </div>
              <p className="text-xs text-[#8b82a8] mt-1">
                {progreso.procesados} / {progreso.total} items procesados
              </p>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-[#2a2140] rounded-xl p-3 bg-[#0d0b14]">
              {mensajesImport.map((m, i) => (
                <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: m.tipo === "error" ? "#f87171" : m.tipo === "exito" ? "#34d399" : "#8b82a8" }}>
                  {m.tipo === "error" ? <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> : m.tipo === "exito" ? <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> : null}
                  {m.texto}
                </p>
              ))}
            </div>
            <button onClick={cancelarImport} className="h-9 px-4 rounded-xl text-xs font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        ) : resultadoImport ? (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-sm font-semibold ${resultadoImport.errores.length === 0 ? "text-emerald-400" : "text-yellow-400"}`}>
              {resultadoImport.errores.length === 0 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              Importación {resultadoImport.errores.length === 0 ? "completada" : "completada con errores"}
            </div>
            <div className="text-xs text-[#8b82a8] space-y-1">
              <p>{resultadoImport.entradasImportadas} títulos importados{resultadoImport.entradasConErrores > 0 ? `, ${resultadoImport.entradasConErrores} con errores` : ""}.</p>
              <p>{resultadoImport.gruposImportados} grupos importados.</p>
              {resultadoImport.errores.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 border border-[#2a2140] rounded-xl p-3 bg-[#0d0b14]">
                  {resultadoImport.errores.map((e, i) => (
                    <p key={i} className="text-red-400 text-xs">{e.item}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setResultadoImport(null); setMensajesImport([]); }} className="h-9 px-4 rounded-xl text-xs font-semibold border border-[#2a2140] hover:border-[#946ed9]/60">
              Cerrar
            </button>
          </div>
        ) : (
          <>
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
            <MensajeSeccion msg={msgImportar} />
          </>
        )}
      </section>

      {/* ─── Danger Zone ────────────────────────────────────────── */}
      <section className="bg-[#1a0f0f] border border-red-500/25 rounded-2xl p-5 mt-5">
        <h2 className="text-base font-semibold mb-1 flex items-center gap-2 text-red-400" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <Trash2 className="w-4 h-4" /> Zona de peligro
        </h2>
        <p className="text-sm text-[#8b82a8] mb-4">
          Eliminar tu cuenta es una acción irreversible. Se borrarán todas tus listas, grupos, foto de perfil y datos asociados.
        </p>
        <button
          onClick={() => { setModalEliminar(true); setMsgEliminar(null); }}
          className="h-10 px-4 rounded-xl text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-colors"
        >
          Eliminar mi cuenta
        </button>
        <MensajeSeccion msg={msgEliminar} />
      </section>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        open={modalEliminar}
        titulo="Eliminar cuenta permanentemente"
        mensaje={`Escribe "${perfil.nombre}" para eliminar tu cuenta y todos tus datos de forma permanente.`}
        textoConfirmacion={perfil.nombre}
        textoBoton="Eliminar cuenta"
        onClose={() => { setModalEliminar(false); setMsgEliminar(null); }}
        onConfirm={handleEliminarCuenta}
        loading={eliminando}
      />
    </div>
  );
}
