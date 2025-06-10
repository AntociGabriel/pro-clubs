import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { hash } from 'bcryptjs';

const EA_ID_REGEX = /^[A-Z]{3}\d{3}$/;

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { email, name, nickname, originId, password, image, platform, country, eaId, positions } = data;

  if (!email || !password || !nickname || !eaId) {
    return NextResponse.json({ error: 'Email, пароль, никнейм и EA ID обязательны' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Пароль должен быть не менее 8 символов' }, { status: 400 });
  }

  if (!EA_ID_REGEX.test(eaId)) {
    return NextResponse.json({ error: 'EA ID должен быть в формате ABC123 (3 буквы + 3 цифры)' }, { status: 400 });
  }

  const [existingEmail, existingNickname, existingEaId] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ nickname }),
    User.findOne({ eaId })
  ]);

  if (existingEmail) {
    return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
  }

  if (existingNickname) {
    return NextResponse.json({ error: 'Этот никнейм уже занят' }, { status: 409 });
  }

  if (existingEaId) {
    return NextResponse.json({ error: 'Этот EA ID уже используется' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  const user = await User.create({
    email,
    name,
    nickname,
    originId,
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
      nickname: user.nickname,
      originId: user.originId,
      image: user.image,
      platform: user.platform,
      country: user.country,
      eaId: user.eaId,
      positions: user.positions,
    }
  });
}