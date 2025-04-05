import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const response = await fetch(`https://www.clanker.world/clanker/${address}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const text = await response.text();
    const exists = !text.includes('Token Not Found');

    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error verifying CLANKER token:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}