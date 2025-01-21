/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextRequest, NextResponse } from 'next/server';
import { token } from '@/lib/auth'; 

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json(); 

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const authToken = token(userId as string);

    return NextResponse.json({ authToken }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}