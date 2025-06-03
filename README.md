# PadokClub Website

PadokClub Formula 1 Simülasyon Merkezi'nin resmi web sitesi.

## Özellikler

- Next.js 14 ile geliştirilmiş modern web uygulaması
- Vercel üzerinde hosting
- Responsive tasarım
- Çoklu dil desteği (Türkçe/İngilizce)
- SEO optimizasyonu
- Blog sistemi
- Rezervasyon sistemi
- Admin paneli
- Performans optimizasyonu

## Teknik Detaylar

- **Framework:** Next.js 14
- **Dil:** TypeScript
- **Stil:** Tailwind CSS
- **Animasyonlar:** Framer Motion
- **Form Yönetimi:** React Hook Form
- **State Yönetimi:** React Context
- **Veritabanı:** MongoDB
- **Hosting:** Vercel
- **CDN:** Vercel Edge Network

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/padokclub-website.git
```

2. Bağımlılıkları yükleyin:
```bash
cd padokclub-website
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Dağıtım

Proje Vercel üzerinde otomatik olarak dağıtılmaktadır. `main` branch'e yapılan her push, otomatik olarak production ortamına deploy edilir.

## Son Değişiklikler

### 2024-03-21
- Tüm bileşenlerde yapılan değişiklikler:
  - Kenarlıklar 4 piksel kalınlığında beyaz olarak güncellendi (`border-4 border-white`)
  - Arka plan renkleri kaldırıldı (`bg-transparent`)
  - Tüm yazılar beyaz renge çevrildi (`text-white`)
  - Alt başlıklar beyaz renkte %80 opaklıkta ayarlandı (`text-white/80`)
  - İç bileşenlerin kenarlıkları beyaz renkte %30 opaklıkta ayarlandı (`border-white/30`)
  - Butonların kenarlıkları beyaz renkte %30 opaklıkta ayarlandı (`border-white/30`)
  - CTASection bileşeninde butonlar yan yana yerleştirildi ve metinleri güncellendi:
    - "Rezervasyon Yap"
    - "İletişime Geçin"

Etkilenen bileşenler:
- BlogSection
- EventsSection
- EventsSectionClient
- CTASection
- FeaturesSection
- HeroSection
- SimulatorsSection
- TestimonialsSection

### EventsSectionClient Güncellemesi
- Event tipinde icon özelliği olmadığı için sabit CalendarIcon kullanımına geçildi
- @heroicons/react paketi eklendi
- Dil desteği için title ve description alanları düzenlendi
- Tüm metinler beyaz renge çevrildi
- Arka plan kaldırıldı ve yerine beyaz kenarlık eklendi
- Kenarlık kalınlığı 4px olarak ayarlandı

### Genel Değişiklikler
- Tüm bileşenlerde arka plan renkleri kaldırıldı
- Tüm metinler beyaz renge çevrildi
- Tüm bileşenlere beyaz kenarlık eklendi
- İç bileşenlere yarı saydam beyaz kenarlık eklendi
- Butonlara beyaz kenarlık eklendi
- Alt başlıklar için beyaz renk %80 opaklıkta kullanıldı

Etkilenen bileşenler:
- BlogSection
- EventsSection
- CTASection
- EventsSectionClient
- FeaturesSection
- HeroSection
- SimulatorsSection
- TestimonialsSection

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@padokclub](https://twitter.com/padokclub)

Proje Linki: [https://github.com/yourusername/padokclub-website](https://github.com/yourusername/padokclub-website)
