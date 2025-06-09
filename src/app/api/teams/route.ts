import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const team = await Team.findById(id)
      .populate('captain', 'name email image')
      .populate('members', 'name email image')
      .populate('requests', 'name email image')
      .lean();
    if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });
    return NextResponse.json({ team });
  }
  const teams = await Team.find()
    .populate('captain', 'name email image')
    .populate('members', 'name email image')
    .lean();
  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    let { name, logo, captainId, captainEmail } = body;
    if (!name || (!captainId && !captainEmail)) {
      return NextResponse.json({ error: 'Название и капитан обязательны' }, { status: 400 });
    }
    if (!captainId && captainEmail) {
      const user = await User.findOne({ email: captainEmail });
      if (!user) {
        return NextResponse.json({ error: 'Пользователь с таким email не найден' }, { status: 404 });
      }
      captainId = user._id;
    }
    // Капитан становится первым участником
    const team = await Team.create({
      name,
      logo,
      captain: captainId,
      members: [captainId],
      requests: [],
      elo: 1000,
    });
    return NextResponse.json({ team });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка создания команды' }, { status: 500 });
  }
} 