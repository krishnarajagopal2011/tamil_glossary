import type { Metadata } from "next";
import { MeaningRedirect } from "./meaning-redirect";

export const metadata: Metadata = {
  title: "Meaning",
  robots: { index: false },
};

/**
 * The Meaning tab with nothing open yet.
 *
 * The tab normally points straight at the last entry read. A reader who has
 * opened nothing — or who lands here from a shared link — gets this instead.
 */
export default function MeaningPage() {
  return <MeaningRedirect />;
}
