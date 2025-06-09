import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Team from '@/models/Team';

export async function PATCH(req: Request) {
  await dbConnect();
  try {
    const { teamId, userId } = await req.json();
    if (!teamId || !userId) {
      return NextResponse.json({ error: 'teamId и userId обязательны' }, { status: 400 });
    }
    const team = await Team.findById(teamId);
    if (!team) return NextResponse.json({ error: 'Команда не найдена' }, { status: 404 });
    if (team.captain.toString() === userId) {
      return NextResponse.json({ error: 'Нельзя удалить капитана' }, { status: 400 });
    }
    team.members = team.members.filter((id: any) => id.toString() !== userId);
    await team.save();
    return NextResponse.json({ message: 'Игрок удалён из команды' });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка удаления игрока' }, { status: 500 });
  }
} 