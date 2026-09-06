import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Field, PasswordField, Checkbox, Divider, BtnPrimary } from "../ui/FormFields";
import { useAuth } from "../../store/auth";
import { getOAuthRedirectUrl } from "../../api/authService";

// ─── Formulario de registro (lógica) ─────────────────────────────────────────

function validar(
  usuario: string,
  email: string,
  contrasena: string,
  confirmar: string,
  terminos: boolean,
) {
  const errores: Record<string, string> = {};

  if (!usuario.trim())
    errores.usuario = "El nombre de usuario es obligatorio.";
  else if (usuario.length < 3)
    errores.usuario = "Debe tener al menos 3 caracteres.";
  else if (!/^[a-zA-Z0-9]+$/.test(usuario))
    errores.usuario = "Solo puede contener letras y números.";

  if (!email.trim())
    errores.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errores.email = "Ingresa un email válido.";

  if (!contrasena)
    errores.contrasena = "La contraseña es obligatoria.";
  else if (contrasena.length < 8)
    errores.contrasena = "Debe tener al menos 8 caracteres.";

  if (!confirmar)
    errores.confirmar = "Confirma tu contraseña.";
  else if (confirmar !== contrasena)
    errores.confirmar = "Las contraseñas no coinciden.";

  if (!terminos)
    errores.terminos = "Debes aceptar los términos para continuar.";

  return errores;
}

function calcularSeguridad(pass: string): { nivel: number; texto: string } {
  if (pass.length === 0) return { nivel: 0, texto: "" };
  if (pass.length < 8) return { nivel: 1, texto: "Contraseña débil" };
  const tieneMayuscula = /[A-Z]/.test(pass);
  const tieneNumero = /[0-9]/.test(pass);
  const tieneEspecial = /[^a-zA-Z0-9]/.test(pass);
  if (pass.length >= 12 && tieneMayuscula && tieneNumero && tieneEspecial)
    return { nivel: 4, texto: "Contraseña muy fuerte" };
  if (pass.length >= 10 && tieneMayuscula && tieneNumero)
    return { nivel: 3, texto: "Contraseña fuerte" };
  return { nivel: 2, texto: "Contraseña aceptable" };
}

const COLORES_SEGURIDAD: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-yellow-500",
  3: "bg-blue-400",
  4: "bg-emerald-400",
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const seguridad = calcularSeguridad(contrasena);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar(usuario, email, contrasena, confirmar, terminos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      await register(usuario, email, contrasena);
      setRegistrado(true);
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || "Error al crear la cuenta. Intenta de nuevo.";
      setErrores({ general: msg });
    } finally {
      setCargando(false);
    }
  }

  if (registrado) {
    return (
      <div className="flex flex-col items-center gap-9 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#f0eefa] mb-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            ¡Revisa tu correo!
          </h2>
          <p className="text-sm text-[#8b82a8] max-w-xs mx-auto">
            Enviamos un enlace de verificación a{" "}
            <span className="text-[#946ed9] font-medium">{email}</span>.
            Haz clic en el enlace para activar tu cuenta. Revisa también tu carpeta de spam.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/iniciar-sesion")}
            className="h-11 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
          >
            Ir a iniciar sesión
          </button>
          <Link
            to="/"
            className="text-sm text-[#8b82a8] hover:text-[#f0eefa] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="mb-1">
        <h2
          className="text-2xl font-extrabold text-[#f0eefa]"
          style={{ fontFamily: "'Oxanium', sans-serif" }}
        >
          Crear cuenta
        </h2>
        <p className="text-sm text-[#8b82a8] mt-1">Únete a la comunidad ANILEZ</p>
      </div>

      {/* Error general */}
      {errores.general && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
          {errores.general}
        </p>
      )}

      {/* Usuario y email en cuadrícula — se apila en móvil */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Nombre de usuario"
          id="reg-usuario"
          placeholder="tu_usuario"
          value={usuario}
          onChange={setUsuario}
          error={errores.usuario}
        />
        <Field
          label="Email"
          id="reg-email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={setEmail}
          error={errores.email}
        />
      </div>

      <PasswordField
        label="Contraseña"
        id="reg-pass"
        placeholder="Mínimo 8 caracteres"
        value={contrasena}
        onChange={setContrasena}
        error={errores.contrasena}
      />

      {/* Indicador de seguridad de la contraseña */}
      {contrasena.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={[
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= seguridad.nivel
                    ? COLORES_SEGURIDAD[seguridad.nivel]
                    : "bg-[#2a2140]",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#8b82a8]">{seguridad.texto}</span>
        </div>
      )}

      <PasswordField
        label="Confirmar contraseña"
        id="reg-confirmar"
        placeholder="Repite tu contraseña"
        value={confirmar}
        onChange={setConfirmar}
        error={errores.confirmar}
      />

      {/* Aceptación de términos */}
      <div className="flex flex-col pt-1.5">
        <Checkbox checked={terminos} onChange={setTerminos}>
          Acepto los{" "}
          <Link to="/terminos" className="text-[#946ed9] hover:underline">
            Términos de Servicio
          </Link>{" "}
          y la{" "}
          <Link to="/privacidad" className="text-[#946ed9] hover:underline">
            Política de Privacidad
          </Link>
        </Checkbox>
        {errores.terminos && (
          <p className="text-red-400 text-xs mt-1.5">{errores.terminos}</p>
        )}
      </div>

      {/* Botones: Volver y Crear cuenta */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-bold"
        >
          ← Volver
        </button>
        <BtnPrimary
          type="submit"
          loading={cargando}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#946ed9] bg-[#946ed9] hover:bg-[#b08ee8] hover:border-[#b08ee8] transition-all text-sm text-[#c4bbd8] font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {cargando ? "Creando cuenta…" : "Crear cuenta"}
        </BtnPrimary>
      </div>

      <Divider label="o continúa con" />
      
      {/* Botones de acceso social */}
      <div className="grid grid-cols-2 gap-3">
        {/* Botón de Google */}
        <button
          type="button"
          onClick={() => { window.location.href = getOAuthRedirectUrl('google'); }}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* Botón de Discord */}
        <button
          type="button"
          onClick={() => { window.location.href = getOAuthRedirectUrl('discord'); }}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#2a2140] bg-[#0d0b16] hover:border-[#946ed9]/40 hover:bg-[#130f22] transition-all text-sm text-[#c4bbd8] font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 127.14 96.36">
            <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.18,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,69.43,69.43,0,0,1-10.5-5A52,52,0,0,0,31.7,77.73a74.22,74.22,0,0,0,63.74,0,52,52,0,0,0,3.58,2.78,69.43,69.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.3,51.49,123.38,28.69,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.92,46,53.74,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.16,46,96,53,91,65.69,84.69,65.69Z"/>
          </svg>
          Discord
        </button>
      </div>

      {/* Enlace para ir a inicio de sesión */}
      <p className="text-center text-sm text-[#8b82a8]">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/iniciar-sesion"
          className="text-[#946ed9] font-semibold hover:text-[#b08ee8] transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}