import type { Metadata } from "next";
import { RecentList } from "@/components/app/recent-list";

export const metadata: Metadata = {
  title: "Recently opened",
  // The list lives on the reader's device; there is nothing here to index.
  robots: { index: false },
};

export default function RecentPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <RecentList />
    </div>
  );
}
