import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  const users = await User.find({}, {
    email: 1,
    name: 1,
    country: 1,
    platform: 1,
    _id: 0
  }).lean();
  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { email, name, image, platform, country, eaId, positions } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
    }
    const updated = await User.findOneAndUpdate(
      { email },
      { name, image, platform, country, eaId, positions },
      { new: true, projection: { email: 1, name: 1, image: 1, platform: 1, country: 1, eaId: 1, positions: 1, _id: 0 } }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    return NextResponse.json({ user: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
} 