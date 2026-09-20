// ─── Cola de solicitudes con rate limiting para el frontend ──────────────────
// Espacia las peticiones HTTP para evitar 429 del backend/Tenrai.
// Transparente: se integra via adapter personalizado en axios.

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

interface ColaItem {
  config: InternalAxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  intentos: number;
}

const DELAY_ENTRE_REQUESTS = 250;
const MAX_RETRIES_429 = 2;
const RETRY_AFTER_DEFAULT = 5000;
const TIMEOUT_REQUEST = 15000;

let enCola: ColaItem[] = [];
let procesando = false;

function esperar(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function parseRetryAfter(header: string | null): number {
  if (!header) return RETRY_AFTER_DEFAULT;
  const seconds = Number(header);
  if (!isNaN(seconds) && seconds > 0) return seconds * 1000;
  return RETRY_AFTER_DEFAULT;
}

function construirUrl(config: InternalAxiosRequestConfig): string {
  let url = config.baseURL ?? '';
  url += config.url ?? '';
  if (config.params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(config.params)) {
      if (v != null) qs.set(k, String(v));
    }
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }
  return url;
}

function construirHeaders(config: InternalAxiosRequestConfig): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (config.headers) {
    for (const [k, v] of Object.entries(config.headers)) {
      if (v != null) h[k] = String(v);
    }
  }
  return h;
}

async function ejecutarFetch(config: InternalAxiosRequestConfig): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_REQUEST);

  try {
    const res = await fetch(construirUrl(config), {
      method: config.method?.toUpperCase() ?? 'GET',
      headers: construirHeaders(config),
      body: typeof config.data === 'string' ? config.data : config.data ? JSON.stringify(config.data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const error: Error & { response?: { status: number; data: unknown; headers: Record<string, string> } } = Object.assign(
        new Error(`Request failed with status ${res.status}`),
        {
          response: {
            status: res.status,
            data: body ? JSON.parse(body) : {},
            headers: Object.fromEntries(res.headers.entries()),
          },
        },
      );
      throw error;
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function procesarSiguiente(): Promise<void> {
  if (procesando || enCola.length === 0) return;
  procesando = true;

  while (enCola.length > 0) {
    const item = enCola.shift()!;
    const { config, resolve, reject, intentos } = item;

    try {
      const respuesta = await ejecutarFetch(config);
      resolve(respuesta);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 429 && intentos < MAX_RETRIES_429) {
        const retryAfter = (error as { response?: { headers?: Record<string, string> } })?.response?.headers?.['retry-after'];
        const delay = parseRetryAfter(retryAfter ?? null);
        await esperar(delay);
        enCola.unshift({ config, resolve, reject, intentos: intentos + 1 });
        continue;
      }

      reject(error);
    }

    if (enCola.length > 0) {
      await esperar(DELAY_ENTRE_REQUESTS);
    }
  }

  procesando = false;
}

export function encolar(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const wrappedResolve = (data: unknown) => {
      resolve({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    };
    enCola.push({ config, resolve: wrappedResolve, reject, intentos: 0 });
    procesarSiguiente();
  });
}
