import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
  const user = await User.findOne({ email }, { _id: 1, name: 1, email: 1, image: 1 }).lean();
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  return NextResponse.json({ user });
} 