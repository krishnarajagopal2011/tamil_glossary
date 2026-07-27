import type { Metadata } from "next";
import { IndexList } from "@/components/app/index-list";
import { getLetterCounts, listHeadwords } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Index",
  description:
    "Browse all 5,062 social work terms alphabetically, with Tamil equivalents and explanations.",
  alternates: { canonical: "/browse" },
};

type Props = {
  searchParams: Promise<{ letter?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  // The index always has a letter open, the way the app's did.
  const letter = (params.letter?.slice(0, 1) ?? "A").toUpperCase();

  const [letters, headwords] = await Promise.all([
    getLetterCounts(),
    listHeadwords(letter),
  ]);

  return <IndexList letter={letter} terms={headwords} counts={letters} />;
}
