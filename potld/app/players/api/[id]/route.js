import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { id } = params;
  const { name, number, size } = await request.json();

  if (!name || !number || !size) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  try {
    await sql`UPDATE players SET name = ${name}, number = ${number}, size = ${size} WHERE id = ${id};`;
    return NextResponse.json({ message: 'Jugador actualizado' }, { status: 200 });
  } catch (error) {
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Ese número ya está en uso por otro jugador.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await sql`DELETE FROM players WHERE id = ${id};`;
    return NextResponse.json({ message: 'Jugador eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}