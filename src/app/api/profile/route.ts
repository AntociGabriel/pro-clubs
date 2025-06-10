import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import { hash } from 'bcryptjs';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID пользователя обязателен' }, { status: 400 });
  }
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  // Находим команды, где пользователь является участником или капитаном
  const teams = await Team.find({
    $or: [
      { members: user._id },
      { captain: user._id }
    ]
  }).select('name logo photo members captain elo rating');

  return NextResponse.json({
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
    teams: teams.map(team => ({
      id: team._id,
      name: team.name,
      logo: team.logo,
      photo: team.photo,
      members: team.members,
      captain: team.captain,
      elo: team.elo,
      rating: team.rating
    }))
  });
}

export async function PUT(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { email, name, image, platform, country, positions, password } = data;
  if (!email) {
    return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
  }

  // Запрещаем изменение nickname и eaId
  if (data.nickname || data.eaId) {
    return NextResponse.json({ error: 'Нельзя изменить никнейм или EA ID' }, { status: 400 });
  }

  const updateData: any = { name, image, platform, country, positions };
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
    nickname: user.nickname,
    originId: user.originId,
    image: user.image,
    platform: user.platform,
    country: user.country,
    eaId: user.eaId,
    positions: user.positions,
  });
}