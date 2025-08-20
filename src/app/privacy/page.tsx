'use client';

import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function PrivacyPage() {
  const { language } = useThemeLanguage();
  
  // Define content in both languages
  const content = {
    tr: {
      title: "Gizlilik Politikası",
      lastUpdated: "Son Güncelleme: 27 Nisan 2025",
      intro: {
        p1: "Bu Gizlilik Politikası, DeF1Club'ın ('biz', 'bize' veya 'bizim') web sitemizi ziyaret ettiğinizde, hizmetlerimizi kullandığınızda veya bizimle herhangi bir şekilde etkileşimde bulunduğunuzda kişisel bilgilerinizi nasıl topladığını, kullandığını ve açıkladığını açıklar.",
        p2: "Hizmetlerimize erişerek veya kullanarak bu Gizlilik Politikasını kabul etmiş olursunuz. Politikalarımız ve uygulamalarımızı kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın."
      },
      section1: {
        title: "1. Topladığımız Bilgiler",
        intro: "Web sitemizin kullanıcılarından çeşitli bilgi türleri toplayabiliriz, bunlar:",
        items: [
          "<strong>Kişisel Tanımlayıcılar:</strong> İsim, e-posta adresi, posta adresi, telefon numarası ve diğer benzer tanımlayıcılar.",
          "<strong>Finansal Bilgiler:</strong> Ödeme detayları, fatura adresi ve diğer işlem bilgileri.",
          "<strong>Ticari Bilgiler:</strong> Satın alınan veya düşünülen ürün veya hizmetlerin kayıtları.",
          "<strong>Kullanım Verileri:</strong> Web sitemiz, uygulamalarımız ve hizmetlerimizle nasıl etkileşimde bulunduğunuza dair bilgiler.",
          "<strong>Cihaz Bilgileri:</strong> IP adresi, cihaz türü, işletim sistemi, tarayıcı özellikleri, dil tercihleri ve diğer teknik bilgiler."
        ]
      },
      section2: {
        title: "2. Bilgileri Nasıl Toplarız",
        intro: "Bilgileri şu yollarla toplarız:",
        items: [
          "Bize bilgi sağladığınız doğrudan etkileşimler",
          "Çerezler ve benzer izleme teknolojileri dahil otomatik teknolojiler veya etkileşimler",
          "Üçüncü taraflar veya kamuya açık kaynaklar"
        ]
      },
      section3: {
        title: "3. Bilgilerinizi Nasıl Kullanıyoruz",
        intro: "Topladığımız bilgileri çeşitli amaçlar için kullanırız, bunlar:",
        items: [
          "Rezervasyonlarınızı, rezervasyonlarınızı ve işlemlerinizi işlemek ve yerine getirmek",
          "Hesabınızı oluşturmak ve sürdürmek",
          "Müşteri desteği sağlamak ve taleplerinize yanıt vermek",
          "Şartlarımız ve politikalarımızdaki güncellemeler gibi idari bilgileri göndermek",
          "Pazarlama iletişimleri ve kişiselleştirilmiş teklifler göndermek",
          "Web sitemizi ve hizmetlerimizi geliştirmek ve optimize etmek",
          "Dolandırıcılık, yetkisiz veya yasa dışı faaliyetlere karşı korumak",
          "Yasal yükümlülüklere uymak"
        ]
      },
      section4: {
        title: "4. Bilgilerinizin Açıklanması",
        intro: "Topladığımız veya bize sağladığınız kişisel bilgileri şu şekilde açıklayabiliriz:",
        items: [
          "Yan kuruluşlarımıza ve bağlı şirketlerimize",
          "İşimizi desteklemek için kullandığımız yüklenicilere, hizmet sağlayıcılara ve diğer üçüncü taraflara",
          "Sağladığınız amacı yerine getirmek için",
          "Herhangi bir mahkeme emrine, yasaya veya yasal sürece uymak için",
          "Hizmet şartlarımızı ve diğer anlaşmalarımızı uygulamak için",
          "Şirketimizin, müşterilerimizin veya başkalarının haklarını, mülkiyetini veya güvenliğini korumak için"
        ],
        additional: "Ek olarak, bilgilerinizi pazarlama, reklam ve analitik amaçları için üçüncü taraflarla paylaşabiliriz. Bu, hizmetlerimizi geliştirmek ve size daha alakalı içerik ve reklamlar sunmak için veri brokerlarına, reklamcılara ve pazarlama ortaklarına toplu veya kimliği gizlenmiş verilerin satışını içerebilir."
      },
      section5: {
        title: "5. Çerezler ve İzleme Teknolojileri",
        p1: "Web sitemizde etkinliği izlemek ve belirli bilgileri toplamak için çerezler, web işaretçileri, pikseller ve benzer izleme teknolojileri kullanıyoruz. Bu teknolojiler, ziyaretçilerin sitemizle nasıl etkileşim kurduğunu anlamamıza, içeriği kişiselleştirmemize ve site trafiğini analiz etmemize yardımcı olur.",
        p2: "Çoğu tarayıcı çerezleri kabul etmeyi reddetmenize ve çerezleri silmenize izin verir. Çerezleri devre dışı bırakırsanız veya reddederseniz, lütfen bu web sitesinin bazı bölümlerinin erişilemez hale gelebileceğini veya düzgün çalışmayabileceğini unutmayın."
      },
      section6: {
        title: "6. Veri Güvenliği",
        p1: "Kişisel bilgilerinizi kazara kayıp ve yetkisiz erişim, kullanım, değiştirme ve ifşadan korumak için makul güvenlik önlemleri uyguluyoruz. Ancak, internet üzerinden bilgi iletimi tamamen güvenli değildir ve web sitemize iletilen kişisel bilgilerinizin güvenliğini garanti edemeyiz."
      },
      section7: {
        title: "7. Haklarınız",
        intro: "Konumunuza ve geçerli yasalara bağlı olarak, kişisel bilgilerinizle ilgili belirli haklarınız olabilir, bunlar:",
        items: [
          "Kişisel verilerinize erişim hakkı",
          "Kişisel verilerinizin düzeltilmesini talep etme hakkı",
          "Kişisel verilerinizin silinmesini talep etme hakkı",
          "Kişisel verilerinizin işlenmesini kısıtlama hakkı",
          "Veri taşınabilirliği hakkı",
          "Kişisel verilerinizin işlenmesine itiraz etme hakkı"
        ],
        additional: "Bu haklardan herhangi birini kullanmak için, lütfen 'Bize Ulaşın' bölümünde sağlanan bilgileri kullanarak bizimle iletişime geçin."
      },
      section8: {
        title: "8. Çocukların Gizliliği",
        p1: "Web sitemiz 13 yaşın altındaki çocuklar için tasarlanmamıştır ve 13 yaşın altındaki çocuklardan bilerek kişisel bilgi toplamıyoruz. 13 yaşın altındaysanız, lütfen bu web sitesinde herhangi bir bilgi sağlamayın."
      },
      section9: {
        title: "9. Gizlilik Politikamızdaki Değişiklikler",
        p1: "Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Herhangi bir değişiklik, güncellenmiş bir revizyon tarihi ile bu sayfada yayınlanacaktır. Bilgilerinizi nasıl koruduğumuz ve kullandığımız konusunda bilgi sahibi olmak için bu gizlilik politikasını periyodik olarak gözden geçirmenizi öneririz."
      },
      section10: {
        title: "10. Bize Ulaşın",
        p1: "Bu gizlilik politikası veya veri uygulamalarımız hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin:",
        contact: "E-posta: privacy@DeF1Club.com<br />Telefon: +90 212 555 1234<br />Adres: DeF1Club, İstanbul, Türkiye"
      },
      footer: "Tüm Hakları Saklıdır."
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: April 27, 2025",
      intro: {
        p1: "This Privacy Policy describes how DeF1Club ('we,' 'us,' or 'our') collects, uses, and discloses your personal information when you visit our website, use our services, or interact with us in any way.",
        p2: "By accessing or using our services, you agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our services."
      },
      section1: {
        title: "1. Information We Collect",
        intro: "We may collect several types of information from and about users of our website, including:",
        items: [
          "<strong>Personal Identifiers:</strong> Name, email address, postal address, phone number, and other similar identifiers.",
          "<strong>Financial Information:</strong> Payment details, billing address, and other transaction information.",
          "<strong>Commercial Information:</strong> Records of products or services purchased or considered.",
          "<strong>Usage Data:</strong> Information about how you interact with our website, applications, and services.",
          "<strong>Device Information:</strong> IP address, device type, operating system, browser characteristics, language preferences, and other technical information."
        ]
      },
      section2: {
        title: "2. How We Collect Information",
        intro: "We collect information through:",
        items: [
          "Direct interactions when you provide information to us",
          "Automated technologies or interactions, including cookies and similar tracking technologies",
          "Third parties or publicly available sources"
        ]
      },
      section3: {
        title: "3. How We Use Your Information",
        intro: "We use the information we collect for various purposes, including to:",
        items: [
          "Process and fulfill your bookings, reservations, and transactions",
          "Create and maintain your account",
          "Provide customer support and respond to your requests",
          "Send administrative information, such as updates to our terms and policies",
          "Send marketing communications and personalized offers",
          "Improve and optimize our website and services",
          "Protect against fraudulent, unauthorized, or illegal activity",
          "Comply with legal obligations"
        ]
      },
      section4: {
        title: "4. Disclosure of Your Information",
        intro: "We may disclose personal information that we collect or that you provide:",
        items: [
          "To our subsidiaries and affiliates",
          "To contractors, service providers, and other third parties we use to support our business",
          "To fulfill the purpose for which you provide it",
          "To comply with any court order, law, or legal process",
          "To enforce our terms of service and other agreements",
          "To protect the rights, property, or safety of our company, our customers, or others"
        ],
        additional: "Additionally, we may share your information with third parties for marketing, advertising, and analytics purposes. This may include the sale of aggregated or de-identified data to data brokers, advertisers, and marketing partners to help improve our services and deliver more relevant content and advertisements to you."
      },
      section5: {
        title: "5. Cookies and Tracking Technologies",
        p1: "We use cookies, web beacons, pixels, and similar tracking technologies to track activity on our website and collect certain information. These technologies help us understand how visitors interact with our site, personalize content, and analyze site traffic.",
        p2: "Most browsers allow you to refuse to accept cookies and to delete cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly."
      },
      section6: {
        title: "6. Data Security",
        p1: "We implement reasonable security measures to protect your personal information from accidental loss and unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is not completely secure, and we cannot guarantee the security of your personal information transmitted to our website."
      },
      section7: {
        title: "7. Your Rights",
        intro: "Depending on your location and applicable laws, you may have certain rights regarding your personal information, which may include:",
        items: [
          "The right to access your personal data",
          "The right to request correction of your personal data",
          "The right to request deletion of your personal data",
          "The right to restrict processing of your personal data",
          "The right to data portability",
          "The right to object to processing of your personal data"
        ],
        additional: "To exercise any of these rights, please contact us using the information provided in the \"Contact Us\" section."
      },
      section8: {
        title: "8. Children's Privacy",
        p1: "Our website is not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13. If you are under 13, please do not provide any information on this website."
      },
      section9: {
        title: "9. Changes to Our Privacy Policy",
        p1: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this privacy policy periodically to stay informed about how we are protecting and using your information."
      },
      section10: {
        title: "10. Contact Us",
        p1: "If you have any questions about this privacy policy or our data practices, please contact us at:",
        contact: "Email: privacy@DeF1Club.com<br />Phone: +90 212 555 1234<br />Address: DeF1Club, Istanbul, Turkey"
      },
      footer: "All Rights Reserved."
    }
  };
  
  // Select the current language content
  const t = content[language as keyof typeof content];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{t.title}</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="mb-8">
          <p className="text-lg mb-4">{t.lastUpdated}</p>
          <p className="mb-4">
            {t.intro.p1}
          </p>
          <p className="mb-4">
            {t.intro.p2}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section1.title}</h2>
          <p className="mb-4">
            {t.section1.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section1.items.map((item, index) => (
              <li key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section2.title}</h2>
          <p className="mb-4">
            {t.section2.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section2.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section3.title}</h2>
          <p className="mb-4">
            {t.section3.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section3.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section4.title}</h2>
          <p className="mb-4">
            {t.section4.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section4.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
          <p className="mb-4">
            {t.section4.additional}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section5.title}</h2>
          <p className="mb-4">
            {t.section5.p1}
          </p>
          <p className="mb-4">
            {t.section5.p2}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section6.title}</h2>
          <p className="mb-4">
            {t.section6.p1}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section7.title}</h2>
          <p className="mb-4">
            {t.section7.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section7.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
          <p className="mb-4">
            {t.section7.additional}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section8.title}</h2>
          <p className="mb-4">
            {t.section8.p1}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section9.title}</h2>
          <p className="mb-4">
            {t.section9.p1}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section10.title}</h2>
          <p className="mb-4">
            {t.section10.p1}
          </p>
          <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.section10.contact }} />
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DeF1Club. {t.footer}
          </p>
        </div>
      </div>
    </div>
  );
}