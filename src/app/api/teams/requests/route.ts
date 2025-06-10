import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import TeamRequest from '@/models/TeamRequest';
import Team from '@/models/Team';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  const status = searchParams.get('status');
  if (!teamId) return NextResponse.json({ error: 'teamId обязателен' }, { status: 400 });
  const filter: any = { team: teamId };
  if (status) filter.status = status;
  const requests = await TeamRequest.find(filter)
    .populate('user', 'name email image')
    .lean();
  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  await dbConnect();
  try {
    const { requestId, action } = await req.json();
    if (!requestId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'requestId и корректный action обязательны' }, { status: 400 });
    }
    const request = await TeamRequest.findById(requestId);
    if (!request) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();
    
    if (action === 'accept') {
      await Team.findByIdAndUpdate(request.team, {
        $addToSet: { members: request.user }
      });
    }
    
    return NextResponse.json({ request });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка обработки заявки' }, { status: 500 });
  }
} 