import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { compare } from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const isValid = await compare(password, user.password || '');
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Вход выполнен успешно',
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