'use client';

import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function TermsPage() {
  const { language } = useThemeLanguage();
  
  // Define content in both languages
  const content = {
    tr: {
      title: "Kullanım Koşulları",
      lastUpdated: "Son Güncelleme: 27 Nisan 2025",
      intro: {
        p1: "DeF1Club tarafından işletilen DeF1Club web sitesini ve hizmetlerini ('biz', 'bize' veya 'bizim') kullanmadan önce lütfen bu Kullanım Koşullarını ('Koşullar', 'Kullanım Koşulları') dikkatlice okuyun.",
        p2: "Hizmetlerimize erişiminiz ve bunları kullanımınız, bu Koşulları kabul etmenize ve bunlara uymanıza bağlıdır. Bu Koşullar, Hizmete erişen veya Hizmeti kullanan tüm ziyaretçiler, kullanıcılar ve diğerleri için geçerlidir.",
        p3: "Hizmete erişerek veya kullanarak bu Koşullarla bağlı olmayı kabul edersiniz. Koşulların herhangi bir bölümüne katılmıyorsanız, Hizmete erişemezsiniz."
      },
      section1: {
        title: "1. Hizmet Kullanımı",
        intro: "DeF1Club, F1 simülasyon deneyimi ve ilgili hizmetler sunmaktadır. Hizmetlerimizi kullanarak şunları kabul edersiniz:",
        items: [
          "Hesap oluştururken veya hizmetlerimizi rezerve ederken doğru ve eksiksiz bilgi vermek",
          "Hesap bilgilerinizin güvenliğini korumak",
          "Hizmetleri yalnızca yasal amaçlar için ve bu Koşullara uygun olarak kullanmak",
          "Hizmetleri sistemlerimize zarar verebilecek, devre dışı bırakabilecek, aşırı yükleyebilecek veya bozabilecek şekilde kullanmamak",
          "Hizmetlerin herhangi bir kısmına, diğer hesaplara veya bilgisayar sistemlerine yetkisiz erişim elde etmeye çalışmamak"
        ]
      },
      section2: {
        title: "2. Rezervasyon ve Kayıtlar",
        intro: "Rezervasyon ve kayıt sistemimiz aşağıdaki koşullara tabidir:",
        items: [
          "Tüm rezervasyonlar müsaitlik durumuna bağlıdır",
          "Rezervasyonlar için ödemeler, onaylanmış ödeme yöntemlerimiz aracılığıyla önceden yapılmalıdır",
          "İptal politikaları rezervasyon işlemi sırasında açıkça belirtilecektir",
          "Herhangi bir kişiye herhangi bir zamanda herhangi bir nedenle hizmet vermeyi reddetme hakkını saklı tutarız",
          "Önceden bildirimde bulunmaksızın fiyatları ve müsaitlik durumunu değiştirebiliriz"
        ]
      },
      section3: {
        title: "3. Kullanıcı İçeriği",
        intro: "Hizmetimiz, belirli bilgileri, metinleri, grafikleri, videoları veya diğer materyalleri ('Kullanıcı İçeriği') göndermenize, bağlantı vermenize, saklamanıza, paylaşmanıza ve başka şekillerde kullanıma sunmanıza izin verebilir. Hizmetimize Kullanıcı İçeriği sağlayarak:",
        items: [
          "Bize bu içeriği kullanma, çoğaltma, değiştirme, uyarlama, yayınlama, çevirme, dağıtma ve görüntüleme hakkı verirsiniz",
          "Kullanıcı İçeriğini paylaşmak için gerekli haklara sahip olduğunuzu veya bunlara sahip olduğunuzu beyan ve garanti edersiniz",
          "Paylaştığınız tüm Kullanıcı İçeriğinin genel halk tarafından görüntülenebileceğini anlarsınız",
          "Yasa dışı, saldırgan, tehdit edici, karalayıcı veya başka şekilde uygunsuz içerik paylaşmamayı kabul edersiniz"
        ]
      },
      section4: {
        title: "4. Fikri Mülkiyet",
        p1: "Hizmet ve orijinal içeriği (Kullanıcı İçeriği hariç), özellikleri ve işlevleri DeF1Club ve lisans verenlerinin münhasır mülkiyetindedir ve öyle kalacaktır. Hizmet, hem Türkiye hem de yabancı ülkelerin telif hakkı, ticari marka ve diğer yasaları tarafından korunmaktadır. Ticari markalarımız ve ticari görünümümüz, DeF1Club'ın önceden yazılı izni olmaksızın herhangi bir ürün veya hizmetle bağlantılı olarak kullanılamaz."
      },
      section5: {
        title: "5. Ödeme Koşulları",
        intro: "Hizmetlerimiz için ödeme aşağıdaki koşullara tabidir:",
        items: [
          "Aksi belirtilmedikçe tüm fiyatlar Türk Lirası (TL) cinsindendir",
          "Ödeme, yetkili ödeme işleme sistemlerimiz aracılığıyla yapılmalıdır",
          "Kredi kartı bilgilerini işlemek için güvenli üçüncü taraf ödeme işlemcileri kullanıyoruz",
          "Fiyatlarımızı istediğimiz zaman değiştirme hakkını saklı tutarız",
          "İadeler, hizmete bağlı olarak değişebilecek iptal politikamıza tabidir"
        ]
      },
      section6: {
        title: "6. Sorumluluk Sınırlaması",
        intro: "DeF1Club veya yöneticileri, çalışanları, ortakları, acenteleri, tedarikçileri veya bağlı kuruluşları, şunlardan kaynaklanan kâr, veri, kullanım, iyi niyet veya diğer maddi olmayan kayıplar dahil ancak bunlarla sınırlı olmamak üzere hiçbir dolaylı, tesadüfi, özel, sonuç olarak ortaya çıkan veya cezalandırıcı zararlardan sorumlu olmayacaktır:",
        items: [
          "Hizmete erişiminiz veya kullanımınız veya Hizmete erişememeniz veya kullanamıyor olmanız",
          "Hizmet üzerindeki herhangi bir üçüncü tarafın davranışı veya içeriği",
          "Hizmetten elde edilen herhangi bir içerik",
          "İletimlerinizin veya içeriğinizin yetkisiz erişimi, kullanımı veya değiştirilmesi"
        ]
      },
      section7: {
        title: "7. Feragatname",
        p1: "Hizmeti kullanmanız tamamen kendi sorumluluğunuzdadır. Hizmet 'OLDUĞU GİBİ' ve 'MEVCUT OLDUĞU GİBİ' temeline dayanarak sunulur. Hizmet, açık veya zımni, ticari elverişlilik, belirli bir amaca uygunluk, ihlal etmeme veya performans seyri dahil ancak bunlarla sınırlı olmamak üzere hiçbir garanti olmaksızın sunulur.",
        p2: "DeF1Club, bağlı kuruluşları, yan kuruluşları ve lisans verenleri, a) Hizmetin kesintisiz, güvenli veya belirli bir zamanda veya yerde kullanılabilir olacağını; b) herhangi bir hata veya kusurun düzeltileceğini; c) Hizmetin virüs veya diğer zararlı bileşenlerden arındırılmış olduğunu; veya d) Hizmeti kullanmanın sonuçlarının gereksinimlerinizi karşılayacağını garanti etmez."
      },
      section8: {
        title: "8. Geçerli Yasa",
        p1: "Bu Koşullar, çakışma hükümleri dikkate alınmaksızın Türkiye yasalarına göre yönetilecek ve yorumlanacaktır.",
        p2: "Bu Koşulların herhangi bir hakkını veya hükmünü yerine getirmemiz, bu haklardan feragat edildiği anlamına gelmeyecektir. Bu Koşulların herhangi bir hükmünün bir mahkeme tarafından geçersiz veya uygulanamaz olduğuna karar verilirse, bu Koşulların kalan hükümleri yürürlükte kalmaya devam edecektir."
      },
      section9: {
        title: "9. Fesih",
        p1: "Herhangi bir ön bildirimde bulunmaksızın veya sorumluluk almaksızın, tamamen kendi takdirimize bağlı olarak, herhangi bir nedenle ve sınırlama olmaksızın, Koşulların ihlali dahil olmak üzere, hesabınızı sonlandırabilir veya askıya alabilir ve Hizmete erişiminizi engelleyebiliriz.",
        p2: "Hesabınızı sonlandırmak istiyorsanız, Hizmeti kullanmayı bırakabilirsiniz. Koşulların, niteliği gereği feshinden sonra da geçerli olması gereken tüm hükümleri, mülkiyet hükümleri, garanti reddiyeleri, tazminat ve sorumluluk sınırlamaları dahil ancak bunlarla sınırlı olmamak üzere, fesihten sonra da geçerli olmaya devam edecektir."
      },
      section10: {
        title: "10. Koşullardaki Değişiklikler",
        p1: "Tamamen kendi takdirimize bağlı olarak, bu Koşulları herhangi bir zamanda değiştirme veya değiştirme hakkını saklı tutarız. Bir değişiklik önemliyse, yeni koşulların yürürlüğe girmesinden önce en az 30 gün önceden bildirimde bulunacağız. Neyin önemli bir değişiklik oluşturduğu tamamen kendi takdirimize bağlı olarak belirlenecektir.",
        p2: "Herhangi bir revizyon yürürlüğe girdikten sonra Hizmetimize erişmeye veya kullanmaya devam ederek, revize edilmiş koşullarla bağlı olmayı kabul edersiniz. Yeni koşulları kabul etmiyorsanız, Hizmeti kullanma yetkiniz artık yoktur."
      },
      section11: {
        title: "11. Bize Ulaşın",
        p1: "Bu Koşullar hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin:",
        contact: "E-posta: terms@DeF1Club.com<br />Telefon: +90 212 555 1234<br />Adres: DeF1Club, İstanbul, Türkiye"
      },
      footer: "Tüm Hakları Saklıdır."
    },
    en: {
      title: "Terms of Service",
      lastUpdated: "Last Updated: April 27, 2025",
      intro: {
        p1: "Please read these Terms of Service (\"Terms\", \"Terms of Service\") carefully before using the DeF1Club website and services operated by DeF1Club (\"us\", \"we\", \"our\").",
        p2: "Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.",
        p3: "By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service."
      },
      section1: {
        title: "1. Use of Service",
        intro: "DeF1Club provides an F1 simulation experience and related services. By using our services, you agree:",
        items: [
          "To provide accurate and complete information when creating an account or booking our services",
          "To maintain the security of your account information",
          "To use the services only for lawful purposes and in accordance with these Terms",
          "Not to use the services in any way that could damage, disable, overburden, or impair our systems",
          "Not to attempt to gain unauthorized access to any parts of the services, other accounts, or computer systems"
        ]
      },
      section2: {
        title: "2. Booking and Reservations",
        intro: "Our booking and reservation system is subject to the following terms:",
        items: [
          "All bookings are subject to availability",
          "Payments for bookings must be made in advance through our approved payment methods",
          "Cancellation policies will be clearly stated during the booking process",
          "We reserve the right to refuse service to anyone for any reason at any time",
          "We may change prices and availability without prior notice"
        ]
      },
      section3: {
        title: "3. User Content",
        intro: "Our service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (\"User Content\"). By providing User Content to our service, you:",
        items: [
          "Grant us the right to use, reproduce, modify, adapt, publish, translate, distribute, and display such content",
          "Represent and warrant that you own or have the necessary rights to post the User Content",
          "Understand that all User Content you post may be viewed by the general public",
          "Agree not to post content that is illegal, offensive, threatening, defamatory, or otherwise inappropriate"
        ]
      },
      section4: {
        title: "4. Intellectual Property",
        p1: "The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of DeF1Club and its licensors. The Service is protected by copyright, trademark, and other laws of both Turkey and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of DeF1Club."
      },
      section5: {
        title: "5. Payment Terms",
        intro: "Payment for our services is governed by the following terms:",
        items: [
          "All prices are in Turkish Lira (TRY) unless otherwise stated",
          "Payment must be made through our authorized payment processing systems",
          "We use secure third-party payment processors to handle credit card information",
          "We reserve the right to change our prices at any time",
          "Refunds are subject to our cancellation policy, which may vary depending on the service"
        ]
      },
      section6: {
        title: "6. Limitation of Liability",
        intro: "In no event shall DeF1Club, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:",
        items: [
          "Your access to or use of or inability to access or use the Service",
          "Any conduct or content of any third party on the Service",
          "Any content obtained from the Service",
          "Unauthorized access, use or alteration of your transmissions or content"
        ]
      },
      section7: {
        title: "7. Disclaimer",
        p1: "Your use of the Service is at your sole risk. The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.",
        p2: "DeF1Club, its subsidiaries, affiliates, and licensors do not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements."
      },
      section8: {
        title: "8. Governing Law",
        p1: "These Terms shall be governed and construed in accordance with the laws of Turkey, without regard to its conflict of law provisions.",
        p2: "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect."
      },
      section9: {
        title: "9. Termination",
        p1: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.",
        p2: "If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability."
      },
      section10: {
        title: "10. Changes to Terms",
        p1: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
        p2: "By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service."
      },
      section11: {
        title: "11. Contact Us",
        p1: "If you have any questions about these Terms, please contact us at:",
        contact: "Email: terms@DeF1Club.com<br />Phone: +90 212 555 1234<br />Address: DeF1Club, Istanbul, Turkey"
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
          <p className="mb-4">
            <strong>{t.intro.p3}</strong>
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section1.title}</h2>
          <p className="mb-4">
            {t.section1.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section1.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
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
            {t.section4.p1}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section5.title}</h2>
          <p className="mb-4">
            {t.section5.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section5.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section6.title}</h2>
          <p className="mb-4">
            {t.section6.intro}
          </p>
          <ul className="list-disc pl-6 mb-4">
            {t.section6.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section7.title}</h2>
          <p className="mb-4">
            {t.section7.p1}
          </p>
          <p className="mb-4">
            {t.section7.p2}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section8.title}</h2>
          <p className="mb-4">
            {t.section8.p1}
          </p>
          <p className="mb-4">
            {t.section8.p2}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section9.title}</h2>
          <p className="mb-4">
            {t.section9.p1}
          </p>
          <p className="mb-4">
            {t.section9.p2}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section10.title}</h2>
          <p className="mb-4">
            {t.section10.p1}
          </p>
          <p className="mb-4">
            {t.section10.p2}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.section11.title}</h2>
          <p className="mb-4">
            {t.section11.p1}
          </p>
          <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.section11.contact }} />
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