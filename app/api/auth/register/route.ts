import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = createUser({
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date()
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
