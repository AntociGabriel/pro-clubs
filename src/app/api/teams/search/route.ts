import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const platform = searchParams.get('platform');
    const country = searchParams.get('country');
    const member = searchParams.get('member');

    const filter: any = {};
    if (query) filter.name = { $regex: query, $options: 'i' };
    if (platform) filter['members.platform'] = platform;
    if (country) filter['members.country'] = country;
    
    if (member) {
      const user = await User.findOne({ email: member }).select('_id');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      filter.members = user._id;
    }

    const teams = await Team.find(filter)
      .populate('captain', 'name email image')
      .populate('members', 'name email image platform country')
      .lean();
    return NextResponse.json({ teams });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}