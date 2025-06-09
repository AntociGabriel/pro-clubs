import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Создаем тестового пользователя
    const testUser = new User({
      email: 'test@example.com',
      name: 'Test User',
    });
    
    await testUser.save();
    
    // Получаем всех пользователей
    const users = await User.find({});
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Подключение к MongoDB успешно!',
      users: users
    });
  } catch (error) {
    console.error('Ошибка при подключении к MongoDB:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Ошибка при подключении к MongoDB',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 