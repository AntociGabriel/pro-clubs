import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import Team from "@/models/Team";
import { dbConnect } from "@/lib/mongoose";

interface LeaveTeamResponse {
  success?: boolean;
  error?: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    console.log('Session in API route:', session);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt - no session email');
      console.log('Available cookies:', req.headers.get('cookie'));
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { teamId } = await req.json();
    if (!teamId) {
      return NextResponse.json({ error: "Не указан ID команды" }, { status: 400 });
    }

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Находим команду
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Команда не найдена" }, { status: 404 });
    }

    // Проверяем, что пользователь состоит в команде
    if (!team.members.includes(user._id)) {
      return NextResponse.json({ error: "Вы не состоите в этой команде" }, { status: 403 });
    }

    // Удаляем пользователя из команды
    team.members = team.members.filter((memberId: Types.ObjectId) => !memberId.equals(user._id));
    await team.save();

    // Обновляем команду пользователя
    user.team = null;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}