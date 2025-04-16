import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // TODO: Replace with your actual authentication logic
    // This is a temporary implementation
    if (email === 'test@example.com' && password === 'password') {
      const token = jwt.sign(
        { 
          userId: '123', 
          email, 
          role: 'user' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 // 1 hour
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: '123',
          email,
          role: 'user'
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
