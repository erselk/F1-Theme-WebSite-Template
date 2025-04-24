import React from "react";

export default function BookingPageHeader() {
  return (
    <div className="py-10 md:py-16">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          🎟️ Padok&apos;ta Rezervasyon Yap
        </h1>
        <div className="max-w-2xl mx-auto">
          <p className="text-base md:text-lg">
            Alanlarımızdan birini seçerek hızlıca rezervasyon yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}