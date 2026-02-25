import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { unixTime } = await req.json()
  return NextResponse.json({ unixTime })
}

export async function GET() {
  return NextResponse.json({ unixTime: Date.now() })
}
