import { NextResponse } from 'next/server';
import { processDailyCutoff } from '@/lib/cron/cutoff-engine';

export async function GET(request: Request) {
  // Security check: verify this is a trusted cron job invocation using a secure secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing CRON_SECRET' }, { status: 401 });
  }

  try {
    const result = await processDailyCutoff();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Cutoff cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
