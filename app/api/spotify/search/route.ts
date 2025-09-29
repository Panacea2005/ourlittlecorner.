import { NextRequest, NextResponse } from 'next/server'

async function getToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || ''
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
  const body = new URLSearchParams()
  body.append('grant_type', 'client_credentials')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to get token')
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    if (!q) return NextResponse.json({ items: [] })
    const { access_token } = await getToken()
    const api = `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(q)}`
    const res = await fetch(api, { headers: { Authorization: `Bearer ${access_token}` }, cache: 'no-store' })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: 'Search failed', detail: t }, { status: 500 })
    }
    const data = await res.json()
    const items = (data?.tracks?.items || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      artists: t.artists?.map((a: any) => a.name)?.join(', '),
      preview_url: t.preview_url, // 30s preview
      external_url: t.external_urls?.spotify,
      image: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
    }))
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


