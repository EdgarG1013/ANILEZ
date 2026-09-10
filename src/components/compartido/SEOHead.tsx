import { useEffect } from "react";

// ─── Componente para meta tags dinámicos por página ──────────────────────────
// Actualiza <title>, meta description, Open Graph, Twitter Card y JSON-LD.
// Los valores por defecto en index.html se sobreescriben al montar y se
// restauran al desmontar.

const SITE = "https://anilez.site";
const DEFAULTS = {
  titulo: "ANILEZ — Catálogo de Anime y Manga",
  descripcion: "Explora el catálogo completo de anime y manga. Organiza tu biblioteca, sigue tu progreso y descubre nuevos títulos.",
  imagen: `${SITE}/ANILEZ.svg`,
  url: SITE,
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  if (!href) return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

interface SEOHeadProps {
  titulo?: string;
  descripcion?: string;
  url?: string;
  imagen?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEOHead({
  titulo,
  descripcion,
  url,
  imagen,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "";
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") ?? "";
    const prevOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";
    const prevOgUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? "";
    const prevTwTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ?? "";
    const prevTwDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") ?? "";
    const prevTwImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ?? "";
    const prevCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
    const prevJsonLd = document.querySelector('script[type="application/ld+json"]')?.textContent ?? "";

    const t = titulo || DEFAULTS.titulo;
    const d = descripcion || DEFAULTS.descripcion;
    const img = imagen || DEFAULTS.imagen;
    const u = url || DEFAULTS.url;

    document.title = t;
    setMeta("name", "description", d);
    setMeta("property", "og:title", t);
    setMeta("property", "og:description", d);
    setMeta("property", "og:image", img);
    setMeta("property", "og:url", u);
    setMeta("name", "twitter:title", t);
    setMeta("name", "twitter:description", d);
    setMeta("name", "twitter:image", img);
    setCanonical(u);

    // JSON-LD
    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdEl = document.createElement("script");
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdEl);
    }

    return () => {
      document.title = prevTitle;
      setMeta("name", "description", prevDesc);
      setMeta("property", "og:title", prevOgTitle);
      setMeta("property", "og:description", prevOgDesc);
      setMeta("property", "og:image", prevOgImage);
      setMeta("property", "og:url", prevOgUrl);
      setMeta("name", "twitter:title", prevTwTitle);
      setMeta("name", "twitter:description", prevTwDesc);
      setMeta("name", "twitter:image", prevTwImage);
      setCanonical(prevCanonical);
      if (jsonLdEl) jsonLdEl.remove();
      else if (prevJsonLd) {
        const old = document.querySelector('script[type="application/ld+json"]');
        if (old) old.remove();
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = prevJsonLd;
        document.head.appendChild(script);
      }
    };
  }, [titulo, descripcion, url, imagen, jsonLd]);

  return null;
}
