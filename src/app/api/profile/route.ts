import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { Team } from '@/models/Team';
import TeamRequest from '@/models/TeamRequest';
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

  // Find current team where user is a member or captain
  const currentTeam = await Team.findOne({
    $or: [
      { members: user._id },
      { captain: user._id }
    ]
  }).select('name logo members captain elo rating');

  // Find all teams where user was a member (including current team)
  const teamHistory = await Team.find({
    $or: [
      { members: user._id },
      { captain: user._id }
    ]
  })
  .select('name logo members captain elo rating createdAt')
  .sort({ createdAt: -1 });

  // Find all team requests for this user
  const teamRequests = await TeamRequest.find({
    user: user._id,
    status: { $in: ['accepted', 'rejected'] }
  })
  .populate('team', 'name logo')
  .sort({ createdAt: -1 });

  return NextResponse.json({
    id: user._id,
    email: user.email,
    name: user.name || null,
    nickname: user.nickname || null,
    originId: user.originId || null,
    image: user.image || null,
    platform: user.platform || null,
    country: user.country || null,
    eaId: user.eaId || null,
    positions: user.positions || [],
    currentTeam: currentTeam ? {
      id: currentTeam._id,
      name: currentTeam.name,
      logo: currentTeam.logo,
      members: currentTeam.members,
      captain: currentTeam.captain,
      elo: currentTeam.elo,
      rating: currentTeam.rating
    } : null,
    teamHistory: teamHistory.map(team => ({
      id: team._id,
      name: team.name,
      logo: team.logo,
      members: team.members,
      captain: team.captain,
      elo: team.elo,
      rating: team.rating,
      joinedAt: team.createdAt
    })),
    teamRequests: teamRequests.map(request => ({
      id: request._id,
      team: request.team,
      status: request.status,
      createdAt: request.createdAt
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
    name: user.name || null,
    nickname: user.nickname || null,
    originId: user.originId || null,
    image: user.image || null,
    platform: user.platform || null,
    country: user.country || null,
    eaId: user.eaId || null,
    positions: user.positions || [],
  });
}