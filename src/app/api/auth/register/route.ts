import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { email, name, password, image, platform, country, eaId, positions } = data;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  const user = await User.create({
    email,
    name,
    password: hashedPassword,
    image,
    platform,
    country,
    eaId,
    positions,
  });

  return NextResponse.json({
    message: 'Пользователь успешно зарегистрирован',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      platform: user.platform,
      country: user.country,
      eaId: user.eaId,
      positions: user.positions,
    }
  });
} 