import { Metadata } from "next";
import AboutPageHeader from "@/components/features/about/AboutPageHeader";
import AboutContent from "@/components/features/about/AboutContent";

export const metadata: Metadata = {
  title: "Hakkımızda - PadokClub",
  description: "PadokClub hakkında bilgi edinin. Biz kimiz, misyonumuz ve vizyonumuz.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
      <AboutPageHeader />
      <AboutContent />
    </div>
  );
}