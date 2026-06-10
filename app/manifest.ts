import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "姚凯 - Web / Full-stack Developer",
    short_name: "姚凯",
    description: siteConfig.description,
    start_url: "/zh",
    display: "standalone",
    background_color: "#fbfdff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
