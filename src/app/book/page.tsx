import { Metadata } from "next";
import BookingContent from "@/components/features/book/BookingContent";

export const metadata: Metadata = {
  title: "Rezervasyon - DeF1Club",
  description: "DeF1Club'da etkinlikleriniz için yer ayırtın ve rezervasyon yapın.",
};

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <BookingContent />
    </div>
  );
}