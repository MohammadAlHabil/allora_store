import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Allora Store",
    short_name: "Allora",
    description: "Premier destination for fashion and lifestyle.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#D0460C",
    orientation: "portrait",
    scope: "/",
    lang: "en",
    dir: "ltr",
    categories: ["shopping", "lifestyle", "fashion"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Shop Women",
        url: "/shop/women",
        description: "Browse women's fashion",
        icons: [
          { src: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Shop Men",
        url: "/shop/men",
        description: "Browse men's fashion",
        icons: [
          { src: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        label: "Allora Store Home",
      },
    ],
  };
}
