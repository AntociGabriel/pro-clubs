import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import TeamRequest from '@/models/TeamRequest';
import User from '@/models/User';
import Team from '@/models/Team';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { userId, teamId, platform, positions, message } = await req.json();
    if (!userId || !teamId || !platform || !positions || !Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
    }
    // Проверка на дубликат
    const exists = await TeamRequest.findOne({ user: userId, team: teamId, status: 'pending' });
    if (exists) {
      return NextResponse.json({ error: 'Заявка уже подана' }, { status: 400 });
    }
    const request = await TeamRequest.create({
      user: userId,
      team: teamId,
      platform,
      positions,
      message,
      status: 'pending',
    });
    return NextResponse.json({ request });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка подачи заявки' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { userId, teamId } = await req.json();
    if (!userId || !teamId) {
      return NextResponse.json({ error: 'userId и teamId обязательны' }, { status: 400 });
    }
    const request = await TeamRequest.findOneAndDelete({ user: userId, team: teamId, status: 'pending' });
    if (!request) {
      return NextResponse.json({ error: 'Заявка не найдена или уже обработана' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Заявка отозвана' });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка отзыва заявки' }, { status: 500 });
  }
} 