import api from './axios';

export interface UsuarioAuth {
  id: string;
  nombre: string;
  correo: string;
  avatar: string | null;
  preferencias: {
    id: string;
    sfw: boolean;
  } | null;
}

export interface AuthResponse {
  ok: boolean;
  mensaje: string;
  data: {
    usuario: UsuarioAuth;
    token: string;
  };
}

export interface MensajeResponse {
  ok: boolean;
  mensaje: string;
}

export interface PerfilResponse {
  ok: boolean;
  data: {
    id: string;
    nombre: string;
    correo: string;
    avatar: string | null;
    email_verificado_en: string | null;
    creado_en: string;
    hasPassword: boolean;
    preferencias: {
      id: string;
      sfw: boolean;
    };
  };
}

// ============================================================
// AUTENTICACIÓN
// ============================================================

export const registrar = async (
  nombre: string,
  correo: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/registrar', {
    nombre,
    correo,
    password,
  });
  localStorage.setItem('token', response.data.data.token);
  localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
  return response.data;
};

export const iniciarSesion = async (
  correo: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/iniciar-sesion', {
    correo,
    password,
  });
  localStorage.setItem('token', response.data.data.token);
  localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
  return response.data;
};

export const verificarEmail = async (token: string): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/verificar-email', {
    token,
  });
  return response.data;
};

export const cerrarSesion = async (): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/cerrar-sesion');
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  return response.data;
};

// ============================================================
// PERFIL
// ============================================================

export const obtenerPerfil = async (): Promise<PerfilResponse> => {
  const response = await api.get<PerfilResponse>('/auth/perfil');
  return response.data;
};

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================

export interface ActualizarPerfilResponse {
  ok: boolean;
  mensaje: string;
  data: {
    id: string;
    nombre: string;
    correo: string;
    avatar: string | null;
  };
}

export const actualizarPerfil = async (nombre: string): Promise<ActualizarPerfilResponse> => {
  const response = await api.patch<ActualizarPerfilResponse>('/auth/perfil', { nombre });
  return response.data;
};

// ============================================================
// CAMBIO DE CORREO
// ============================================================

export const solicitarCambioCorreo = async (nuevoCorreo: string, password: string): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/solicitar-cambio-correo', {
    nuevoCorreo,
    password,
  });
  return response.data;
};

export interface ConfirmarCambioCorreoResponse {
  ok: boolean;
  mensaje: string;
  data: {
    usuario: {
      id: string;
      nombre: string;
      correo: string;
      avatar: string | null;
    };
    token: string;
  };
}

export const confirmarCambioCorreo = async (token: string): Promise<ConfirmarCambioCorreoResponse> => {
  const response = await api.post<ConfirmarCambioCorreoResponse>('/auth/confirmar-cambio-correo', {
    token,
  });
  // Actualizar token y usuario en localStorage
  if (response.data.data) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
  }
  return response.data;
};

// ============================================================
// CAMBIO DE CONTRASEÑA
// ============================================================

export const cambiarContrasena = async (contrasenaActual: string, nuevaContrasena: string): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/cambiar-contrasena', {
    contrasenaActual,
    nuevaContrasena,
  });
  return response.data;
};

export const establecerContrasena = async (password: string): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/establecer-contrasena', {
    password,
  });
  return response.data;
};

// ============================================================
// RECUPERACIÓN DE CONTRASEÑA
// ============================================================

export const olvidarContrasena = async (correo: string): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/olvidar-contrasena', {
    correo,
  });
  return response.data;
};

export const restablecerContrasena = async (
  correo: string,
  token: string,
  password: string,
): Promise<MensajeResponse> => {
  const response = await api.post<MensajeResponse>('/auth/restablecer-contrasena', {
    correo,
    token,
    password,
  });
  return response.data;
};

// ============================================================
// OAUTH
// ============================================================

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getOAuthRedirectUrl = (provider: 'google' | 'discord'): string => {
  return `${backendUrl}/auth/${provider}`;
};

// ============================================================
// UTILIDADES LOCALES
// ============================================================

export const guardarSesion = (token: string, usuario: UsuarioAuth) => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};

export const obtenerToken = (): string | null => {
  return localStorage.getItem('token');
};

export const obtenerUsuarioLocal = (): UsuarioAuth | null => {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioAuth;
  } catch {
    return null;
  }
};

export const limpiarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};
