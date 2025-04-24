import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Event } from '@/data/events';

const eventsFilePath = path.join(process.cwd(), 'src/data/events/data.json');

// Tekil etkinlik getir
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const fileContents = await fs.readFile(eventsFilePath, 'utf8');
    const events = JSON.parse(fileContents) as Event[];
    
    const event = events.find((event) => event.slug === slug);
    
    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
    }
    
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error('Etkinlik getirme hatası:', error);
    return NextResponse.json({ error: 'Etkinlik getirilemedi.' }, { status: 500 });
  }
}

// Etkinlik güncelle
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const updatedEvent = await request.json() as Event;
    
    const fileContents = await fs.readFile(eventsFilePath, 'utf8');
    const events = JSON.parse(fileContents) as Event[];
    
    const index = events.findIndex((event) => event.slug === slug);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
    }
    
    // Farklı bir slug kullanılacaksa, bu slug'ın benzersiz olduğundan emin ol
    if (updatedEvent.slug !== slug && 
        events.some(event => event.slug === updatedEvent.slug)) {
      return NextResponse.json(
        { error: 'Bu slug ile başka bir etkinlik zaten var.' },
        { status: 400 }
      );
    }
    
    // Etkinliği güncelle
    events[index] = updatedEvent;
    
    // Dosyaya kaydet
    await fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), 'utf8');
    
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Etkinlik güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Etkinlik güncellenemedi.' },
      { status: 500 }
    );
  }
}

// Etkinlik sil
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const fileContents = await fs.readFile(eventsFilePath, 'utf8');
    const events = JSON.parse(fileContents) as Event[];
    
    const filteredEvents = events.filter((event) => event.slug !== slug);
    
    // Eğer filtreleme sonrası dizi boyutu değişmediyse, etkinlik bulunamadı
    if (filteredEvents.length === events.length) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
    }
    
    // Dosyaya kaydet
    await fs.writeFile(eventsFilePath, JSON.stringify(filteredEvents, null, 2), 'utf8');
    
    return NextResponse.json({ message: 'Etkinlik başarıyla silindi.' }, { status: 200 });
  } catch (error) {
    console.error('Etkinlik silme hatası:', error);
    return NextResponse.json({ error: 'Etkinlik silinemedi.' }, { status: 500 });
  }
}