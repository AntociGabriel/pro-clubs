import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { hash } from 'bcryptjs';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }
  return NextResponse.json({
    id: user._id,
    email: user.email,
    name: user.name,
    image: user.image,
    platform: user.platform,
    country: user.country,
    eaId: user.eaId,
    positions: user.positions,
  });
}

export async function PUT(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { email, name, image, platform, country, eaId, positions, password } = data;
  if (!email) {
    return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
  }
  const updateData: any = { name, image, platform, country, eaId, positions };
  if (password) {
    updateData.password = await hash(password, 10);
  }
  const user = await User.findOneAndUpdate(
    { email },
    updateData,
    { new: true }
  );
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }
  return NextResponse.json({
    id: user._id,
    email: user.email,
    name: user.name,
    image: user.image,
    platform: user.platform,
    country: user.country,
    eaId: user.eaId,
    positions: user.positions,
  });
} 