import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { Team } from '@/models/Team';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const member = searchParams.get('member');

    if (!member) {
      return NextResponse.json({ error: 'Member email is required' }, { status: 400 });
    }

    const team = await Team.findOne({
      $or: [
        { 'members.email': member },
        { 'captain.email': member }
      ]
    })
    .populate('captain', 'email name nickname image')
    .populate('members', 'email name nickname image');

    if (!team) {
      return NextResponse.json(null);
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error searching team:', error);
    return NextResponse.json(
      { error: 'Failed to search team' },
      { status: 500 }
    );
  }
}