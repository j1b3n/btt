import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      console.log('[CLANKER] Error: Address parameter is missing');
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    console.log(`[CLANKER] Verifying token: ${address}`);

    const response = await fetch(`https://www.clanker.world/clanker/${address}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.log(`[CLANKER] API error: ${response.status}`);
      return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
    }

    const text = await response.text();
    const exists = !text.includes('Token Not Found');

    console.log(`[CLANKER] Token ${address} verification result: ${exists ? 'verified' : 'not found'}`);

    return NextResponse.json({ exists });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CLANKER] Verification error:', errorMessage);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}