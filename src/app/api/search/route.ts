// API stub — backend-developer specialist will implement.
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  return NextResponse.json({ results: { risd: [], met: [], query: q }, total: 0 })
}
