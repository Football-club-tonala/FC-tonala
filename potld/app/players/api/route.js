import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM players ORDER BY number ASC;`;
    return NextResponse.json({ players: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { name, number, size } = await request.json();

  if (!name || !number || !size) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  try {
    await sql`INSERT INTO players (name, number, size) VALUES (${name}, ${number}, ${size});`;
    return NextResponse.json({ message: 'Jugador registrado' }, { status: 201 });
  } catch (error) {
    if (error.code === '23505') { 
      return NextResponse.json({ error: 'El número de camiseta ya está en uso.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
