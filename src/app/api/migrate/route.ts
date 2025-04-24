import { NextRequest, NextResponse } from 'next/server';
import { migrateAllData } from '@/lib/db/migrateData';

// This route is used to migrate data from file-based storage to MongoDB
// Should be protected in production

export async function GET(req: NextRequest) {
  try {
    // In production, you'd want to add authentication here
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    const result = await migrateAllData();
    
    return NextResponse.json({
      success: true,
      message: 'Data migration completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Migration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Data migration failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}