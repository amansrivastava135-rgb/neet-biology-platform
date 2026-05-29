import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/results",
        "/login",
        "/signup",
        "/api/",
      ],
    },
    sitemap: "https://master360.in/sitemap.xml",
  };
}
