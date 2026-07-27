import type { Metadata } from "next";
import { ContactScreen } from "@/components/app/contact-screen";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach the author of the Glossary of Social Work in Tamil with a correction or a missing illustration.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 text-[0.9375rem] leading-relaxed text-app-ink sm:px-6 sm:py-10">
      <ContactScreen />
    </div>
  );
}
