'use client';

import { useState, ReactNode } from "react";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border pb-4">
      <button
        className="flex justify-between items-center w-full py-4 text-left font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className="ml-2 text-xl">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function FAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "📌 Rezervasyonlar kaç saat öncesinden yapılmalı?",
      answer: "En az 3 saat önceden yapılan rezervasyonlar için garanti sağlıyoruz. Son dakika talepleri için doğrudan bizimle iletişime geçin.",
    },
    {
      question: "📌 Grup etkinliklerinde kapasite nedir?",
      answer: (
        <div>
          <p>Her alan için kapasite değişmektedir:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>F1 Simülasyonu: 4 kişi/saat</li>
            <li>VR Alanı: 6 kişi</li>
            <li>Sahne Etkinliği: 100 kişiye kadar</li>
            <li>Toplantı Salonu: 15 kişi</li>
          </ul>
        </div>
      ),
    },
    {
      question: "📌 Yaş sınırı var mı?",
      answer: (
        <div>
          <ul className="list-disc pl-5 space-y-1">
            <li>F1 Simülasyonu: Minimum 13 yaş</li>
            <li>VR Alanı: Minimum 10 yaş (veli izniyle)</li>
            <li>Diğer alanlar için yaş kısıtlaması yoktur.</li>
          </ul>
        </div>
      ),
    },
    {
      question: "📌 Rezervasyonumu iptal edebilir miyim?",
      answer: "Etkinlik saatinden 24 saat öncesine kadar ücretsiz iptal hakkınız bulunur.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Sıkça Sorulan Sorular (SSS)
      </h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}