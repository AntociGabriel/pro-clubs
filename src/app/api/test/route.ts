import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json({ 
      status: 'ok', 
      message: 'API работает!',
      usersCount: users.length 
    });
  } catch (error) {
    console.error('Ошибка при подключении к MongoDB:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Ошибка при подключении к MongoDB' 
    }, { status: 500 });
  }
} 