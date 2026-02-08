import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.dnava-api.com";

  // Páginas públicas estáticas
  const routes = [
    "",
    "/productos",
    "/consultar-pedido",
    "/libro-de-reclamaciones",
    "/politica-de-privacidad",
    "/politica-de-cambios-y-devoluciones",
    "/terminos-y-condiciones",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
