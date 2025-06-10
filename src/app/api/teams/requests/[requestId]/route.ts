import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongoose';
import { Team } from '@/models/Team';
import TeamRequest from '@/models/TeamRequest';
import User from '@/models/User';
import { Types } from 'mongoose';

// Handle join request (accept/reject)
export async function PATCH(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, teamId } = await request.json();
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the user (team captain)
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the team and verify captain
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (team.captain.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Only team captain can handle requests' },
        { status: 401 }
      );
    }

    // Get the request
    const teamRequest = await TeamRequest.findById(params.requestId);
    if (!teamRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Verify the request belongs to this team
    if (teamRequest.team.toString() !== teamId) {
      return NextResponse.json(
        { error: 'Request does not belong to this team' },
        { status: 400 }
      );
    }

    // Check if the request is already processed
    if (teamRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request already processed' },
        { status: 400 }
      );
    }

    // Update the request status
    teamRequest.status = status;
    await teamRequest.save();

    // If accepted, add the user to the team
    if (status === 'accepted') {
      // Check if user is already a member
      const isMember = team.members.some((member: Types.ObjectId) => 
        member.toString() === teamRequest.user.toString()
      );

      if (!isMember) {
        team.members.push(teamRequest.user);
        await team.save();
      }
    }

    return NextResponse.json(teamRequest);
  } catch (error) {
    console.error('Error updating team request:', error);
    return NextResponse.json(
      { error: 'Failed to update team request' },
      { status: 500 }
    );
  }
} 