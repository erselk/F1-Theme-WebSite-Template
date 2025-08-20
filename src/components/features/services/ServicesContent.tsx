'use client';

import { motion } from 'framer-motion';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { useTranslation } from 'next-i18next';
import ServiceCard from './ServiceCard';

const ServicesContent = () => {
  const { isDark, language } = useThemeLanguage();
  const { t } = useTranslation('services');

  const servicesList = [
    {
      emoji: '🏁',
      titleKey: language === 'tr' ? 'F1 Yarış Simülasyonu' : 'F1 Racing Simulation',
      descriptionKey: language === 'tr' 
        ? 'Gerçekçilik, hız ve teknoloji üçgeninde kurgulanmış simülasyon deneyimi.'
        : 'A simulation experience crafted at the intersection of realism, speed, and technology.',
      detailKey: language === 'tr'
        ? 'Padok\'un merkezinde yer alan F1 Yarış Simülasyon alanı, otomotiv teknolojisi, simülasyon mühendisliği ve e-spor disiplinlerinin kesişiminde konumlanır. Profesyonel yarış simülatörlerinde kullanılan yüksek hassasiyetli direksiyon setleri, hidrolik destekli özel koltuklar ve ultra geniş görüş açısı sunan çoklu ekran sistemleriyle donatılmıştır.\n\nBu sistemler, fiziksel sürüş dinamiklerini birebir taklit eden kuvvet geri bildirimi (force feedback) ve titreşim sistemleriyle kullanıcıya mekanik tepki üzerinden öğrenme ve deneyimleme imkânı sunar. Geliştirilen yazılımlar sayesinde gerçek pist koşulları, lastik aşınmaları, aerodinamik etkiler ve hava koşulları gibi detaylar simülasyona entegre edilmiştir.\n\nF1 tutkunları, amatör sürücüler ve teknoloji meraklıları için özel olarak planlanan bu kat; bireysel sürüş seansları, çok oyunculu rekabetçi etkinlikler ve lig formatında turnuvalar ile sürekli aktif tutulmaktadır. Ayrıca simülasyon tabanlı öğrenme teknikleriyle genç yaşta sürüş farkındalığını artırmak isteyen kullanıcılar için eğitim odaklı oturumlar da sunulmaktadır.'
        : 'The F1 Racing Simulation area, located at the heart of Padok, sits at the intersection of automotive technology, simulation engineering, and esports disciplines. It is equipped with high-precision steering sets used in professional racing simulators, hydraulically supported special seats, and multi-screen systems offering an ultra-wide field of view.\n\nThese systems provide users with the opportunity to learn and experience through mechanical response via force feedback and vibration systems that precisely mimic physical driving dynamics. Thanks to developed software, details such as real track conditions, tire wear, aerodynamic effects, and weather conditions are integrated into the simulation.\n\nSpecifically designed for F1 enthusiasts, amateur drivers, and technology enthusiasts, this floor is kept continuously active with individual driving sessions, multiplayer competitive events, and league-format tournaments. Additionally, education-focused sessions are offered for users who want to increase driving awareness at a young age through simulation-based learning techniques.',
      longDescriptionKey: 'f1.longDescription',
      imageSrc: '/images/f1.2.jpg',
    },
    {
      emoji: '🎧',
      titleKey: language === 'tr' ? 'Sahne ve Performans Alanı' : 'Stage and Performance Area',
      descriptionKey: language === 'tr'
        ? 'Sanatın, teknolojinin ve topluluğun buluştuğu etkileşimli alan.'
        : 'An interactive space where art, technology, and community converge.',
      detailKey: language === 'tr'
        ? 'Padok\'un etkinlik katı, akustik mühendislik ve sahne teknolojileri dikkate alınarak tasarlanmış çok işlevli bir performans alanıdır. DJ performansları, akustik konserler, stand-up şovları, açık mikrofon geceleri ve interaktif performanslar gibi birçok farklı etkinlik türünü barındıracak şekilde yapılandırılmıştır.\n\nSistem, yüksek çözünürlüklü LED ışık panelleri, otomatik senkronize ışık sistemleri, çok kanallı dijital mikser altyapısı ve gürültü kontrol panelleri gibi sahne tasarımında ön plana çıkan unsurları içerir. Katılımcılar sadece izleyici değil, aynı zamanda etkinliğe dahil olabilecek interaktif unsurlarla deneyimin bir parçası haline gelir.\n\nAyrıca bu alan, müzik teknolojileri üzerine eğitimler, seminerler veya workshop\'lar gibi öğrenme temelli içeriklerle de kullanılabilmektedir.'
        : 'Padok\'s event floor is a multifunctional performance space designed with acoustic engineering and stage technologies in mind. It is configured to accommodate many different types of events, such as DJ performances, acoustic concerts, stand-up shows, open mic nights, and interactive performances.\n\nThe system includes prominent elements in stage design such as high-resolution LED light panels, automatically synchronized lighting systems, multi-channel digital mixer infrastructure, and noise control panels. Participants become not just spectators, but part of the experience with interactive elements that can be included in the event.\n\nAdditionally, this area can be used with learning-based content such as training sessions, seminars, or workshops on music technologies.',
      longDescriptionKey: 'stage.longDescription',
      imageSrc: '/images/stage.jpg',
    },
    {
      emoji: '☕',
      titleKey: language === 'tr' ? 'Kafe & Kutu Oyunları Alanı' : 'Café & Board Games Area',
      descriptionKey: language === 'tr'
        ? 'Sosyal oyun teorisiyle beslenen samimi ve kapsayıcı bir sosyalleşme ortamı.'
        : 'An intimate and inclusive socializing environment nourished by social game theory.',
      detailKey: language === 'tr'
        ? 'Padok\'un sosyal etkileşim katı, yalnızca bir kafe değil; aynı zamanda oyun temelli öğrenme, iş birliği geliştirme ve sosyal zekâ etkileşimi üzerine kurulmuş bir deneyim alanıdır. Rahat oturma grupları, masa düzenleri ve sessiz köşelerle her türden kullanıcıyı ağırlayabilecek esnekliğe sahiptir.\n\nKafe bölümünde servis edilen içecekler ve atıştırmalıklar, hem bireysel çalışma hem de grup aktiviteleri sırasında kullanılabilir şekilde planlanmıştır. Kutu oyunları alanında ise klasik ve modern masa oyunlarının yanında, stratejiye dayalı veya hikâye tabanlı oyun seçenekleriyle çok boyutlu düşünme ve sosyal etkileşim desteklenir.\n\nGrup dinamikleri üzerine kurulu bu alan, takım çalışması, karar verme ve empati geliştirme becerilerinin pratik edilmesine de olanak tanır. Bu sayede sadece eğlenmekle kalmaz, bilişsel olarak da gelişim sağlanır.'
        : 'Padok\'s social interaction floor is not just a café; it is also an experience space built on game-based learning, cooperation development, and social intelligence interaction. It has the flexibility to accommodate all types of users with comfortable seating groups, table arrangements, and quiet corners.\n\nBeverages and snacks served in the café section are planned to be usable during both individual work and group activities. In the board games area, multidimensional thinking and social interaction are supported with classic and modern board games, as well as strategy-based or story-based game options.\n\nBuilt on group dynamics, this area also allows for practicing teamwork, decision-making, and empathy development skills. This way, users not only have fun but also develop cognitively.',
      longDescriptionKey: 'cafe.longDescription',
      imageSrc: '/images/cafe.jpg',
    },
    {
      emoji: '🕶️',
      titleKey: language === 'tr' ? 'VR (Sanal Gerçeklik) Alanı' : 'VR (Virtual Reality) Area',
      descriptionKey: language === 'tr'
        ? 'Gerçeklik ötesi bir evrene açılan kapı: Bütünsel VR deneyimi.'
        : 'A gateway to a beyond-reality universe: A holistic VR experience.',
      detailKey: language === 'tr'
        ? 'Sanal Gerçeklik alanı, görsel, işitsel ve mekansal algıyı bir araya getirerek kullanıcıyı dijital bir dünyada fiziksel olarak varmış gibi hissettiren deneyimlerle donatılmıştır. Burada kullanılan cihazlar arasında yüksek çözünürlüklü VR başlıkları, 6DoF (six degrees of freedom) hareket takibi, haptic eldiven sistemleri ve reaktif yüzeyli zemin platformları yer almaktadır.\n\nVR deneyimi, yalnızca eğlence değil aynı zamanda psikolojik etkileşim, tepkisel öğrenme, teknolojik farkındalık ve simülasyon temelli karar alma üzerine kuruludur. Oyunlardan bağımsız olarak mimari gezintiler, sanal müzeler, eğitim senaryoları veya terapötik VR uygulamaları da bu alanın potansiyel kullanım alanları arasındadır.\n\nPadok\'un VR alanı, hem bireysel deneyimler hem de eş zamanlı çok oyunculu uygulamalarla zenginleştirilmiş içerikler sunar.'
        : 'The Virtual Reality area is equipped with experiences that combine visual, auditory, and spatial perception to make the user feel physically present in a digital world. The devices used here include high-resolution VR headsets, 6DoF (six degrees of freedom) motion tracking, haptic glove systems, and reactive surface floor platforms.\n\nThe VR experience is built not only on entertainment but also on psychological interaction, reactive learning, technological awareness, and simulation-based decision making. Architectural tours, virtual museums, educational scenarios, or therapeutic VR applications independent of games are also among the potential uses of this area.\n\nPadok\'s VR area offers content enriched with both individual experiences and simultaneous multiplayer applications.',
      longDescriptionKey: 'vr.longDescription',
      imageSrc: '/images/vr2.jpg',
    },
    {
      emoji: '💻',
      titleKey: language === 'tr' ? 'İnternet Kafe' : 'Internet Café',
      descriptionKey: language === 'tr'
        ? 'Çok yönlü dijital üretkenlik ve oyun performansı için optimize edilmiş altyapı.'
        : 'Infrastructure optimized for versatile digital productivity and gaming performance.',
      detailKey: language === 'tr'
        ? 'İnternet kafe bölümü, hem yüksek donanım gerektiren oyunlar hem de profesyonel dijital işler için tasarlanmış hibrit bir çalışma ve oyun alanıdır. Alan içerisinde son model ekran kartları, düşük gecikmeli monitörler, mekanik klavyeler ve yüksek çözünürlüklü kulaklıklar ile donatılmış sistemler bulunmaktadır.\n\nİnternet altyapısı, düşük ping ve yüksek veri transferi sağlayan özel ağ çözümleri ile desteklenmiştir. Bu sayede çevrimiçi oyunlarda gecikmesiz deneyim sağlanırken, profesyonel kullanıcılar için de remote çalışma, bulut bilişim, render alma ve ağ üzerinden veri aktarımı gibi ihtiyaçlar karşılanabilir.\n\nAlan, hem bireysel kullanıcıya hem de küçük gruplara özel oturumlar sunacak şekilde bölümlendirilmiştir. Günlük kullanımın yanı sıra turnuvalar, mini LAN partileri ya da hackathon gibi etkinliklere de ev sahipliği yapabilir.'
        : 'The internet café section is a hybrid work and gaming space designed for both high-hardware-requiring games and professional digital work. The area contains systems equipped with the latest model graphics cards, low-latency monitors, mechanical keyboards, and high-resolution headphones.\n\nThe internet infrastructure is supported by special network solutions that provide low ping and high data transfer. This ensures a lag-free experience in online games, while also meeting the needs of professional users such as remote working, cloud computing, rendering, and data transfer over the network.\n\nThe area is segmented to offer sessions specific to both individual users and small groups. In addition to daily use, it can also host events such as tournaments, mini LAN parties, or hackathons.',
      longDescriptionKey: 'internet.longDescription',
      imageSrc: '/images/pc2.jpg',
    },
    {
      emoji: '🗣️',
      titleKey: language === 'tr' ? 'Toplantı Salonları' : 'Meeting Rooms',
      descriptionKey: language === 'tr'
        ? 'İşlevselliği estetikle birleştiren, modüler ve teknoloji destekli toplantı ortamları.'
        : 'Modular and technology-supported meeting environments that combine functionality with aesthetics.',
      detailKey: language === 'tr'
        ? 'Toplantı salonları, çağdaş iş dünyasının gereksinimlerine uygun olarak tasarlanmış, akıllı ve esnek yapılar sunar. Alanlarda modüler masa sistemleri, kablosuz sunum sistemleri (BYOD – Bring Your Own Device destekli), yüksek çözünürlüklü projeksiyon sistemleri ve akustik yalıtımlı duvar yapıları yer alır.\n\nGirişimciler, startuplar, kurumlar ve akademik gruplar için uygun olan bu alanlar, hem küçük çaplı fikir geliştirme oturumları hem de büyük ölçekli planlama toplantıları için kullanılabilir. Rezervasyon sistemi üzerinden saatlik, günlük ya da uzun vadeli kullanım imkânı sunulmaktadır.\n\nSalonlarda ayrıca teknik destek, sunum ekipmanları, çevrim içi bağlantı için mikrofon ve kamera sistemleri, hızlı internet ve ikram hizmetleri gibi yan olanaklar da sağlanır.'
        : 'Meeting rooms offer smart and flexible structures designed to suit the needs of the contemporary business world. The areas feature modular table systems, wireless presentation systems (BYOD - Bring Your Own Device supported), high-resolution projection systems, and acoustically insulated wall structures.\n\nSuitable for entrepreneurs, startups, institutions, and academic groups, these areas can be used for both small-scale idea development sessions and large-scale planning meetings. Hourly, daily, or long-term usage opportunities are offered through the reservation system.\n\nThe halls also provide ancillary facilities such as technical support, presentation equipment, microphone and camera systems for online connections, fast internet, and catering services.',
      longDescriptionKey: 'meeting.longDescription',
      imageSrc: '/images/meet.jpg',
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className={`py-6 sm:py-8 px-3 sm:px-6 md:px-8 lg:px-12 ${isDark ? 'bg-very-dark-grey text-light-grey' : 'bg-very-light-grey text-dark-grey'}`}>
      <div className="container mx-auto">        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8 mt-2 text-[13px] sm:text-base"
          style={{
            gridAutoRows: "minmax(240px, auto)",
            alignItems: "stretch"
          }}
        >
          {servicesList.map((service, index) => (
            <ServiceCard 
              key={index}
              emoji={service.emoji}
              title={service.titleKey}
              description={service.descriptionKey}
              detail={service.detailKey}
              imageSrc={service.imageSrc}
              isDark={isDark}
              index={index}
            />
          ))}
        </motion.div>

        <div className="mt-12 sm:mt-16 md:mt-20 flex justify-center">
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={`h-0.5 sm:h-1 w-24 sm:w-32 rounded ${
              isDark ? 'bg-f1-red-bright' : 'bg-f1-red'
            }`}
          ></motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServicesContent;