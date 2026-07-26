import type { MetadataRoute } from "next";
import { getAllTermSlugs, listCategories } from "@/lib/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [terms, categories] = await Promise.all([
    getAllTermSlugs(),
    listCategories(),
  ]);

  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/browse`, priority: 0.8 },
    { url: `${base}/categories`, priority: 0.6 },
    { url: `${base}/about`, priority: 0.5 },
    ...categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      priority: 0.6,
    })),
    ...terms.map((t) => ({ url: `${base}/term/${t.slug}`, priority: 0.7 })),
  ];
}
