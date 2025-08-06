// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers(); // ✅ Await is necessary
  const userHeader = headersList.get('x-user');
  const isAuthenticated = headersList.get('x-authenticated') === 'true';

  if (isAuthenticated && userHeader) {
    try {
      const user = JSON.parse(userHeader);
      return NextResponse.json(user);
    } catch (error) {
      console.error('Failed to parse user header:', error);
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}