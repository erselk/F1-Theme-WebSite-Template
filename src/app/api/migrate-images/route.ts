import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/db/mongodb';
import { uploadFileToGridFS } from '@/lib/file-uploader';

export async function GET(request: NextRequest) {
  try {
    // MongoDB'ye bağlan
    const { db } = await connectMongo();
    
    // Images koleksiyonundan verileri çek
    const imagesCollection = db.collection('images');
    const images = await imagesCollection.find({}).toArray();
    
    console.log(`Found ${images.length} images in 'images' collection`);
    
    // Sonuçları sakla
    const results = {
      total: images.length,
      migrated: 0,
      failed: 0,
      errors: []
    };
    
    // Her bir görsel için GridFS'e yükle
    for (const image of images) {
      try {
        // Base64 veriyi buffer'a dönüştür
        const base64Data = image.data.split(';base64,').pop();
        if (!base64Data) {
          throw new Error(`Invalid base64 data for image ${image._id}`);
        }
        
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Görsel kategorisini tanımla (varsayılan olarak gallery)
        let category = 'gallery';
        
        // Dosya adını oluştur
        const filename = `migrated_${category}_${image.name || 'unknown'}`;
        
        // GridFS'e yükle
        const fileId = await uploadFileToGridFS(buffer, filename, image.type || 'image/jpeg');
        
        console.log(`Migrated image ${image._id} to GridFS with ID ${fileId}`);
        results.migrated++;
      } catch (error) {
        console.error(`Failed to migrate image ${image._id}:`, error);
        results.failed++;
        results.errors.push({
          id: image._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to migrate images', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 