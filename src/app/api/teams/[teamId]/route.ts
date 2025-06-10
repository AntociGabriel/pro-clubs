import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Team from '@/models/Team'
import { dbConnect } from '@/lib/mongoose'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    console.log('GET /api/teams/[teamId] params:', params)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    console.log('Searching for team with ID:', params.teamId)
    
    if (!mongoose.Types.ObjectId.isValid(params.teamId)) {
      console.log('Invalid team ID format:', params.teamId)
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
    }
    
    const team = await Team.findById(params.teamId)
      .populate('captain', 'name email image')
      .populate('members', 'name image')
    
    if (!team) {
      console.log('Team not found with ID:', params.teamId)
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }
    console.log('Found team:', team)

    return NextResponse.json(team)
  } catch (error) {
    console.error('GET /api/teams/[teamId] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { name, platform, country } = await request.json()
    
    if (!name || !platform || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newTeam = new Team({
      name,
      platform,
      country,
      captain: session.user.id,
      members: [session.user.id]
    })
    await newTeam.save()

    // Update user's team reference
    await User.findByIdAndUpdate(session.user.id, { team: newTeam._id })

    return NextResponse.json(newTeam)
  } catch (error) {
    console.error('POST /api/teams error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const team = await Team.findById(params.teamId)
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.captain.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only captain can edit team' }, { status: 403 })
    }

    const { name, platform, country } = await request.json()
    const updates: any = {}
    if (name) updates.name = name
    if (platform) updates.platform = platform
    if (country) updates.country = country

    const updatedTeam = await Team.findByIdAndUpdate(
      params.teamId,
      updates,
      { new: true }
    )

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('PUT /api/teams error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const team = await Team.findById(params.teamId)
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.captain.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only captain can delete team' }, { status: 403 })
    }

    // Remove team reference from all members
    await User.updateMany(
      { _id: { $in: team.members } },
      { $unset: { team: 1 } }
    )

    await Team.findByIdAndDelete(params.teamId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/teams error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}