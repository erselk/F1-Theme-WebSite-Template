require('dotenv').config(); // .env dosyasındaki değişkenleri yükle

// .env dosyasının doğru yüklendiğini ve DATABASE_URL'in mevcut olduğunu kontrol et
console.log('dotenv tarafından yüklenen DATABASE_URL:', process.env.DATABASE_URL);

// test-prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Yeni bir mesaj oluşturuluyor...');
    const newMessage = await prisma.contactMessage.create({
      data: {
        name: 'Test Kullanıcısı Script',
        email: 'test-script@example.com',
        subject: 'Test Script Konusu',
        message: 'Bu script tarafından oluşturulmuş bir test mesajıdır.',
      },
    });
    console.log('Oluşturulan Mesaj (script):', newMessage);

    if (newMessage && newMessage.id) { // ID varlığını kontrol edelim
      console.log('Mesaj başarıyla oluşturuldu ve ID içeriyor. ID:', newMessage.id);
    } else {
      console.error('HATA: Mesaj oluşturuldu ancak ID içermiyor veya boş/eksik bir obje döndü. Dönen obje:', newMessage);
    }

  } catch (e) {
    console.error('Script çalışırken hata oluştu:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 