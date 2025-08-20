import { Metadata } from "next";
import ServicesPageHeader from "@/components/features/services/ServicesPageHeader";
import ServicesContent from "@/components/features/services/ServicesContent";

export const metadata: Metadata = {
  title: "Hizmetlerimiz - DeF1Club",
  description: "DeF1Club'da sunulan tüm hizmetler ve deneyimler hakkında bilgi edinin.",
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-0">
      <ServicesPageHeader />
      <ServicesContent />
    </div>
  );
}