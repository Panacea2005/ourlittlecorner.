import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID || ''
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing Spotify credentials' }, { status: 500 })
    }

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

    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: 'Token request failed', detail: t }, { status: 500 })
    }

    const data = await res.json()
    // Return token and expiry seconds
    return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


