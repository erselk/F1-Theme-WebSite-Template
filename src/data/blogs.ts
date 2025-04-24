export interface BlogPost {
  id: string;
  slug: string;
  coverImage: string; // Banner image for the blog post
  thumbnailImage: string; // Thumbnail for listings
  publishDate: string; // ISO date string
  author: {
    name: string;
    avatar?: string;
  };
  title: {
    tr: string;
    en: string;
  };
  excerpt: {
    tr: string;
    en: string;
  };
  content: {
    tr: string;
    en: string;
  };
  category: 'f1' | 'technology' | 'events' | 'interviews' | 'other';
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "f1-2025-season-started",
    coverImage: "/images/blog/about1.jpg",
    thumbnailImage: "/images/blog/about1.jpg",
    publishDate: new Date(2025, 2, 15).toISOString(), // March 15, 2025
    author: {
      name: "Ahmet Yılmaz",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🏎️ F1 2025 Sezonu Başladı: Yeni Araçlar ve Yeni Kurallar",
      en: "🏎️ F1 2025 Season Has Started: New Cars and New Rules"
    },
    excerpt: {
      tr: "2025 Formula 1 sezonu, hem teknik hem de sportif düzenlemelerdeki köklü değişikliklerle birlikte motor sporları dünyasında büyük heyecan yarattı.",
      en: "The 2025 Formula 1 season has created great excitement in the world of motorsports with radical changes in both technical and sporting regulations."
    },
    content: {
      tr: "🏎️ F1 2025 Sezonu Başladı: Yeni Araçlar ve Yeni Kurallar\n\n2025 Formula 1 sezonu, hem teknik hem de sportif düzenlemelerdeki köklü değişikliklerle birlikte motor sporları dünyasında büyük heyecan yarattı. FIA'nın karbon emisyonunu azaltmak amacıyla getirdiği yeni sürdürülebilir yakıt zorunluluğu, takımların motor tasarımlarını yeniden gözden geçirmesine yol açtı. Bu değişiklikler, yalnızca motor performansını değil, aracın genel aerodinamiğini ve sürüş karakteristiğini de doğrudan etkiliyor.\n\nYeni sezonda öne çıkan en dikkat çekici özelliklerden biri, araçların ön ve arka kanat tasarımlarında yapılan revizyonlar oldu. Daha düşük yere basma gücü sağlayan yeni konsept, geçişleri artırmak ve yarışları daha heyecanlı hale getirmek amacıyla tasarlandı. Bu düzenlemeler, özellikle orta sıra takımlarının rekabet gücünü artırdı. Alpine, Aston Martin ve Sauber gibi takımlar ilk yarışlardan itibaren dikkat çeken sonuçlara imza attı.\n\nAyrıca 2025 sezonu, genç yeteneklerin sahneye çıkışı açısından da önemli bir yıl oldu. Red Bull'un yeni pilotu Hiroshi Tanaka ve Mercedes'in genç yeteneği Lucas Moretti, ilk yarışlarda gösterdikleri performansla dikkatleri üzerine çekmeyi başardı. Takımlar artık sadece hız değil, aynı zamanda strateji ve lastik yönetimi konusunda da ciddi avantajlar elde etmek zorundalar. Bu da yarışların daha dinamik ve öngörülemez hale gelmesini sağladı.\n\nYıl boyunca takip edeceğimiz en büyük sorulardan biri: Ferrari bu yıl gerçekten şampiyonluk adayı mı? 2025 sezonu, uzun süredir beklenen o kırmızı rüyayı gerçeğe dönüştürebilecek mi?",
      en: "🏎️ F1 2025 Season Has Started: New Cars and New Rules\n\nThe 2025 Formula 1 season has created great excitement in the world of motorsports with radical changes in both technical and sporting regulations. The new sustainable fuel requirement introduced by the FIA to reduce carbon emissions has led teams to reconsider their engine designs. These changes directly affect not only engine performance but also the overall aerodynamics and driving characteristics of the car.\n\nOne of the most notable features of the new season was the revisions made to the front and rear wing designs of the cars. The new concept, which provides lower downforce, was designed to increase overtaking and make races more exciting. These regulations have especially increased the competitiveness of midfield teams. Teams like Alpine, Aston Martin, and Sauber have achieved remarkable results from the first races.\n\nThe 2025 season has also been an important year for young talents to take the stage. Red Bull's new driver Hiroshi Tanaka and Mercedes' young talent Lucas Moretti managed to attract attention with their performance in the first races. Teams now have to gain serious advantages not only in speed but also in strategy and tire management. This has made the races more dynamic and unpredictable.\n\nOne of the biggest questions we will follow throughout the year: Is Ferrari really a championship contender this year? Can the 2025 season turn that long-awaited red dream into reality?"
    },
    category: "f1"
  },
  {
    id: "2",
    slug: "whats-changed-in-esports-2025",
    coverImage: "/images/blog/about2.jpg",
    thumbnailImage: "/images/blog/about2.jpg",
    publishDate: new Date(2025, 3, 10).toISOString(),
    author: {
      name: "Ece Demir",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🎮 2025 E-spor Arenasında Neler Değişti?",
      en: "🎮 What's Changed in the 2025 Esports Arena?"
    },
    excerpt: {
      tr: "E-spor dünyası, 2025 yılında teknolojik ve organizasyonel anlamda büyük dönüşümler yaşadı.",
      en: "The esports world underwent significant technological and organizational transformations in 2025."
    },
    content: {
      tr: "🎮 2025 E-spor Arenasında Neler Değişti?\n\nE-spor dünyası, her yıl olduğu gibi 2025’te de hem teknolojik hem de organizasyonel anlamda önemli dönüşümler yaşadı. Artık sadece büyük turnuvalar değil, bölgesel ligler ve topluluk tabanlı etkinlikler de profesyonel oyuncuların kariyerlerini şekillendiriyor. Bu yılın en büyük farkı ise oyun motorlarında yapılan derin değişiklikler ve yapay zeka destekli analiz sistemlerinin devreye alınması oldu.\n\nRiot Games’in Valorant için getirdiği yeni \"Taktik Haritalar\" özelliği sayesinde koçlar artık maç sırasında takım yerleşimlerini anlık olarak takip edebiliyor ve önerilerde bulunabiliyor. Bu, strateji oyunlarının doğasına ciddi bir boyut kattı. Aynı şekilde Counter-Strike 2'nin yeni fizik motoru ve geliştirilmiş ses algoritması sayesinde, ses kasma teknikleri daha gerçekçi ve zorlayıcı hale geldi. Bu durum, oyuncuların reflekslerine ve karar alma süreçlerine doğrudan etki ediyor.\n\nBununla birlikte, organizasyonlar artık sadece başarıya değil, oyuncu sağlığına da yatırım yapıyor. 2025 yılında birçok takım kendi içinde psikolojik destek birimleri kurdu. Profesyonel oyuncuların tükenmişlik sendromu, anksiyete ve dikkat problemleriyle daha etkin bir şekilde başa çıkabilmeleri için özel eğitimler düzenleniyor. Bu değişim, e-sporun yalnızca rekabet değil, aynı zamanda sürdürülebilir bir kariyer alanı olduğunu kanıtlıyor.\n\nE-spor arenası büyümeye devam ediyor. Dünya genelinde düzenlenen turnuvaların izlenme oranları, geleneksel sporların bazı branşlarını geride bırakmış durumda. 2025 yılı, e-sporun artık \"geçici bir trend\" değil, kalıcı bir kültür olduğunu gösteren dönüm noktalarından biri olarak anılacak gibi görünüyor.",
      en: "🎮 What's Changed in the 2025 Esports Arena?\n\nThe esports world underwent significant technological and organizational transformations in 2025. Not only major tournaments but also regional leagues and community-based events are now shaping the careers of professional players. The biggest difference this year was the deep changes made to game engines and the introduction of AI-supported analysis systems.\n\nRiot Games' new \"Tactical Maps\" feature for Valorant allows coaches to track team placements in real-time during matches and provide suggestions. This has added a serious dimension to the nature of strategy games. Similarly, Counter-Strike 2's new physics engine and improved sound algorithms have made sound-based gameplay techniques more realistic and challenging. This directly affects players' reflexes and decision-making processes.\n\nAdditionally, organizations are now investing not only in success but also in player health. In 2025, many teams established psychological support units within their organizations. Special training sessions are being organized to help professional players deal more effectively with burnout syndrome, anxiety, and attention problems. This change proves that esports is not just about competition but also a sustainable career field.\n\nThe esports arena continues to grow. The viewership rates of tournaments held worldwide have surpassed some branches of traditional sports. The year 2025 seems to be remembered as one of the turning points that showed esports is no longer a \"temporary trend\" but a permanent culture."
    },
    category: "technology"
  },
  {
    id: "3",
    slug: "ferrari-2025-season-strong-start",
    coverImage: "/images/blog/about3.jpg",
    thumbnailImage: "/images/blog/about3.jpg",
    publishDate: new Date(2025, 3, 20).toISOString(),
    author: {
      name: "Ali Can",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🏁 Ferrari, 2025 Sezonuna Güçlü Başladı",
      en: "🏁 Ferrari Starts the 2025 Season Strong"
    },
    excerpt: {
      tr: "Ferrari, 2025 sezonuna SF-25 modeliyle muhteşem bir giriş yaptı.",
      en: "Ferrari made a spectacular start to the 2025 season with its SF-25 model."
    },
    content: {
      tr: "🏁 Ferrari, 2025 Sezonuna Güçlü Başladı\n\nYıllardır şampiyonluk hasreti çeken Ferrari, 2025 sezonuna muhteşem bir giriş yaptı. Yeni SF-25 model aracı, hem tasarımı hem de pist üzerindeki performansıyla büyük övgü topluyor. Takımın teknik direktörü Enrico Cardile liderliğindeki mühendislik ekibi, bu yıl aerodinamik verimliliği ve motor gücünü dengelemeyi başardı. Sezonun ilk üç yarışında Charles Leclerc ve Carlos Sainz podyumdan inmeyerek, Ferrari'nin bu yıl ciddi bir şampiyonluk adayı olduğunu kanıtladı.\n\nYeni kurallar çerçevesinde geliştirilen güç ünitesi, sürdürülebilir yakıtlarla uyumlu çalışmasının yanında, daha az enerji kaybı ve daha yüksek tork üretimi sunuyor. Bu da özellikle hızlanma ve viraj çıkışlarında Ferrari'ye büyük avantaj sağlıyor. Ayrıca, pit stop süreleri ortalaması 2.2 saniyeye kadar düşürülerek takımın stratejik üstünlüğü de artırıldı.\n\nFerrari’nin yükselişinde en dikkat çeken konulardan biri ise takım içi uyum. Leclerc ve Sainz, önceki sezonlara göre çok daha olgun bir işbirliği sergiliyor. Pilotların birbirine karşı olan saygısı ve takım oyununa bağlılıkları, bu sezon Ferrari'nin en büyük silahlarından biri olabilir.\n\nPeki bu yükseliş sürdürülebilir mi? Red Bull ve Mercedes gibi rakiplerin henüz tüm kozlarını oynamadığı düşünüldüğünde sezon ilerledikçe işler daha da karışabilir. Ancak Ferrari taraftarları, uzun süredir bekledikleri o unutulmaz sezonun 2025 yılı olabileceğine şimdiden inanmaya başladı.",
      en: "🏁 Ferrari Starts the 2025 Season Strong\n\nAfter years of longing for a championship, Ferrari made a spectacular start to the 2025 season. The new SF-25 model car has received great praise for both its design and on-track performance. The engineering team, led by Technical Director Enrico Cardile, managed to balance aerodynamic efficiency and engine power this year. In the first three races of the season, Charles Leclerc and Carlos Sainz consistently finished on the podium, proving that Ferrari is a serious championship contender this year.\n\nThe power unit developed under the new regulations not only works in harmony with sustainable fuels but also offers less energy loss and higher torque production. This provides Ferrari with a significant advantage, especially in acceleration and corner exits. Additionally, the average pit stop times have been reduced to 2.2 seconds, further enhancing the team's strategic superiority.\n\nOne of the most notable aspects of Ferrari's rise is team harmony. Leclerc and Sainz are demonstrating a much more mature collaboration compared to previous seasons. The mutual respect and commitment to teamwork among the drivers could be one of Ferrari's biggest weapons this season.\n\nBut can this rise be sustained? Considering that rivals like Red Bull and Mercedes have yet to play all their cards, things could get even more complicated as the season progresses. However, Ferrari fans are already beginning to believe that 2025 could be the unforgettable season they've been waiting for."
    },
    category: "f1"
  },
  {
    id: "4",
    slug: "valorant-masters-tokyo-2025",
    coverImage: "/images/blog/about4.jpg",
    thumbnailImage: "/images/blog/about4.jpg",
    publishDate: new Date(2025, 4, 5).toISOString(),
    author: {
      name: "Deniz Kaya",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🕹️ Valorant Masters Tokyo 2025'te Sürpriz Sonuçlar",
      en: "🕹️ Surprising Results at Valorant Masters Tokyo 2025"
    },
    excerpt: {
      tr: "Valorant Masters Tokyo 2025 turnuvası, beklentilerin çok ötesinde sonuçlara sahne oldu.",
      en: "The Valorant Masters Tokyo 2025 tournament delivered results far beyond expectations."
    },
    content: {
      tr: "🕹️ Valorant Masters Tokyo 2025'te Sürpriz Sonuçlar\n\nValorant Masters Tokyo 2025 turnuvası, beklentilerin çok ötesinde sonuçlara sahne oldu. Turnuvaya favori olarak gelen takımlar arasında Fnatic, DRX ve Paper Rex vardı. Ancak grup aşamasından itibaren denklemler değişmeye başladı. Özellikle Güneydoğu Asya temsilcisi Talon Esports’un gösterdiği performans, otoriteleri bile şaşırttı.\n\nTalon, grup aşamasında favori takımları geride bırakırken, koçlarının yenilikçi ajan seçimleri ve agresif oyun planları dikkat çekti. Brimstone’un yeniden meta haline gelmesi ve Phoenix gibi uzun süredir kullanılmayan ajanların sürpriz şekilde tercih edilmesi, rakipleri hazırlıksız yakaladı. Turnuvanın en dikkat çekici oyuncusu ise Türk oyuncu \"kzr\" oldu. Finalde attığı clutch ile takımını zafere taşıyan kzr, turnuvanın MVP’si seçildi.\n\nTokyo sahnesi, hem seyirci yoğunluğu hem de görsel sunum açısından Valorant turnuva tarihinin en iddialı organizasyonlarından biri olarak kayıtlara geçti. Riot Games’in sahne tasarımı, sanal gerçeklik destekli anlatımları ve LED gösterileri büyük beğeni topladı. Tüm bu detaylar, Valorant’ın e-spor arenasındaki konumunu daha da sağlamlaştırdı.\n\n2025 Masters Tokyo, yalnızca yeni bir şampiyon değil, aynı zamanda metanın ve taktiksel düşüncenin ne kadar hızlı değişebileceğini gösteren bir okul oldu. Özellikle bölgesel takımların yükselişi, global sahnenin artık çok daha rekabetçi ve öngörülemez olduğunu kanıtladı.",
      en: "🕹️ Surprising Results at Valorant Masters Tokyo 2025\n\nThe Valorant Masters Tokyo 2025 tournament delivered results far beyond expectations. Among the favorites were Fnatic, DRX, and Paper Rex. However, the dynamics began to shift from the group stage onward. Particularly, the performance of Southeast Asian representative Talon Esports surprised even the experts.\n\nTalon outperformed the favorite teams in the group stage, with their coach's innovative agent picks and aggressive game plans drawing attention. The resurgence of Brimstone in the meta and the surprising use of agents like Phoenix, who had been out of favor for a long time, caught opponents off guard. The tournament's standout player was Turkish player \"kzr,\" who secured victory for his team with a clutch play in the final and was named the tournament MVP.\n\nThe Tokyo stage was recorded as one of the most ambitious events in Valorant tournament history in terms of both audience density and visual presentation. Riot Games' stage design, VR-supported storytelling, and LED displays received great acclaim. All these details further solidified Valorant's position in the esports arena.\n\nThe 2025 Masters Tokyo was not just about crowning a new champion but also served as a lesson on how quickly the meta and tactical thinking can evolve. The rise of regional teams proved that the global stage is now much more competitive and unpredictable."
    },
    category: "events"
  },
  {
    id: "5",
    slug: "red-bulls-new-star-hiroshi-tanaka",
    coverImage: "/images/blog/about5.jpg",
    thumbnailImage: "/images/blog/about5.jpg",
    publishDate: new Date(2025, 4, 15).toISOString(),
    author: {
      name: "Mehmet Aksoy",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🏆 Red Bull’un Yeni Yıldızı: Japon Pilot Hiroshi Tanaka",
      en: "🏆 Red Bull's New Star: Japanese Driver Hiroshi Tanaka"
    },
    excerpt: {
      tr: "Red Bull Racing, 2025 sezonuna genç yetenek Hiroshi Tanaka ile girdi.",
      en: "Red Bull Racing entered the 2025 season with young talent Hiroshi Tanaka."
    },
    content: {
      tr: "🏆 Red Bull’un Yeni Yıldızı: Japon Pilot Hiroshi Tanaka\n\nFormula 1’in dinamosu Red Bull Racing, 2025 sezonuna önemli bir genç yetenekle girdi: Hiroshi Tanaka. Daha önce Formula 2’de adından sıkça söz ettiren Tanaka, agresif sürüş stili ve soğukkanlı yarış zekâsıyla takım patronu Christian Horner’ın dikkatini çekmişti. Bu yıl ise AlphaTauri’den Red Bull’a transfer edilerek, Max Verstappen’in takım arkadaşı oldu.\n\nTanaka’nın ilk yarışlardaki performansı, beklentileri fazlasıyla karşıladı. Özellikle Bahreyn GP’sinde yağmurlu pistte yaptığı geçişler, sadece yarışseverleri değil, rakip takımların mühendislerini bile etkiledi. Henüz ilk sezonunda sıralama turlarında gösterdiği yüksek tempo, onun yalnızca bir destek sürücüsü değil, geleceğin şampiyon adayı olduğunu gösteriyor.\n\nRed Bull’un genç sürücü programı yıllardır başarılı sonuçlar veriyor. Ancak Tanaka, farklı bir seviyeyi temsil ediyor. Teknik geri bildirimleri, takım içindeki uyumu ve medya karşısındaki olgun tavırları, onun çok yönlü bir sporcu olduğunu kanıtlıyor. Max Verstappen ile olan ilişkisinin ilerleyen dönemde nasıl evrileceği ise sezonun en çok merak edilen konularından biri.\n\nRed Bull’un bu yılki hedefi sadece Takımlar Şampiyonluğu değil. Tanaka’nın gelişimi, takımın gelecek planlarının merkezinde yer alıyor. Belki de uzun yıllar sonra ilk kez Verstappen’in takım içi gerçek bir rakibi olabilir.",
      en: "🏆 Red Bull's New Star: Japanese Driver Hiroshi Tanaka\n\nRed Bull Racing, the dynamo of Formula 1, entered the 2025 season with a significant young talent: Hiroshi Tanaka. Previously making a name for himself in Formula 2, Tanaka caught the attention of team principal Christian Horner with his aggressive driving style and composed race intelligence. This year, he was promoted from AlphaTauri to Red Bull, becoming Max Verstappen's teammate.\n\nTanaka's performance in the first races exceeded expectations. Particularly at the Bahrain GP, his overtakes on a rainy track impressed not only fans but also rival team engineers. In his debut season, his high pace during qualifying sessions demonstrated that he is not just a support driver but a future championship contender.\n\nRed Bull's young driver program has delivered successful results for years. However, Tanaka represents a different level. His technical feedback, team harmony, and mature demeanor in front of the media prove that he is a well-rounded athlete. How his relationship with Max Verstappen evolves over time is one of the most intriguing questions of the season.\n\nRed Bull's goal this year is not just the Constructors' Championship. Tanaka's development is at the center of the team's future plans. For the first time in years, Verstappen might have a genuine rival within the team."
    },
    category: "f1"
  },
  {
    id: "6",
    slug: "cs2-new-meta-smg-utility",
    coverImage: "/images/blog/about6.jpg",
    thumbnailImage: "/images/blog/about6.jpg",
    publishDate: new Date(2025, 5, 1).toISOString(),
    author: {
      name: "Editor",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🎯 CS2’de Yeni Meta: SMG ve Utility Ağırlıklı Oyunlar",
      en: "🎯 CS2's New Meta: SMG and Utility-Focused Gameplay"
    },
    excerpt: {
      tr: "Counter-Strike 2, 2025 yılına girerken yayınladığı büyük yama ile oyunun dinamiklerini kökten değiştirdi.",
      en: "Counter-Strike 2 revolutionized its dynamics with a major patch entering 2025."
    },
    content: {
      tr: "🎯 CS2’de Yeni Meta: SMG ve Utility Ağırlıklı Oyunlar\n\nCounter-Strike 2, 2025 yılına girerken yayınladığı büyük yama ile oyunun dinamiklerini kökten değiştirdi. Artık SMG (Submachine Gun) silahları, oyunun erken safhalarında çok daha etkili hale geldi. Özellikle MP9 ve MAC-10 gibi silahlar, düşük ekonomi dönemlerinde klasik tabanca tercihlerinin önüne geçti.\n\nBunun yanında utility kullanımı da evrim geçirdi. Yeni yama ile birlikte flaş ve molotofların etki alanları yeniden hesaplandı. Bu değişiklikler, oyuncuların pozisyon alma stratejilerini ve giriş taktiklerini tamamen dönüştürdü. Artık round başlarında geleneksel \"rush B\" planları yerine, yavaş ve utility odaklı oyunlar daha yaygın. Bu durum, oyun içinde takım koordinasyonunun ve iletişimin önemini artırdı.\n\nProfesyonel sahnede bu değişikliklere en hızlı adapte olan takımlar öne çıktı. NAVI, FaZe ve G2 gibi organizasyonlar, stratejik koçlarını teknik analiz departmanlarıyla birleştirerek yapay zeka destekli veri analiz sistemlerine geçti. Artık oyuncuların harita içindeki hareketleri, ısı haritaları üzerinden analiz edilerek optimum stratejiler geliştiriliyor.\n\nBu değişimler sadece rekabetçi oyunu değil, izleyici deneyimini de etkiledi. Oyunun temposu artarken, bireysel performanstan çok takım oyununa dayalı senaryolar daha fazla öne çıkıyor. CS2, bu yeni dönemiyle birlikte klasik FPS deneyimini korurken, modern strateji oyunlarının analiz gücünü bünyesine katıyor.",
      en: "🎯 CS2's New Meta: SMG and Utility-Focused Gameplay\n\nCounter-Strike 2 revolutionized its dynamics with a major patch entering 2025. SMG (Submachine Gun) weapons have become much more effective in the early stages of the game. Especially weapons like MP9 and MAC-10 have surpassed traditional pistol choices during low-economy rounds.\n\nAdditionally, utility usage has evolved. With the new patch, the impact areas of flashbangs and molotovs have been recalculated. These changes have completely transformed players' positioning strategies and entry tactics. Now, instead of traditional \"rush B\" plans at the start of rounds, slow and utility-focused gameplay is more common. This has increased the importance of team coordination and communication in the game.\n\nTeams that adapted quickly to these changes in the professional scene stood out. Organizations like NAVI, FaZe, and G2 have integrated their strategic coaches with technical analysis departments and transitioned to AI-supported data analysis systems. Now, players' movements within the map are analyzed through heat maps to develop optimal strategies.\n\nThese changes have not only affected competitive gameplay but also the viewer experience. While the game's pace has increased, scenarios based on team play rather than individual performance have become more prominent. With this new era, CS2 preserves the classic FPS experience while incorporating the analytical power of modern strategy games."
    },
    category: "technology"
  },
  {
    id: "7",
    slug: "f1-2025-telemetry-systems",
    coverImage: "/images/blog/about7.jpg",
    thumbnailImage: "/images/blog/about7.jpg",
    publishDate: new Date(2025, 5, 15).toISOString(),
    author: {
      name: "Ahmet Yılmaz",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "⚙️ F1 2025'te Teknolojinin Rolü: Yeni Nesil Telemetri Sistemleri",
      en: "⚙️ The Role of Technology in F1 2025: Next-Gen Telemetry Systems"
    },
    excerpt: {
      tr: "Formula 1, telemetri sistemlerinde devrim niteliğinde yenilikler sunuyor.",
      en: "Formula 1 offers revolutionary innovations in telemetry systems."
    },
    content: {
      tr: "⚙️ F1 2025'te Teknolojinin Rolü: Yeni Nesil Telemetri Sistemleri\n\nFormula 1, her zaman teknolojik gelişmelerin öncüsü olmuştur. Ancak 2025 sezonuyla birlikte telemetri sistemlerinde devrim niteliğinde yenilikler yapıldı. Artık sadece araç üzerindeki 300'den fazla sensörle değil, sürücünün vücut hareketlerini ve biyometrik verilerini de gerçek zamanlı analiz eden sistemler kullanılmakta. Bu sayede sürücünün kalp atışı, stres seviyesi ve kas tepkileri bile yarış stratejisine dahil edilebiliyor.\n\nMercedes-AMG Petronas, bu yeni sistemleri en aktif kullanan takımların başında geliyor. Yeni geliştirilen \"Smart Helmet\" (Akıllı Kask) sayesinde Lewis Hamilton'ın vücut verileri, direksiyon üstü ekranlara ve pit duvarına anlık olarak yansıtılıyor. Bu bilgiler ışığında takım, hangi turda pit yapılacağına, ne zaman atak yapılacağına ya da sürücünün daha sakin bir modda mı yarıştığına karar verebiliyor.\n\nAyrıca takımlar arasında yapay zeka tabanlı yarış simülasyonları da yaygınlaşmış durumda. Örneğin Ferrari, her yarıştan önce rakiplerinin ortalama lastik aşınma verilerini kullanarak olası yarış senaryolarını simüle ediyor ve buna göre strateji geliştiriyor. Bu, yarış öncesi yapılan hazırlıkların sadece insan analizleriyle değil, aynı zamanda yüksek doğrulukta algoritmalarla desteklendiği anlamına geliyor.\n\nKısacası F1 artık sadece hız ve yetenek değil, veri, analiz ve algoritmaların savaşı. 2025 sezonu, teknolojinin pist üstünde yarattığı farkı en net görebileceğimiz sezonlardan biri olmaya aday.",
      en: "⚙️ The Role of Technology in F1 2025: Next-Gen Telemetry Systems\n\nFormula 1 has always been at the forefront of technological advancements. However, with the 2025 season, revolutionary innovations have been made in telemetry systems. Now, systems are being used that analyze not only with more than 300 sensors on the car but also the driver's body movements and biometric data in real-time. This allows the driver's heart rate, stress level, and muscle reactions to be incorporated into race strategy.\n\nMercedes-AMG Petronas is among the teams most actively using these new systems. Thanks to the newly developed \"Smart Helmet,\" Lewis Hamilton's body data is instantly projected onto steering wheel displays and the pit wall. With this information, the team can decide which lap to pit, when to attack, or whether the driver is racing in a calmer mode.\n\nAI-based race simulations have also become widespread among teams. For example, Ferrari simulates possible race scenarios using their competitors' average tire wear data before each race and develops strategies accordingly. This means that pre-race preparations are supported not only by human analysis but also by high-accuracy algorithms.\n\nIn short, F1 is now not just a battle of speed and talent but also of data, analysis, and algorithms. The 2025 season is a candidate to be one of the seasons where we can most clearly see the difference technology creates on the track."
    },
    category: "f1"
  },
  {
    id: "8",
    slug: "league-of-legends-2025-meta-report",
    coverImage: "/images/blog/about8.jpg",
    thumbnailImage: "/images/blog/about8.jpg",
    publishDate: new Date(2025, 5, 20).toISOString(),
    author: {
      name: "Deniz Kaya",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🎮 MOBA Dünyasında Dev Değişim: League of Legends 2025 Meta Raporu",
      en: "🎮 Massive Change in the MOBA World: League of Legends 2025 Meta Report"
    },
    excerpt: {
      tr: "Riot Games'in getirdiği yeniliklerle League of Legends oynanış sistemi tamamen evrildi.",
      en: "League of Legends gameplay has completely evolved with the innovations brought by Riot Games."
    },
    content: {
      tr: "🎮 MOBA Dünyasında Dev Değişim: League of Legends 2025 Meta Raporu\n\nLeague of Legends (LoL), 2025 yılına büyük bir yama ile girdi. Riot Games'in getirdiği yeni sistemsel değişiklikler ile hem dereceli maçlar hem de profesyonel sahnede oynanış ciddi anlamda evrildi. Özellikle ejder güçlerinin yeniden yapılandırılması ve harita dinamiklerinin daha değişken hale gelmesi, oyuna stratejik derinlik kattı.\n\nYeni sistemde, her maç başında oyuncuların \"ön tahmin\" yaparak hangi ejder türlerinin geleceğini sezgisel olarak analiz etmeleri gerekiyor. Bu, takım kompozisyonlarını seçerken sadece şampiyon eşleşmeleri değil, aynı zamanda harita uyumu da düşünülmesi anlamına geliyor. Örneğin Hextech ejderlerinin ağırlıklı olduğu bir haritada yüksek hareket kabiliyetli şampiyonlar tercih ediliyor.\n\nOrman rolünde yapılan değişiklikler de metayı kökten etkiledi. Artık kampların sıralı doğmaması, ormancıların oyun içi karar alma süreçlerini doğrudan etkiliyor. Bu durum, özellikle rekabetçi maçlarda erken baskınları daha tahmin edilemez hale getiriyor. 2025 meta raporlarında Elise, Nocturne ve Kindred gibi mobil ormancıların yeniden meta haline geldiği görülüyor.\n\nProfesyonel sahnede ise LCK ve LPL gibi liglerde yaratıcı seçimler öne çıkmaya başladı. Mid lane K'Sante, support Ahri gibi sıra dışı tercihlerle gelen zaferler, metanın hâlâ oyuncu zekâsı ve adaptasyonu ile şekillendiğini gösteriyor. 2025 sezonu, LoL'ün artık ezberlerin bozulduğu, tamamen senaryo tabanlı bir strateji oyununa dönüştüğünün kanıtı niteliğinde.",
      en: "🎮 Massive Change in the MOBA World: League of Legends 2025 Meta Report\n\nLeague of Legends (LoL) entered 2025 with a major patch. With the new systemic changes brought by Riot Games, gameplay has significantly evolved in both ranked matches and on the professional stage. Particularly, the restructuring of dragon powers and the map dynamics becoming more variable have added strategic depth to the game.\n\nIn the new system, players need to make \"pre-predictions\" at the beginning of each match to intuitively analyze which types of dragons will appear. This means considering not just champion matchups but also map compatibility when selecting team compositions. For example, champions with high mobility are preferred on maps dominated by Hextech dragons.\n\nChanges in the jungle role have also fundamentally affected the meta. The non-sequential spawning of camps now directly impacts junglers' in-game decision-making processes. This makes early invasions more unpredictable, especially in competitive matches. The 2025 meta reports show that mobile junglers like Elise, Nocturne, and Kindred have become meta again.\n\nOn the professional stage, creative picks have started to stand out in leagues like LCK and LPL. Victories with unusual choices like mid lane K'Sante and support Ahri show that the meta is still shaped by player intelligence and adaptation. The 2025 season proves that LoL has transformed into a completely scenario-based strategy game where established patterns are broken."
    },
    category: "technology"
  },
  {
    id: "9",
    slug: "las-vegas-gp-f1-2025",
    coverImage: "/images/blog/about9.jpg",
    thumbnailImage: "/images/blog/about9.jpg",
    publishDate: new Date(2025, 6, 1).toISOString(),
    author: {
      name: "Ali Can",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🏎️ Las Vegas GP: F1'in Yeni Işıltılı Sahnesi",
      en: "🏎️ Las Vegas GP: F1's New Glittering Stage"
    },
    excerpt: {
      tr: "Las Vegas Grand Prix, 2025 sezonunun en gösterişli ve teknik yarışı oldu.",
      en: "The Las Vegas Grand Prix became the most spectacular and technical race of the 2025 season."
    },
    content: {
      tr: "🏎️ Las Vegas GP: F1'in Yeni Işıltılı Sahnesi\n\n2025 sezonunun en çok beklenen yarışlarından biri olan Las Vegas Grand Prix, sadece bir yarış değil, aynı zamanda tam anlamıyla bir gösteriye dönüştü. Strip boyunca kurulan gece pisti, F1 tarihindeki en görkemli sahnelerden birine ev sahipliği yaptı. Tüm takımlar, yarış öncesinde özel tasarımlı gece renkli araçlarıyla podyuma çıktı ve bu da görsel olarak izleyicilere adeta bir gala gecesi sundu.\n\nAncak sadece şov değil, pist tasarımı da büyük övgü aldı. Hızlı düzlüklerin keskin virajlarla birleştiği bu pist, sürücülerden maksimum konsantrasyon ve teknik beceri talep ediyor. Özellikle 14. virajdaki ani fren noktası, birçok geçiş manevrasının kilit noktası haline geldi. Burada yapılan hatalar, yarışın kaderini belirleyecek kadar önemli hale geliyor.\n\nLas Vegas GP aynı zamanda takım stratejilerinin sınandığı bir yarış oldu. Pist sıcaklığı, gece olmasına rağmen oldukça yüksekti ve bu durum lastik stratejilerini doğrudan etkiledi. Takımlar iki pit stop stratejisi ile yarışa başladılar ancak birçoğu yarış içinde üç pit'e geçmek zorunda kaldı. Bu da gerçek zamanlı karar almanın ve lastik yönetiminin önemini bir kez daha gösterdi.\n\nYarış sonunda podyumda Verstappen, Leclerc ve Tanaka vardı. Ancak asıl kazanan F1'in küresel marka değeri oldu. Las Vegas GP, Formula 1'in sporun ötesine geçen bir deneyim olduğunu kanıtladı.",
      en: "🏎️ Las Vegas GP: F1's New Glittering Stage\n\nThe Las Vegas Grand Prix, one of the most anticipated races of the 2025 season, transformed into not just a race but a complete spectacle. The night circuit set up along the Strip hosted one of the most magnificent stages in F1 history. All teams presented themselves on the podium with specially designed night-colored cars before the race, providing viewers with what felt like a gala evening.\n\nBut it wasn't just about the show; the track design also received great praise. This track, where fast straights combine with sharp corners, demands maximum concentration and technical skill from drivers. Especially the sudden braking point at Turn 14 has become a key point for many overtaking maneuvers. Mistakes made here become important enough to determine the fate of the race.\n\nThe Las Vegas GP was also a race where team strategies were tested. The track temperature was quite high despite being at night, and this directly affected tire strategies. Teams started the race with a two-pit stop strategy, but many had to switch to three pits during the race. This once again showed the importance of real-time decision making and tire management.\n\nAt the end of the race, Verstappen, Leclerc, and Tanaka were on the podium. However, the real winner was F1's global brand value. The Las Vegas GP proved that Formula 1 is an experience that goes beyond sports."
    },
    category: "f1"
  },
  {
    id: "10",
    slug: "f1-2025-power-units-honda-returns",
    coverImage: "/images/blog/about10.jpg",
    thumbnailImage: "/images/blog/about10.jpg",
    publishDate: new Date(2025, 6, 10).toISOString(),
    author: {
      name: "Mehmet Aksoy",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🔧 F1 2025'te Güç Üniteleri Savaşları: Honda Geri Döndü!",
      en: "🔧 Power Unit Wars in F1 2025: Honda Returns!"
    },
    excerpt: {
      tr: "Honda'nın Red Bull ile yeniden tam zamanlı ortaklığı, güç üniteleri rekabetini kızıştırdı.",
      en: "Honda's new full-time partnership with Red Bull has intensified the power unit competition."
    },
    content: {
      tr: "🔧 F1 2025'te Güç Üniteleri Savaşları: Honda Geri Döndü!\n\n2025 sezonu Formula 1 için sadece yeni bir takvim değil, aynı zamanda güç ünitelerinde dev bir rekabetin başlangıcı oldu. Honda'nın Red Bull ile yeniden tam zamanlı bir ortaklık kurmasıyla birlikte, güç üniteleri savaşında dengeler değişti. Mercedes, Ferrari ve Renault'nun yanında şimdi Honda da performans açısından söz sahibi bir oyuncu.\n\nHonda'nın 2025 için geliştirdiği hibrit sistem, özellikle enerji geri kazanımında sektördeki en verimli sistem olarak gösteriliyor. Red Bull'un bu teknoloji sayesinde düzlüklere çıkışlarda elde ettiği ivme farkı, yarışların kaderini belirliyor. Ayrıca Honda motorlarının dayanıklılık açısından gösterdiği gelişim, sezonun ilk beş yarışında motor değişimi gerektirmeyen tek üretici olmalarını sağladı.\n\nDiğer yandan Mercedes de boş durmadı. Yeni termal verimlilik oranı %52'ye ulaşan güç ünitesiyle, yakıt tüketimini optimize etmeyi başardı. Ferrari ise yüksek devirlerdeki tork üretimiyle dikkat çekerken, Renault hâlâ istikrar sorunları yaşıyor.\n\nTakımlar, motor haritalarını artık yapay zeka destekli analizlerle yarış anında değiştirebiliyor. Bu, stratejilerin sadece pit duvarından değil, araç içinden bile şekillenebildiği anlamına geliyor. Güç ünitesi rekabeti, 2025 sezonunun hem mühendislik hem de yarış içi dinamikler açısından en belirleyici unsuru oldu.",
      en: "🔧 Power Unit Wars in F1 2025: Honda Returns!\n\nThe 2025 season for Formula 1 marks not just a new calendar but also the beginning of a massive competition in power units. With Honda establishing a renewed full-time partnership with Red Bull, the balance in the power unit war has changed. Alongside Mercedes, Ferrari, and Renault, Honda is now also a significant player in terms of performance.\n\nHonda's hybrid system developed for 2025 is shown as the most efficient system in the industry, especially in energy recovery. The acceleration difference that Red Bull achieves when exiting onto straights thanks to this technology determines the fate of races. Additionally, the durability improvements shown by Honda engines have made them the only manufacturer not requiring an engine change in the first five races of the season.\n\nMeanwhile, Mercedes hasn't been idle. With its new power unit reaching a thermal efficiency ratio of 52%, they've managed to optimize fuel consumption. Ferrari stands out with its torque production at high revs, while Renault is still experiencing stability issues.\n\nTeams can now change their engine maps during races with AI-supported analyses. This means that strategies can be shaped not only from the pit wall but even from inside the car. Power unit competition has become the most decisive factor of the 2025 season in terms of both engineering and race dynamics."
    },
    category: "f1"
  },
  {
    id: "11",
    slug: "next-gen-esports-broadcasting-2025",
    coverImage: "/images/blog/about11.jpg",
    thumbnailImage: "/images/blog/about11.jpg",
    publishDate: new Date(2025, 6, 15).toISOString(),
    author: {
      name: "Ece Demir",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "👾 Espor'da Yeni Nesil Yayın Deneyimi: İnteraktif İzleyici Modları",
      en: "👾 Next-Gen Broadcasting Experience in Esports: Interactive Viewer Modes"
    },
    excerpt: {
      tr: "Espor yayıncılığı, izleyiciyi pasif seyirciden oyunun aktif bir parçasına dönüştürüyor.",
      en: "Esports broadcasting transforms viewers from passive spectators to active participants in the game."
    },
    content: {
      tr: "👾 Espor'da Yeni Nesil Yayın Deneyimi: İnteraktif İzleyici Modları\n\n2025 yılı itibarıyla espor yayıncılığı devrim niteliğinde bir değişim yaşadı. Twitch, YouTube Gaming ve TikTok Live gibi platformlar artık izleyicilere sadece maç izleme değil, maçın bir parçası olma deneyimi sunuyor. \"İnteraktif İzleyici Modları\" sayesinde kullanıcılar, canlı yayın sırasında oyuncuların ekranları arasında geçiş yapabiliyor, istedikleri oyuncunun anlık istatistiklerini görebiliyor ve hatta yayıncıyla anlık mini oyunlara katılabiliyorlar.\n\nValorant, League of Legends ve CS2 gibi oyunlarda bu sistem, seyirci etkileşimini katladı. Riot Games'in geliştirdiği LoL Arena Viewer ile artık izleyiciler, haritada hangi oyuncunun görüş alanında olduğunu, cooldown sürelerini ve eşyaların ne zaman alınacağını gerçek zamanlı olarak takip edebiliyor. Bu, sadece izleme deneyimini değil, esporun eğitim yönünü de güçlendirdi.\n\nEspor kulüpleri bu teknolojiyi taraftar etkileşimi için de kullanıyor. Maç esnasında yapılan interaktif oylamalar ile \"MVP sen seç\", \"Bir sonraki ajan kim olmalı?\" gibi kararlar izleyiciye bırakılıyor. Bu sayede taraftar, takımın bir parçası gibi hissediyor.\n\nBu gelişmeler, esporun geleneksel sporlardan ayrıştığı noktayı net bir şekilde ortaya koyuyor. Seyircinin pasif değil, aktif bir oyuncu olduğu bir çağdayız. 2025, bu dönüşümün miladı olabilir.",
      en: "👾 Next-Gen Broadcasting Experience in Esports: Interactive Viewer Modes\n\nAs of 2025, esports broadcasting has undergone a revolutionary change. Platforms like Twitch, YouTube Gaming, and TikTok Live now offer viewers not just match-watching experiences but the experience of being part of the match. Thanks to \"Interactive Viewer Modes,\" users can switch between players' screens during live broadcasts, see real-time statistics of any player they want, and even participate in instant mini-games with the broadcaster.\n\nIn games like Valorant, League of Legends, and CS2, this system has multiplied viewer engagement. With Riot Games' LoL Arena Viewer, viewers can now track in real-time which player is in vision on the map, cooldown times, and when items will be purchased. This has strengthened not only the viewing experience but also the educational aspect of esports.\n\nEsports clubs are also using this technology for fan engagement. Interactive polls during matches leave decisions like \"You pick the MVP\" or \"Who should be the next agent?\" to the viewers. This makes fans feel like they are part of the team.\n\nThese developments clearly show the point where esports diverges from traditional sports. We are in an era where the spectator is not passive but an active player. 2025 could be the milestone of this transformation."
    },
    category: "technology"
  },
  {
    id: "12",
    slug: "f1-2025-strategy-trends",
    coverImage: "/images/blog/about12.jpg",
    thumbnailImage: "/images/blog/about12.jpg",
    publishDate: new Date(2025, 7, 1).toISOString(),
    author: {
      name: "Ali Can",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🏁 F1 2025 Strateji Trendleri: Artık Sadece Hız Yetmiyor",
      en: "🏁 F1 2025 Strategy Trends: Speed Alone Is No Longer Enough"
    },
    excerpt: {
      tr: "Formula 1'de kazananı belirleyen sadece hız değil, artık stratejik derinlik.",
      en: "In Formula 1, what determines the winner is not just speed but strategic depth."
    },
    content: {
      tr: "🏁 F1 2025 Strateji Trendleri: Artık Sadece Hız Yetmiyor\n\nFormula 1'de 2025 sezonu, taktiksel derinliğin zirveye ulaştığı bir dönem olarak kayda geçti. Artık kazananlar sadece hızlı olanlar değil, aynı zamanda en doğru stratejiyi kuranlar oluyor. Bu sezonun öne çıkan stratejik farkı: mikro pit stop planlaması ve yarış içi senaryo simülasyonları.\n\nFerrari, yarıştan önce tüm olası hava değişimleri ve güvenlik aracı ihtimallerine karşı 500 farklı senaryo çalışıyor. Bu senaryolara göre araç setupları da değişken olarak hazırlanıyor. Örneğin olası bir ilk tur kazası planı için, düşük sıcaklıkta çalışan lastik seti hazır bulunduruluyor.\n\nAston Martin ise pilotlarının yarış içi karar alma yeteneklerini artırmak adına \"Yapay Stratejist Asistanı\" kullanmaya başladı. Bu sistem, yarış sırasında pit duvarına ve pilota anlık öneriler sunarak en verimli hamlenin zamanlamasını bildiriyor. Yani pilotun yanında artık bir yapay zeka yarışıyor.\n\n2025 yılında bir yarışı kazanmak için gereken şey sadece iyi bir araç değil; algoritmalar, hava tahmin modelleri, sürücü davranış simülasyonları ve ekip içi iletişim de kazananın belirlenmesinde büyük rol oynuyor.",
      en: "🏁 F1 2025 Strategy Trends: Speed Alone Is No Longer Enough\n\nThe 2025 season in Formula 1 has been recorded as a period where tactical depth reached its peak. Now, winners are not just those who are fast but also those who establish the most correct strategy. The standout strategic difference this season: micro pit stop planning and in-race scenario simulations.\n\nFerrari works on 500 different scenarios against all possible weather changes and safety car possibilities before a race. Car setups are also prepared variably according to these scenarios. For example, a tire set that works at low temperatures is kept ready for a possible first lap accident plan.\n\nAston Martin has started using an \"Artificial Strategist Assistant\" to enhance their drivers' in-race decision-making abilities. This system notifies the pit wall and the driver of the timing of the most efficient move by offering real-time suggestions during the race. So, an artificial intelligence is now racing alongside the driver.\n\nWhat it takes to win a race in 2025 is not just a good car; algorithms, weather prediction models, driver behavior simulations, and team communication also play a major role in determining the winner."
    },
    category: "f1"
  },
  {
    id: "13",
    slug: "esports-psychology-mental-health",
    coverImage: "/images/blog/about13.jpg",
    thumbnailImage: "/images/blog/about13.jpg",
    publishDate: new Date(2025, 7, 10).toISOString(),
    author: {
      name: "Deniz Kaya",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🕶️ E-spor Psikolojisi: Zihinsel Sağlık Artık Sahada",
      en: "🕶️ Esports Psychology: Mental Health Now in the Field"
    },
    excerpt: {
      tr: "Profesyonel oyuncular artık sadece mekanik beceri değil, zihinsel dayanıklılık da geliştiriyor.",
      en: "Professional players are now developing not just mechanical skills but mental resilience as well."
    },
    content: {
      tr: "🕶️ E-spor Psikolojisi: Zihinsel Sağlık Artık Sahada\n\nRekabetin keskinleştiği 2025 e-spor sahnesinde artık yalnızca mekanik beceri değil, mental dayanıklılık da başarıyı belirliyor. Turnuva yoğunluğu, online baskı, sosyal medya linçleri derken, profesyonel oyuncular ciddi psikolojik destek programlarına yöneliyor.\n\nG2, NAVI ve T1 gibi önde gelen kulüpler, tam zamanlı spor psikologlarıyla çalışıyor. Bu psikologlar sadece stres yönetimi değil, performans odaklı nefes teknikleri, dikkat artırıcı meditasyonlar ve kriz anı müdahaleleri üzerine oyuncuları eğitiyor. Ayrıca bazı takımlar, maç öncesi görselleştirme seansları ile oyuncuların kendilerini zafere mental olarak hazırlamasını sağlıyor.\n\nLeague of Legends yıldızı Faker'ın bile artık haftalık terapi seanslarına katıldığı biliniyor. Bu, sektördeki tabuların yıkıldığını ve mental sağlığın artık birincil öncelik olduğunu gösteriyor.\n\nArtık şampiyon olmak, sadece iyi nişan almakla değil, zihinsel dengeni korumakla da mümkün.",
      en: "🕶️ Esports Psychology: Mental Health Now in the Field\n\nIn the sharpened competitive 2025 esports scene, success is determined not only by mechanical skill but also by mental resilience. With tournament intensity, online pressure, and social media attacks, professional players are turning to serious psychological support programs.\n\nLeading clubs like G2, NAVI, and T1 are working with full-time sports psychologists. These psychologists train players not just in stress management but in performance-focused breathing techniques, attention-enhancing meditations, and crisis moment interventions. Additionally, some teams provide pre-match visualization sessions to help players prepare themselves mentally for victory.\n\nIt's known that even League of Legends star Faker now attends weekly therapy sessions. This shows that taboos in the industry are being broken and mental health is now a primary priority.\n\nBecoming a champion is now possible not just by taking good aim but also by maintaining mental balance."
    },
    category: "technology"
  },
  {
    id: "14",
    slug: "f1-sprint-races-evolution",
    coverImage: "/images/blog/about14.jpg",
    thumbnailImage: "/images/blog/about14.jpg",
    publishDate: new Date(2025, 7, 20).toISOString(),
    author: {
      name: "Ahmet Yılmaz",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "⚡ F1 Sprint Yarışları: Tartışmalı Formatın Evrimi",
      en: "⚡ F1 Sprint Races: Evolution of the Controversial Format"
    },
    excerpt: {
      tr: "Sprint yarışları artık F1 takviminin zorunlu bir parçası olarak stratejik öneme sahip.",
      en: "Sprint races now have strategic importance as a mandatory part of the F1 calendar."
    },
    content: {
      tr: "⚡ F1 Sprint Yarışları: Tartışmalı Formatın Evrimi\n\n2025'te F1 Sprint yarışları artık daha fazla stratejik anlam taşıyor. Eskiden yalnızca kısa bir sıralama yarışı olarak görülen sprintler, şimdi şampiyona puanlarının %30'unu belirliyor. Bu da takımların sprint yarışlarını adeta ayrı bir GP gibi planlamasına yol açtı.\n\nYeni sprint formatında pit stop zorunlu hale geldi. Bu sayede takımlar, agresif lastik stratejileri ile öne çıkmaya başladı. Pirelli, sprint yarışları için özel olarak geliştirdiği \"SS-Compound\" lastikleri tanıttı. Bu lastikler, yalnızca 10-12 tur dayanıyor ama performans açısından yarışın kaderini değiştirecek kadar etkili.\n\nAyrıca sprint sıralaması, pazar günkü ana yarışın start grid'ine artık daha fazla etki ediyor. Bu nedenle sprint yarışlarında yaşanan bir hata, tüm hafta sonunu etkileyebiliyor. Özellikle Haas gibi orta sıra takımlar için sprintler, puan toplama fırsatının ta kendisi oldu.\n\nSprint formatı hâlâ tartışmalı ama 2025 itibarıyla F1'in vazgeçilmez bir parçası haline geldi.",
      en: "⚡ F1 Sprint Races: Evolution of the Controversial Format\n\nIn 2025, F1 Sprint races now carry more strategic significance. Formerly seen as just a short qualifying race, sprints now determine 30% of the championship points. This has led teams to plan sprint races almost as a separate GP.\n\nPit stops have become mandatory in the new sprint format. As a result, teams have started to stand out with aggressive tire strategies. Pirelli introduced its \"SS-Compound\" tires specially developed for sprint races. These tires only last 10-12 laps but are effective enough to change the fate of the race in terms of performance.\n\nAdditionally, sprint qualifying now has a greater impact on the starting grid for Sunday's main race. For this reason, an error in sprint races can affect the entire weekend. Especially for midfield teams like Haas, sprints have become the very opportunity to collect points.\n\nThe sprint format is still controversial but has become an indispensable part of F1 as of 2025."
    },
    category: "f1"
  },
  {
    id: "15",
    slug: "cs2-academies-digital-education",
    coverImage: "/images/blog/about15.jpg",
    thumbnailImage: "/images/blog/about15.jpg",
    publishDate: new Date(2025, 8, 1).toISOString(),
    author: {
      name: "Editor",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "💻 CS2 Akademileri: Yeni Nesil Oyuncular İçin Dijital Eğitim",
      en: "💻 CS2 Academies: Digital Education for Next-Gen Players"
    },
    excerpt: {
      tr: "Profesyonel CS2 takımları, geleceğin yıldızlarını yetiştirmek için dijital akademiler kurdu.",
      en: "Professional CS2 teams have established digital academies to train the stars of the future."
    },
    content: {
      tr: "💻 CS2 Akademileri: Yeni Nesil Oyuncular İçin Dijital Eğitim\n\n2025 yılında profesyonel CS2 sahnesine adım atmak isteyen gençler için artık en büyük fırsat: Dijital Espor Akademileri. G2, Astralis, ve FURIA gibi takımlar kendi online eğitim platformlarını başlatarak, yeni yetenekleri yetiştiriyor.\n\nBu akademiler, sadece oyun bilgisi değil; harita analizi, iletişim becerileri, mental hazırlık ve takım içi roller üzerine detaylı müfredat sunuyor. Eğitimler yapay zeka koçları tarafından anlık olarak analiz edilip geri bildirimle destekleniyor. Oyuncular, kendi oyunlarını yükleyip pozisyon hatalarını öğrenebiliyor.\n\nAkademi sistemi sayesinde artık bir oyuncunun potansiyelini fark etmek için LAN turnuvasına katılması gerekmiyor. Online olarak alınan bir \"Mentor Raporu\", kulüplerin scout ekipleri tarafından inceleniyor ve oyuncular sisteme dahil ediliyor.\n\n2025 itibarıyla espor artık şansa dayalı bir kariyer değil, yapılandırılmış ve eğitilmiş bir yolculuk.",
      en: "💻 CS2 Academies: Digital Education for Next-Gen Players\n\nFor young people who want to step into the professional CS2 scene in 2025, the biggest opportunity now is Digital Esports Academies. Teams like G2, Astralis, and FURIA are nurturing new talents by launching their own online education platforms.\n\nThese academies offer detailed curricula not just on game knowledge but also on map analysis, communication skills, mental preparation, and team roles. Training is analyzed in real-time by AI coaches and supported with feedback. Players can upload their own games and learn about their positioning mistakes.\n\nThanks to the academy system, a player no longer needs to participate in a LAN tournament for their potential to be recognized. A \"Mentor Report\" obtained online is reviewed by the clubs' scout teams, and players are incorporated into the system.\n\nAs of 2025, esports is no longer a career based on chance but a structured and trained journey."
    },
    category: "technology"
  },
  {
    id: "16",
    slug: "f1-documentary-mania",
    coverImage: "/images/blog/about16.jpg",
    thumbnailImage: "/images/blog/about16.jpg",
    publishDate: new Date(2025, 8, 10).toISOString(),
    author: {
      name: "Mehmet Aksoy",
      avatar: "/images/blog/avatar.webp"
    },
    title: {
      tr: "🎤 F1 Belgesel Çılgınlığı: Drive to Survive Etkisi Devam Ediyor",
      en: "🎤 F1 Documentary Mania: The Drive to Survive Effect Continues"
    },
    excerpt: {
      tr: "Formula 1, belgeseller sayesinde izleyici kitlesini genişletmeye devam ediyor.",
      en: "Formula 1 continues to expand its audience thanks to documentaries."
    },
    content: {
      tr: "🎤 F1 Belgesel Çılgınlığı: Drive to Survive Etkisi Devam Ediyor\n\nNetflix'in \"Drive to Survive\" belgesel serisinin ardından F1 dünyasına olan ilgi, 2025 yılında yeni belgesellerle artmaya devam ediyor. Amazon Prime'ın \"Racing Minds\" ve Apple TV'nin \"Inside The Garage\" gibi yapımları, perde arkasındaki teknik ve insani dramaları izleyiciyle buluşturuyor.\n\nBu belgeseller sayesinde artık sadece yarışlar değil, antrenmanlar, takım toplantıları, mühendis kararları ve hatta özel hayatlar bile izleyicinin ilgi odağı haline geldi. F1 sadece bir spor değil, bir hikâye anlatıcılığına dönüştü.\n\nTakımlar bile bu ilgiyi fırsata çevirdi. Mercedes, YouTube üzerinden kendi içerik serisini başlattı: \"Through the Pitwall\". Bu seride mühendisler, yarış stratejilerini izleyicilere anlatıyor.\n\nF1'in bu yeni medya stratejisi, genç izleyici kitlesini spora bağlamada büyük rol oynuyor. Artık bir F1 sezonu, sadece pistte değil, dijital platformlarda da yaşanıyor.",
      en: "🎤 F1 Documentary Mania: The Drive to Survive Effect Continues\n\nFollowing Netflix's \"Drive to Survive\" documentary series, interest in the F1 world continues to increase with new documentaries in 2025. Productions like Amazon Prime's \"Racing Minds\" and Apple TV's \"Inside The Garage\" bring the technical and human drama behind the scenes to viewers.\n\nThanks to these documentaries, not only races but also practices, team meetings, engineer decisions, and even private lives have become the focus of viewers' interest. F1 has transformed into not just a sport but storytelling.\n\nEven teams have turned this interest into an opportunity. Mercedes launched its own content series on YouTube: \"Through the Pitwall\". In this series, engineers explain race strategies to viewers.\n\nF1's new media strategy plays a major role in connecting the young audience to the sport. Now an F1 season is experienced not just on the track but on digital platforms as well."
    },
    category: "f1"
  }
];

export const getBlogs = () => {
  return blogPosts;
};

export const getBlogBySlug = (slug: string) => {
  return blogPosts.find(blog => blog.slug === slug);
};