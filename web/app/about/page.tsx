import type { Metadata } from "next";
import { AboutScreen } from "@/components/app/about-screen";
import { getStats } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About this edition",
  description:
    "How the Glossary of Social Work in Tamil was written, lost, and recovered from a single Android installer file.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const stats = await getStats();
  return (
    <div className="mx-auto max-w-3xl">
      <AboutScreen stats={stats} />
    </div>
  );
}
