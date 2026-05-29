import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://master360.in";
  const today = new Date();

  return [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mock-test`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
