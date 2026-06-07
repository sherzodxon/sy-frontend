import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShY",
    short_name: "ShY",
    description: "SY Application",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4E6963",
    icons: [
      {
        src: "/img/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/img/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}