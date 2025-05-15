import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve(process.cwd(), 'src/data/simulatorPrices.json');

interface SimulatorPrice {
  id: string;
  name: string;
  pricePerHour: number;
}

interface PriceData {
  simulators: SimulatorPrice[];
}

export async function GET() {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    const data: PriceData = JSON.parse(jsonData);
    // Eğer bookingDefaults hala dosyada varsa, temizleyip gönderelim.
    // Bu, eski yapıdan yeni yapıya geçişte yardımcı olabilir.
    if ((data as any).bookingDefaults) {
      delete (data as any).bookingDefaults;
      // İsteğe bağlı: Temizlenmiş halini dosyaya geri yazabiliriz ama GET için şart değil.
      // fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading price data:', error);
    return NextResponse.json({ message: 'Error reading price data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newPriceData: PriceData = await request.json();
    
    // Gelen veriyi doğrula: Sadece simulators alanı olmalı
    if (!newPriceData.simulators || !Array.isArray(newPriceData.simulators)) {
      return NextResponse.json({ message: 'Invalid data format: simulators array is required' }, { status: 400 });
    }

    // Her simülatörün gerekli alanlara sahip olduğunu ve pricePerHour'ın sayı olduğunu doğrula
    for (const sim of newPriceData.simulators) {
      if (typeof sim.id !== 'string' || typeof sim.name !== 'string' || typeof sim.pricePerHour !== 'number' || sim.pricePerHour < 0) {
        return NextResponse.json({ message: 'Invalid simulator data format' }, { status: 400 });
      }
    }
    // bookingDefaults gibi istenmeyen alanların olmadığından emin olalım.
    const finalData: PriceData = { simulators: newPriceData.simulators };

    fs.writeFileSync(dataFilePath, JSON.stringify(finalData, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error updating price data:', error);
    // console.error(error) instanceof SyntaxError // JSON parse hatası olup olmadığını kontrol edebiliriz.
    return NextResponse.json({ message: 'Error updating price data' }, { status: 500 });
  }
} 