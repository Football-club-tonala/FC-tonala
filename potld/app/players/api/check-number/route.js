import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number');

  if (!number) {
    return NextResponse.json({ error: 'Número es requerido' }, { status: 400 });
  }

  try {
    const { rows } = await sql`SELECT 1 FROM players WHERE number = ${number};`;
    const isTaken = rows.length > 0;
    return NextResponse.json({ isTaken }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}