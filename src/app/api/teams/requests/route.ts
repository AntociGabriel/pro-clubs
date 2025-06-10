import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongoose';
import { Team } from '@/models/Team';
import TeamRequest, { ITeamRequest } from '@/models/TeamRequest';
import User from '@/models/User';
import { Types } from 'mongoose';

// Create a join request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { teamId, message } = await request.json();
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member or captain
    const isMember = team.members.some((member: Types.ObjectId) => member.toString() === user._id.toString());
    const isCaptain = team.captain.toString() === user._id.toString();
    if (isMember || isCaptain) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await TeamRequest.findOne({
      user: user._id,
      team: team._id,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this team' },
        { status: 400 }
      );
    }

    // Create the request
    const teamRequest = await TeamRequest.create({
      user: user._id,
      team: team._id,
      message: message || '',
      status: 'pending'
    });

    return NextResponse.json(teamRequest);
  } catch (error) {
    console.error('Error creating team request:', error);
    return NextResponse.json(
      { error: 'Failed to create team request' },
      { status: 500 }
    );
  }
}

// Get all requests for a team (only for team captain)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    await dbConnect();

    // Get the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If teamId is provided, get requests for that team
    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      // Check if user is the team captain
      if (team.captain.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const requests = await TeamRequest.find({ team: teamId })
        .populate('user', 'email name nickname image')
        .sort({ createdAt: -1 });

      return NextResponse.json(requests);
    }

    // Otherwise, get all requests for the user
    const requests = await TeamRequest.find({ user: user._id })
      .populate('team', 'name logo')
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching team requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team requests' },
      { status: 500 }
    );
  }
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