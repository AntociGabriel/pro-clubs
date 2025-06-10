import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongoose';
import { Team } from '@/models/Team';

// Create a new team
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, logo } = await request.json();

    if (!name || !logo) {
      return NextResponse.json(
        { error: 'Name and logo are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      $or: [
        { captain: session.user.id },
        { members: session.user.id }
      ]
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You are already a member of a team' },
        { status: 400 }
      );
    }

    // Check if team name is already taken
    const teamWithSameName = await Team.findOne({ name });
    if (teamWithSameName) {
      return NextResponse.json(
        { error: 'Team name is already taken' },
        { status: 400 }
      );
    }

    const team = await Team.create({
      name,
      logo,
      captain: session.user.id,
      members: [session.user.id]
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}

// Get all teams
export async function GET() {
  try {
    await dbConnect();
    const teams = await Team.find()
      .populate('captain', 'email name nickname image')
      .populate('members', 'email name nickname image');

    return NextResponse.json(teams);
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
} 