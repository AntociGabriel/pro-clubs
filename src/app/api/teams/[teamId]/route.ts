import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Team } from '@/models/Team'
import { dbConnect } from '@/lib/mongoose'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    await dbConnect()
    const team = await Team.findById(params.teamId)
      .populate('captain', 'email name nickname image')
      .populate('members', 'email name nickname image')

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch team' 
    }, { status: 500 })
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