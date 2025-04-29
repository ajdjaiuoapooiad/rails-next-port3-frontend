import { NextResponse, NextRequest } from 'next/server';

interface LoginResponseSuccess {
  token: string;
  user: { id: number };
}

interface LoginResponseError {
  error: string;
}

type LoginResponse = LoginResponseSuccess | LoginResponseError;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/login'; // Rails API のログインエンドポイント
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return new NextResponse(JSON.stringify({ error: 'API URLが設定されていません。' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await apiResponse.json();

    if (apiResponse.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new NextResponse(JSON.stringify(data), {
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('APIエラー:', error);
    return new NextResponse(JSON.stringify({ error: 'サーバーエラーが発生しました。' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}