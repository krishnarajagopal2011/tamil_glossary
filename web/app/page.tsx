import { HomeGrid } from "@/components/app/home-grid";
import { getLetterCounts } from "@/lib/queries";

export const revalidate = 3600;

export default async function HomePage() {
  const letters = await getLetterCounts();
  return <HomeGrid counts={letters} />;
}
