import { NextResponse } from 'next/server';
import { processDailyCutoff } from '@/lib/cron/cutoff-engine';

export async function GET(request: Request) {
  // Security check: verify this is a trusted cron job invocation using a secure secret
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processDailyCutoff();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Cutoff cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
