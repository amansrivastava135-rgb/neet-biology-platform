import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://master360.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mock-test`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}