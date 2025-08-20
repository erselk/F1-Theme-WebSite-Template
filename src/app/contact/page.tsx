import { Metadata } from "next";
import ContactPageHeader from "@/components/features/contact/ContactPageHeader";
import ContactContent from "@/components/features/contact/ContactContent";

export const metadata: Metadata = {
  title: "İletişim - DeF1Club",
  description: "DeF1Club ile iletişime geçin, adres bilgileri, ziyaret saatleri ve iletişim kanalları.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-0 text-[13px] sm:text-base scale-95 sm:scale-100">
      <ContactPageHeader />
      <ContactContent />
    </div>
  );
}