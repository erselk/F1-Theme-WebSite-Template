'use client';

import React from "react";
import Image from "next/image";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

const AboutContent: React.FC = () => {
  const { language, isDark } = useThemeLanguage();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hikayemiz Bölümü */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-dark-grey dark:text-light-grey">
          {language === 'tr' ? 'Hikayemiz' : 'Our Story'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-lg mb-4 text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Padok, teknoloji, eğlence ve sosyal yaşamı bir araya getiren çok katlı bir deneyim merkezi olarak 18 Mayıs 2025\'te kapılarını açtı.' : 
                'Padok opened its doors on May 18, 2025 as a multi-floor experience center that brings together technology, entertainment, and social life.'}
            </p>
            <p className="text-lg mb-4 text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Bu dinamik yapı, köklerini 2020 yılında kurulan ve Türkiye\'nin teknoloji ve hijyen odaklı ilk e-spor merkezi olarak bilinen HP OMEN CLUB\'dan alıyor. Omen Club, e-spor eğitimleri, turnuvalar ve teknoloji odaklı etkinlikleriyle kısa sürede geniş bir kitleye ulaşarak sektörde öncü konuma gelmişti.' : 
                'This dynamic structure has its roots in HP OMEN CLUB, established in 2020 and known as Turkey\'s first technology and hygiene-focused e-sports center. Omen Club quickly reached a wide audience with its e-sports training, tournaments, and technology-focused events, becoming a pioneer in the sector.'}
            </p>
            <p className="text-lg text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Bugün, bu güçlü temeller üzerine kurulan Padok Club, çok daha geniş bir vizyonla yola devam ediyor: Yalnızca bir oyun alanı değil, aynı zamanda sosyal etkileşim, müzik, eğlence ve profesyonel deneyimlerin buluşma noktası.' : 
                'Today, Padok Club, built on these strong foundations, continues with a much broader vision: Not just a gaming space, but also a meeting point for social interaction, music, entertainment, and professional experiences.'}
            </p>
          </div>
          <div className="relative h-[300px] w-full">
            <Image
              src="/images/about/about1.jpg"
              alt={language === 'tr' ? "PadokClub Hikayemiz" : "PadokClub Our Story"}
              fill
              className="object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Kat Kat Deneyim Bölümü */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-dark-grey dark:text-light-grey">
          {language === 'tr' ? 'Kat Kat Deneyim' : 'Floor by Floor Experience'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">🎧</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'Sahne ve Performans Alanı' : 'Stage and Performance Area'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'DJ performanslarından konserlere, sahne şovlarından özel etkinliklere kadar ritmi yüksek bir atmosfer sunuyor.' : 
                'Offers a high-rhythm atmosphere from DJ performances to concerts, stage shows to special events.'}
            </p>
          </div>
          
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">☕</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'Kafe & Kutu Oyunları' : 'Café & Board Games'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Lezzetli içeceklerin ve atıştırmalıkların eşliğinde kutu oyunlarıyla eğlenceye doyabileceğin sosyal bir buluşma noktası.' : 
                'A social meeting point where you can enjoy board games accompanied by delicious drinks and snacks.'}
            </p>
          </div>
          
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">🕶️</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'VR Alanı' : 'VR Area'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Sanal gerçekliğin sınırlarını zorlayan oyunlar ve deneyimlerle kendini bambaşka dünyalarda bul.' : 
                'Find yourself in completely different worlds with games and experiences that push the boundaries of virtual reality.'}
            </p>
          </div>
          
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">🏁</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'F1 Yarış Simülasyonu' : 'F1 Racing Simulation'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Padok\'un odak noktası. Profesyonel direksiyon setleri, dev ekranlar ve yarış koltuklarıyla gerçek bir Formula atmosferi burada yaşanıyor.' : 
                'The focal point of Padok. Experience a real Formula atmosphere with professional steering sets, giant screens, and racing seats.'}
            </p>
          </div>
          
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">💻</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'İnternet Kafe' : 'Internet Café'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Yüksek performanslı bilgisayarlar ve konforlu alanlarla hem oyun hem de verimli çalışma için ideal ortam.' : 
                'An ideal environment for both gaming and productive work with high-performance computers and comfortable spaces.'}
            </p>
          </div>
          
          <div className="bg-very-light-grey dark:bg-graphite p-6 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
            <div className="text-2xl mb-2">🗣️</div>
            <h3 className="text-xl font-bold mb-2 text-dark-grey dark:text-light-grey">
              {language === 'tr' ? 'Toplantı Salonları' : 'Meeting Rooms'}
            </h3>
            <p className="text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Kurumsal buluşmalar, sunumlar ya da özel görüşmeler için donanımlı ve şık toplantı alanları.' : 
                'Equipped and stylish meeting areas for corporate meetings, presentations, or special discussions.'}
            </p>
          </div>
        </div>
      </section>

      {/* Tesislerimiz Bölümü */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-dark-grey dark:text-light-grey">
          {language === 'tr' ? 'Tesislerimiz' : 'Our Facilities'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-lg mb-4 text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Modern ve konforlu tesislerimizde en son teknoloji ekipmanları bulunmaktadır.' : 
                'Our modern and comfortable facilities feature the latest technology equipment.'}
            </p>
            <p className="text-lg text-medium-grey dark:text-silver">
              {language === 'tr' ? 
                'Padok, geçmişin birikimiyle geleceğe yön veriyor. Eğlence, teknoloji ve topluluğun buluştuğu bu yenilikçi merkez, her yaştan ziyaretçisine unutulmaz anlar vadediyor. Gel, keşfet, Padok\'ta yerini al!' : 
                'Padok guides the future with the accumulation of the past. This innovative center, where entertainment, technology, and community meet, promises unforgettable moments to visitors of all ages. Come, explore, and take your place at Padok!'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-[200px]">
              <Image
                src="/images/about/about3.jpg"
                alt={language === 'tr' ? "PadokClub Tesislerimiz" : "PadokClub Our Facilities"}
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="relative h-[200px]">
              <Image
                src="/images/about/about4.jpg"
                alt={language === 'tr' ? "PadokClub Simülatörlerimiz" : "PadokClub Our Simulators"}
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Bölümü */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-dark-grey dark:text-light-grey">
          {language === 'tr' ? 'Galeri' : 'Gallery'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <div key={num} className="relative h-[150px] md:h-[200px]">
              <Image
                src={`/images/about/about${num}.jpg`}
                alt={language === 'tr' ? `PadokClub Galeri ${num}` : `PadokClub Gallery ${num}`}
                fill
                className="object-cover rounded-lg hover:opacity-90 transition-opacity shadow-md"
              />
            </div>
          ))}
        </div>
      </section>

      {/* İletişim Bölümü */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-dark-grey dark:text-light-grey">
          {language === 'tr' ? 'Bize Ulaşın' : 'Contact Us'}
        </h2>
        <div className="bg-very-light-grey dark:bg-graphite p-8 rounded-lg shadow-md border border-light-grey dark:border-carbon-grey">
          <p className="text-lg mb-4 text-medium-grey dark:text-silver">
            {language === 'tr' ? 
              'Sorularınız veya rezervasyon talepleriniz için bizimle iletişime geçebilirsiniz.' : 
              'You can contact us for your questions or reservation requests.'}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-dark-grey dark:text-light-grey">
                {language === 'tr' ? 'İletişim Bilgilerimiz' : 'Contact Information'}
              </h3>
              <p className="mb-1 text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Adres: İstanbul Caddesi No:123, Şişli, İstanbul' : 'Address: İstanbul Avenue No:123, Şişli, İstanbul'}
              </p>
              <p className="mb-1 text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Telefon: +90 212 123 45 67' : 'Phone: +90 212 123 45 67'}
              </p>
              <p className="text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Email: info@padokclub.com' : 'Email: info@padokclub.com'}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-dark-grey dark:text-light-grey">
                {language === 'tr' ? 'Çalışma Saatleri' : 'Working Hours'}
              </h3>
              <p className="mb-1 text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Pazartesi - Cuma: 10:00 - 22:00' : 'Monday - Friday: 10:00 - 22:00'}
              </p>
              <p className="mb-1 text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Cumartesi: 09:00 - 23:00' : 'Saturday: 09:00 - 23:00'}
              </p>
              <p className="text-medium-grey dark:text-silver">
                {language === 'tr' ? 'Pazar: 10:00 - 20:00' : 'Sunday: 10:00 - 20:00'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutContent;